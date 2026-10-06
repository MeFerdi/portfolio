import { Redis } from 'ioredis';
import { loadEnv } from '../src/config/env';
import { logger } from '../src/lib/logger';
import { closeQueues, createQueues, enqueueLead } from '../src/pipeline/queues';
import { JsonFileLeadSource } from '../src/sources/lead-source';

/** Usage: npm run ingest -- path/to/leads.json */
async function main(): Promise<void> {
  const path = process.argv[2];
  if (!path) throw new Error('Usage: npm run ingest -- <leads.json>');

  const env = loadEnv();
  const redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
  const queues = createQueues(redis);
  const counts = { enqueued: 0, invalid: 0 };
  try {
    for await (const item of new JsonFileLeadSource(path).leads()) {
      if (!item.ok) {
        counts.invalid += 1;
        logger.warn({ row: item.index, error: item.error }, 'invalid lead row skipped');
        continue;
      }
      await enqueueLead(queues, item.lead);
      counts.enqueued += 1;
    }
  } finally {
    await closeQueues(queues);
    redis.disconnect();
  }
  // "enqueued" counts submissions; BullMQ silently drops ones whose jobId already exists.
  logger.info(counts, 'ingest finished');
}

main().catch((err: unknown) => {
  logger.fatal({ err }, 'ingest failed');
  process.exit(1);
});
