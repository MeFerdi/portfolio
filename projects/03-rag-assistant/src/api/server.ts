import Fastify, { type FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { Container } from '../container';

const AskBody = z.object({ question: z.string().trim().min(3).max(2000) });
const IngestBody = z.object({
  documents: z
    .array(z.object({ source: z.string().min(1).max(500), content: z.string().min(1).max(2_000_000) }))
    .min(1)
    .max(100),
});

export function buildServer(container: Pick<Container, 'ask' | 'ingest' | 'store'>): FastifyInstance {
  const app = Fastify({ logger: false, bodyLimit: 10 * 1024 * 1024 });

  app.get('/health', async () => ({ status: 'ok', chunks: await container.store.countChunks() }));

  app.post('/ask', async (req, reply) => {
    const body = AskBody.safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: z.prettifyError(body.error) });
    const { answer, citations, status, reason } = await container.ask.ask(body.data.question);
    return { answer, citations, status, ...(reason ? { reason } : {}) };
  });

  // Unauthenticated by design for local use; put it behind auth before exposing it.
  app.post('/ingest', async (req, reply) => {
    const body = IngestBody.safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: z.prettifyError(body.error) });
    return container.ingest.ingest(body.data.documents);
  });

  return app;
}
