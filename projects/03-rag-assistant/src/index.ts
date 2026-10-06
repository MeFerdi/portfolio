import path from 'node:path';
import { buildServer } from './api/server';
import { loadEnv } from './config/env';
import { buildContainer } from './container';
import { loadCorpusDir } from './ingest/load-corpus';
import { logger } from './lib/logger';

async function main(): Promise<void> {
  const env = loadEnv();
  const container = buildContainer(env);
  if (env.VECTOR_STORE === 'memory') {
    // Nothing persists in memory mode, so seed from the sample corpus on boot.
    const summary = await container.ingest.ingest(await loadCorpusDir(path.resolve('corpus')));
    logger.info({ chunks: summary.totalChunks }, 'seeded in-memory store from corpus/');
  }
  const app = buildServer(container);
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
  logger.info({ port: env.PORT, store: env.VECTOR_STORE, embedder: container.embedder.name }, 'listening');

  const shutdown = async () => {
    await app.close();
    await container.store.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err: unknown) => {
  logger.fatal({ err }, 'startup failed');
  process.exit(1);
});
