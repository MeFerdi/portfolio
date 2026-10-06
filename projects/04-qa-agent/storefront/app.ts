import formbody from '@fastify/formbody';
import Fastify, { type FastifyInstance } from 'fastify';
import type { Fault } from './faults';
import { registerCartRoutes } from './routes/cart';
import { registerCheckoutRoutes } from './routes/checkout';
import { registerLoginRoutes } from './routes/login';
import { registerProductRoutes } from './routes/products';
import { InMemoryStore } from './store';

export interface StorefrontDeps {
  store: InMemoryStore;
  fault: Fault | null;
}

export interface StorefrontOptions {
  fault?: Fault | null;
  store?: InMemoryStore;
  logger?: boolean;
}

export function buildStorefront(options: StorefrontOptions = {}): FastifyInstance {
  const deps: StorefrontDeps = { store: options.store ?? new InMemoryStore(), fault: options.fault ?? null };
  const app = Fastify({ logger: options.logger ?? false });
  void app.register(formbody);

  app.get('/health', async () => ({ ok: true, fault: deps.fault }));
  registerLoginRoutes(app, deps);
  registerProductRoutes(app, deps);
  registerCartRoutes(app, deps);
  registerCheckoutRoutes(app, deps);
  return app;
}
