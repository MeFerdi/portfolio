import { Redis } from 'ioredis';
import { loadEnv } from '../config/env';
import { createPool } from '../db/pool';
import { LogSink, type EventSink } from '../events/sink';
import { PgEventStore } from '../events/pg-store';
import type { StoredEvent } from '../events/schema';
import { PgInterventionRepository } from '../interventions/pg-repository';
import { logger } from '../lib/logger';
import { AnthropicLlm } from '../llm/client';
import { ConsoleMailer, type Mailer } from '../mail/mailer';
import { ResendMailer } from '../mail/resend-mailer';
import { BullJobQueue, createQueue, createWorker } from '../queue/bullmq';
import { DEFAULT_RETRY } from '../queue/jobs';
import { PgUserDirectory } from '../users/pg-directory';
import { DEFAULT_RULES } from './assess-risk';
import { makeDeadLetterHandler } from './dead-letter';
import { makeDeliverProcessor } from './deliver';
import { makeDiagnoseProcessor } from './diagnose-and-draft';
import { QUEUES, type InterventionJob } from './jobs';
import { scanForStalls } from './stall-detector';

async function main(): Promise<void> {
  const env = loadEnv();
  const pool = createPool(env.DATABASE_URL);
  // BullMQ workers need maxRetriesPerRequest: null on their Redis connection.
  const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

  const events = new PgEventStore(pool);
  const interventions = new PgInterventionRepository(pool);
  const users = new PgUserDirectory(pool);
  const llm = new AnthropicLlm(env.LLM_MODEL);
  const mailer: Mailer = env.RESEND_API_KEY
    ? new ResendMailer(env.RESEND_API_KEY, env.MAIL_FROM)
    : new ConsoleMailer();
  const sinks: EventSink[] = [new LogSink((o, m) => logger.debug(o, m))];
  const log = (o: object, m: string) => logger.info(o, m);
  const logError = (o: object, m: string) => logger.error(o, m);

  const queues = {
    scan: createQueue(QUEUES.stallScan, connection),
    diagnose: createQueue(QUEUES.diagnose, connection),
    deliver: createQueue(QUEUES.deliver, connection),
  };
  const diagnoseQueue = new BullJobQueue<InterventionJob>(queues.diagnose, DEFAULT_RETRY);
  const deliverQueue = new BullJobQueue<InterventionJob>(queues.deliver, DEFAULT_RETRY);
  const deadLetter = makeDeadLetterHandler(interventions, logError);

  // One scheduler entry, however many worker processes start.
  await queues.scan.upsertJobScheduler('stall-scan', { every: env.STALL_SCAN_EVERY_MS });

  const workers = [
    createWorker(
      QUEUES.stallScan,
      connection,
      async () => {
        const summary = await scanForStalls(
          {
            events,
            interventions,
            diagnoseQueue,
            rules: DEFAULT_RULES,
            experiment: { salt: env.EXPERIMENT_SALT, interventionShare: env.EXPERIMENT_INTERVENTION_SHARE },
            lookbackDays: env.STALL_LOOKBACK_DAYS,
            log,
          },
          new Date(),
        );
        log(summary, 'stall scan complete');
      },
      deadLetter,
      1,
    ),
    createWorker(QUEUES.diagnose, connection, makeDiagnoseProcessor({ events, interventions, llm, deliverQueue }), deadLetter),
    createWorker(QUEUES.deliver, connection, makeDeliverProcessor({ interventions, users, mailer }), deadLetter),
    createWorker<StoredEvent>(
      QUEUES.events,
      connection,
      async (event) => {
        for (const sink of sinks) await sink.send(event);
      },
      deadLetter,
    ),
  ];
  logger.info({ queues: Object.values(QUEUES) }, 'workers started');

  const shutdown = async () => {
    await Promise.all(workers.map((w) => w.close()));
    await Promise.all(Object.values(queues).map((q) => q.close()));
    await connection.quit();
    await pool.end();
    process.exit(0);
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}

main().catch((err: unknown) => {
  logger.error({ err }, 'worker startup failed');
  process.exit(1);
});
