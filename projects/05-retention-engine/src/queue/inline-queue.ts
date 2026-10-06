import {
  DEFAULT_RETRY,
  PermanentJobError,
  runAttempt,
  type DeadLetterHandler,
  type JobQueue,
  type RetryPolicy,
} from './jobs';

/**
 * Synchronous stand-in for a BullMQ queue+worker pair: dedupes on jobId, retries
 * with the same policy and dead-letter path, but does not sleep between attempts.
 * For tests and the offline simulator only.
 */
export class InlineQueue<T> implements JobQueue<T> {
  private readonly seen = new Set<string>();
  private readonly waiting: { jobId: string; data: T }[] = [];
  readonly completed: string[] = [];
  readonly failed: string[] = [];

  constructor(
    readonly name: string,
    private readonly policy: RetryPolicy = DEFAULT_RETRY,
  ) {}

  async add(jobId: string, data: T): Promise<void> {
    if (this.seen.has(jobId)) return;
    this.seen.add(jobId);
    this.waiting.push({ jobId, data });
  }

  get size(): number {
    return this.waiting.length;
  }

  /** Process every waiting job (including ones enqueued while draining). */
  async drain(process: (data: T) => Promise<void>, onDeadLetter: DeadLetterHandler<T>): Promise<void> {
    for (let job = this.waiting.shift(); job; job = this.waiting.shift()) {
      for (let attempt = 1; attempt <= this.policy.attempts; attempt++) {
        try {
          await runAttempt(
            { queue: this.name, jobId: job.jobId, data: job.data, attempt, maxAttempts: this.policy.attempts },
            process,
            onDeadLetter,
          );
          this.completed.push(job.jobId);
          break;
        } catch (err) {
          if (err instanceof PermanentJobError || attempt === this.policy.attempts) {
            this.failed.push(job.jobId);
            break;
          }
        }
      }
    }
  }
}
