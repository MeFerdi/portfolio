import { UnrecoverableError, Worker, type ConnectionOptions, type Job } from 'bullmq';
import { MissingRecordError } from '../db/repository';
import { LlmOutputError } from '../llm/client';
import {
  handleDraft,
  handleIngest,
  handleResearch,
  handleScore,
  type LeadJobData,
  type PipelineDeps,
  type Transition,
} from './handlers';
import { stageJobId, type StageName } from './idempotency';
import { QUEUE_NAMES, STAGES, type Queues } from './queues';
import { InvalidLeadError } from './stages/ingest';

const HANDLERS: Record<StageName, (deps: PipelineDeps, data: unknown) => Promise<Transition>> = {
  ingest: handleIngest,
  research: (deps, data) => handleResearch(deps, data as LeadJobData),
  score: (deps, data) => handleScore(deps, data as LeadJobData),
  draft: (deps, data) => handleDraft(deps, data as LeadJobData),
};

/** Errors that will fail identically on every attempt skip straight to the failed set. */
export function isPermanent(err: unknown): boolean {
  if (err instanceof InvalidLeadError || err instanceof MissingRecordError) return true;
  // A safety refusal will not change on retry; schema drift or truncation might.
  return err instanceof LlmOutputError && err.reason.startsWith('refused');
}

export function startWorkers(
  deps: PipelineDeps,
  queues: Queues,
  connection: ConnectionOptions,
  concurrency: number,
): Worker[] {
  return STAGES.map((stage) => {
    const worker = new Worker(
      QUEUE_NAMES[stage],
      async (job: Job) => {
        try {
          const transition = await HANDLERS[stage](deps, job.data);
          if ('next' in transition) {
            // Deterministic jobId: a retried parent cannot enqueue the child twice.
            await queues[transition.next].add(
              transition.next,
              { leadKey: transition.leadKey } satisfies LeadJobData,
              { jobId: stageJobId(transition.next, transition.leadKey) },
            );
          }
          return transition;
        } catch (err) {
          if (isPermanent(err)) throw new UnrecoverableError((err as Error).message);
          throw err;
        }
      },
      { connection, concurrency },
    );

    worker.on('failed', (job, err) => {
      if (!job) return;
      const exhausted = err instanceof UnrecoverableError || job.attemptsMade >= (job.opts.attempts ?? 1);
      const leadKey = (job.data as Partial<LeadJobData>).leadKey;
      deps.logger.error({ stage, jobId: job.id, attempt: job.attemptsMade, exhausted, err: err.message }, 'job failed');
      if (exhausted && leadKey) {
        deps.repo.setStatus(leadKey, 'failed', `${stage}: ${err.message}`).catch((e: unknown) => {
          deps.logger.error({ leadKey, err: (e as Error).message }, 'could not mark lead failed');
        });
      }
    });

    return worker;
  });
}
