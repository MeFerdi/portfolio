import { Queue, type ConnectionOptions, type DefaultJobOptions } from 'bullmq';
import type { RawLead } from '../domain/lead';
import { stageJobId, type StageName } from './idempotency';
import { normaliseLead } from './stages/ingest';

export const STAGES: readonly StageName[] = ['ingest', 'research', 'score', 'draft'];

export const QUEUE_NAMES: Record<StageName, string> = {
  ingest: 'growth-ingest',
  research: 'growth-research',
  score: 'growth-score',
  draft: 'growth-draft',
};

/**
 * Retries with exponential backoff cover transient failures (LLM rate limits,
 * network blips, schema drift that a second sample usually fixes).
 * Completed jobs are kept for 7 days, which is also the window in which a
 * re-submitted jobId is rejected by BullMQ; the leads table dedups beyond that.
 * Failed jobs are never removed: the failed set is the dead-letter queue.
 */
export const DEFAULT_JOB_OPTIONS: DefaultJobOptions = {
  attempts: 4,
  backoff: { type: 'exponential', delay: 5_000 },
  removeOnComplete: { age: 7 * 24 * 3600, count: 50_000 },
  removeOnFail: false,
};

export type Queues = Record<StageName, Queue>;

export function createQueues(connection: ConnectionOptions): Queues {
  const entries = STAGES.map((stage) => [
    stage,
    new Queue(QUEUE_NAMES[stage], { connection, defaultJobOptions: DEFAULT_JOB_OPTIONS }),
  ]);
  return Object.fromEntries(entries) as Queues;
}

export async function closeQueues(queues: Queues): Promise<void> {
  await Promise.all(Object.values(queues).map((q) => q.close()));
}

/**
 * Entry point for new leads. Validation happens before enqueue so bad rows are
 * reported to the caller instead of becoming failed jobs, and the jobId is
 * derived from the lead's identity so submitting the same lead twice is a no-op.
 */
export async function enqueueLead(queues: Queues, raw: RawLead): Promise<{ leadKey: string; jobId: string }> {
  const { leadKey } = normaliseLead(raw);
  const jobId = stageJobId('ingest', leadKey);
  await queues.ingest.add('ingest', raw, { jobId });
  return { leadKey, jobId };
}
