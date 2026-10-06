import Fastify, { type FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { ConversationStore } from './agent/conversation-store';
import { AgentRunner } from './agent/runner';
import { HttpError } from './lib/errors';
import { type Clock, systemClock } from './lib/clock';
import { AgentModelError, type AgentModel } from './llm/agent-model';
import { type MockBackends, seedBackends } from './mocks/seed';
import { ToolGateway } from './policy/gateway';
import { PendingActionStore } from './policy/pending-actions';
import { ToolRateLimiter } from './policy/rate-limit';
import { ToolRegistry } from './tools/registry';
import { chatRoutes } from './http/routes/chat';
import { healthRoutes } from './http/routes/health';

export interface PolicyConfig {
  pendingActionTtlMs: number;
  rateLimit: { capacity: number; refillPerMinute: number };
  maxSteps: number;
}

export const DEFAULT_POLICY: PolicyConfig = {
  pendingActionTtlMs: 5 * 60_000,
  rateLimit: { capacity: 10, refillPerMinute: 6 },
  maxSteps: 6,
};

export interface AppDeps {
  model: AgentModel;
  backends?: MockBackends;
  clock?: Clock;
  policy?: Partial<PolicyConfig>;
  logger?: boolean;
}

export function buildApp(deps: AppDeps): FastifyInstance {
  const policy = { ...DEFAULT_POLICY, ...deps.policy };
  const clock = deps.clock ?? systemClock;
  const backends = deps.backends ?? seedBackends();

  const registry = new ToolRegistry();
  const gateway = new ToolGateway(
    registry,
    backends,
    new PendingActionStore(clock, policy.pendingActionTtlMs),
    new ToolRateLimiter(policy.rateLimit, clock),
    clock,
  );
  const runner = new AgentRunner(deps.model, gateway, registry, policy.maxSteps);

  const app = Fastify({
    logger: deps.logger === false ? false : { level: process.env.LOG_LEVEL ?? 'info', redact: ['req.headers.authorization'] },
  });

  app.setErrorHandler((err, request, reply) => {
    if (err instanceof HttpError) return reply.status(err.statusCode).send({ error: err.code, message: err.message });
    if (err instanceof ZodError) return reply.status(400).send({ error: 'invalid_request', issues: err.issues });
    if (err instanceof AgentModelError) {
      request.log.error({ status: err.status, err: err.cause ?? err }, 'agent model unavailable');
      return reply.status(503).send({ error: 'agent_unavailable', message: 'The assistant is temporarily unavailable. Please try again.' });
    }
    request.log.error(err);
    return reply.status(500).send({ error: 'internal_error' });
  });

  app.register(healthRoutes);
  app.register(chatRoutes({ auth: backends.auth, conversations: new ConversationStore(), runner, gateway }));
  return app;
}
