import { createHash } from 'node:crypto';
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import { z } from 'zod';
import type { Ingestor, IngestOutcome } from '../events/ingest';
import type { UserDirectory } from '../users/directory';
import { createProjectOutcome, inviteOutcome, paymentOutcome, verifyEmailOutcome } from './actions';

export interface AppDeps {
  ingestor: Ingestor;
  users: UserDirectory;
  now?: () => Date;
  logger?: boolean;
}

const UserParams = z.object({ userId: z.string().min(1) });

/**
 * Mock SaaS backend: onboarding actions that emit typed events through the same
 * Ingestor as the raw POST /events endpoint, so there is exactly one write path.
 */
export function buildApp(deps: AppDeps): FastifyInstance {
  const app = Fastify({ logger: deps.logger ?? false });
  const now = deps.now ?? (() => new Date());
  // Per-user counters for quota rules; demo state only, lost on restart.
  const projectCounts = new Map<string, number>();
  const seatCounts = new Map<string, number>();

  app.get('/health', async () => ({ ok: true }));

  app.post('/events', async (req, reply) => respond(reply, await deps.ingestor.ingest(req.body)));

  app.post('/signup', async (req, reply) => {
    const key = idempotencyKey(req, reply);
    if (!key) return reply;
    const body = z.object({ email: z.email(), name: z.string().max(100).optional() }).safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: 'invalid body', issues: body.error.issues });
    // Derived from the idempotency key so a retried signup resolves to the same user.
    const userId = createHash('sha256').update(key).digest('hex').slice(0, 24);
    await deps.users.create({ id: userId, email: body.data.email, name: body.data.name ?? null });
    return respond(reply, await emit(userId, key, { type: 'signed_up' }), { userId });
  });

  const action = <B extends z.ZodType>(
    path: string,
    bodySchema: B,
    decide: (userId: string, body: z.infer<B>) => { type: string; reason?: string },
  ) =>
    app.post(path, async (req, reply) => {
      const key = idempotencyKey(req, reply);
      if (!key) return reply;
      const params = UserParams.parse(req.params);
      const body = bodySchema.safeParse(req.body ?? {});
      if (!body.success) return reply.code(400).send({ error: 'invalid body', issues: body.error.issues });
      if (!(await deps.users.get(params.userId))) return reply.code(404).send({ error: 'unknown user' });
      return respond(reply, await emit(params.userId, key, decide(params.userId, body.data)));
    });

  action('/users/:userId/verify-email', z.object({ token: z.string() }), (_u, b) => verifyEmailOutcome(b.token));
  action('/users/:userId/projects', z.object({ name: z.string() }), (userId, b) => {
    const outcome = createProjectOutcome(b.name, projectCounts.get(userId) ?? 0);
    if (outcome.type === 'project_created') projectCounts.set(userId, (projectCounts.get(userId) ?? 0) + 1);
    return outcome;
  });
  action('/users/:userId/invites', z.object({ email: z.string() }), (userId, b) => {
    const outcome = inviteOutcome(b.email, seatCounts.get(userId) ?? 0);
    if (outcome.type === 'teammate_invited') seatCounts.set(userId, (seatCounts.get(userId) ?? 0) + 1);
    return outcome;
  });
  action('/users/:userId/payment-methods', z.object({ cardToken: z.string() }), (_u, b) => paymentOutcome(b.cardToken));
  action('/users/:userId/first-success', z.object({}), () => ({ type: 'first_success_reached' }));

  function emit(userId: string, key: string, outcome: { type: string; reason?: string }) {
    // Validated by the Ingestor like any external event.
    return deps.ingestor.ingest({ ...outcome, userId, idempotencyKey: key, occurredAt: now().toISOString() });
  }

  return app;
}

function idempotencyKey(req: FastifyRequest, reply: FastifyReply): string | undefined {
  const key = req.headers['idempotency-key'];
  if (typeof key === 'string' && key.length >= 8 && key.length <= 200) return key;
  void reply.code(400).send({ error: 'Idempotency-Key header (8-200 chars) is required' });
  return undefined;
}

function respond(reply: FastifyReply, outcome: IngestOutcome, extra: Record<string, unknown> = {}) {
  switch (outcome.status) {
    case 'accepted':
      return reply.code(202).send({ eventId: outcome.event.id, type: outcome.event.type, ...extra });
    case 'duplicate':
      return reply.code(200).send({ eventId: outcome.event.id, type: outcome.event.type, duplicate: true, ...extra });
    case 'conflict':
      return reply.code(409).send({ error: 'idempotency key already used for a different event' });
    case 'invalid':
      return reply.code(400).send({ error: 'invalid event', issues: outcome.issues });
  }
}
