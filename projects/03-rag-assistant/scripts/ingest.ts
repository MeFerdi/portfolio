// Usage: npm run ingest -- [dir=corpus]   (VECTOR_STORE=pg to persist)
import path from 'node:path';
import { loadEnv } from '../src/config/env';
import { buildContainer } from '../src/container';
import { loadCorpusDir } from '../src/ingest/load-corpus';
import { logger } from '../src/lib/logger';

async function main(): Promise<void> {
  const env = loadEnv();
  const { ingest, store } = buildContainer(env);
  const dir = path.resolve(process.argv[2] ?? 'corpus');
  const summary = await ingest.ingest(await loadCorpusDir(dir));
  logger.info({ store: env.VECTOR_STORE, ...summary }, 'ingest complete');
  await store.close();
}

main().catch((err: unknown) => {
  logger.fatal({ err }, 'ingest failed');
  process.exit(1);
});
