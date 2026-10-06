/**
 * Queue-agnostic job plumbing. Worker logic depends on `JobQueue` and `runAttempt`,
 * so the same retry/dead-letter code path runs under BullMQ in production and
 * under InlineQueue in tests and the simulator.
 */

export interface JobQueue<T> {
  /** Enqueue unless a job with this id is already known (BullMQ jobId semantics). */
  add(jobId: string, data: T): Promise<void>;
}

export interface RetryPolicy {
  attempts: number;
  /** Delay before retry n (1-based) is baseDelayMs * 2^(n-1), matching BullMQ 'exponential'. */
  baseDelayMs: number;
}

export const DEFAULT_RETRY: RetryPolicy = { attempts: 5, baseDelayMs: 2_000 };

export function backoffDelayMs(retryNumber: number, policy: RetryPolicy): number {
  return policy.baseDelayMs * 2 ** (retryNumber - 1);
}

/** Throw for failures retrying cannot fix (e.g. user deleted, invalid address). Dead-letters immediately. */
export class PermanentJobError extends Error {
  override readonly name = 'PermanentJobError';
}

export interface AttemptContext<T> {
  queue: string;
  jobId: string;
  data: T;
  /** 1-based number of this attempt. */
  attempt: number;
  maxAttempts: number;
}

export interface FailedJob<T> extends Omit<AttemptContext<T>, 'attempt'> {
  attemptsMade: number;
  error: Error;
}

export type DeadLetterHandler<T> = (job: FailedJob<T>) => Promise<void>;

/**
 * Run one attempt. On the final attempt (or a permanent error) the job is
 * dead-lettered *before* the error propagates, so a crash cannot lose it silently.
 * Always rethrows so the queue records the failure / schedules the retry.
 */
export async function runAttempt<T>(
  ctx: AttemptContext<T>,
  process: (data: T) => Promise<void>,
  onDeadLetter: DeadLetterHandler<T>,
): Promise<void> {
  try {
    await process(ctx.data);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    if (error instanceof PermanentJobError || ctx.attempt >= ctx.maxAttempts) {
      await onDeadLetter({
        queue: ctx.queue,
        jobId: ctx.jobId,
        data: ctx.data,
        maxAttempts: ctx.maxAttempts,
        attemptsMade: ctx.attempt,
        error,
      });
    }
    throw error;
  }
}
