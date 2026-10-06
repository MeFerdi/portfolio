import { Queue, UnrecoverableError, Worker, type ConnectionOptions } from 'bullmq';
import {
  PermanentJobError,
  runAttempt,
  type DeadLetterHandler,
  type JobQueue,
  type RetryPolicy,
} from './jobs';

/** BullMQ-backed JobQueue. jobId dedupes while the job is retained in Redis. */
export class BullJobQueue<T> implements JobQueue<T> {
  constructor(
    private readonly queue: Queue,
    private readonly policy: RetryPolicy,
  ) {}

  async add(jobId: string, data: T): Promise<void> {
    await this.queue.add(this.queue.name, data, {
      jobId,
      attempts: this.policy.attempts,
      backoff: { type: 'exponential', delay: this.policy.baseDelayMs },
      // Keep finished jobs long enough that a re-enqueue of the same jobId stays a no-op.
      // The DB status checks remain the real guarantee after eviction.
      removeOnComplete: { age: 7 * 86_400 },
      removeOnFail: false,
    });
  }
}

export function createQueue(name: string, connection: ConnectionOptions): Queue {
  return new Queue(name, { connection });
}

/** Worker whose every attempt goes through runAttempt, i.e. the same dead-letter path the tests cover. */
export function createWorker<T>(
  name: string,
  connection: ConnectionOptions,
  process: (data: T) => Promise<void>,
  onDeadLetter: DeadLetterHandler<T>,
  concurrency = 5,
): Worker {
  return new Worker(
    name,
    async (job) => {
      // attemptsMade counts previous failed attempts, so this attempt is attemptsMade + 1.
      const ctx = {
        queue: name,
        jobId: job.id ?? 'unknown',
        data: job.data as T,
        attempt: job.attemptsMade + 1,
        maxAttempts: job.opts.attempts ?? 1,
      };
      try {
        await runAttempt(ctx, process, onDeadLetter);
      } catch (err) {
        // Already dead-lettered by runAttempt; stop BullMQ from retrying it.
        if (err instanceof PermanentJobError) throw new UnrecoverableError(err.message);
        throw err;
      }
    },
    { connection, concurrency },
  );
}
