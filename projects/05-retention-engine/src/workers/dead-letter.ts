import type { InterventionRepository } from '../interventions/types';
import type { FailedJob } from '../queue/jobs';

/** Persist the failure and freeze the intervention so nothing retries it silently. */
export function makeDeadLetterHandler(
  interventions: InterventionRepository,
  log: (obj: object, msg: string) => void,
) {
  return async (job: FailedJob<unknown>): Promise<void> => {
    const key = interventionKeyOf(job.data);
    await interventions.recordDeadLetter({
      queue: job.queue,
      jobId: job.jobId,
      interventionKey: key,
      error: job.error.message,
      attempts: job.attemptsMade,
      payload: job.data,
    });
    if (key) await interventions.markDeadLettered(key);
    log({ queue: job.queue, jobId: job.jobId, attempts: job.attemptsMade, err: job.error.message }, 'job dead-lettered');
  };
}

function interventionKeyOf(data: unknown): string | null {
  if (typeof data === 'object' && data !== null && 'interventionKey' in data) {
    const key = (data as { interventionKey: unknown }).interventionKey;
    return typeof key === 'string' ? key : null;
  }
  return null;
}
