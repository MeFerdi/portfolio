import type { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  // Liveness only: there are no external dependencies to probe yet (mocks are in-process).
  app.get('/health', async () => ({ status: 'ok' }));
}
