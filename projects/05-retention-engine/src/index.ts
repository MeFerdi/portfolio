import { Redis } from 'ioredis';
import { buildApp } from './app/server';
import { loadEnv } from './config/env';
import { createPool } from './db/pool';
import { Ingestor } from './events/ingest';
import { PgEventStore } from './events/pg-store';
import type { StoredEvent } from './events/schema';
import { logger } from './lib/logger';
import { BullJobQueue, createQueue } from './queue/bullmq';
import { DEFAULT_RETRY } from './queue/jobs';
import { PgUserDirectory } from './users/pg-directory';
import { QUEUES } from './workers/jobs';

async function main(): Promise<void> {
  const env = loadEnv();
  const pool = createPool(env.DATABASE_URL);
  const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
  const forwardQueue = new BullJobQueue<StoredEvent>(createQueue(QUEUES.events, connection), DEFAULT_RETRY);
  const ingestor = new Ingestor(new PgEventStore(pool), forwardQueue, logger);

  const app = buildApp({ ingestor, users: new PgUserDirectory(pool), logger: true });
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
}

main().catch((err: unknown) => {
  logger.error({ err }, 'api startup failed');
  process.exit(1);
});
