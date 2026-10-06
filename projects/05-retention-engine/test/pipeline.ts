import { InMemoryEventStore } from '../src/events/memory-store';
import type { StoredEvent } from '../src/events/schema';
import type { ExperimentConfig } from '../src/experiment/cohort';
import { InMemoryInterventionRepository } from '../src/interventions/memory-repository';
import type { LlmClient } from '../src/llm/client';
import { InlineQueue } from '../src/queue/inline-queue';
import type { RetryPolicy } from '../src/queue/jobs';
import { InMemoryUserDirectory } from '../src/users/directory';
import { DEFAULT_RULES } from '../src/workers/assess-risk';
import { makeDeadLetterHandler } from '../src/workers/dead-letter';
import { makeDeliverProcessor } from '../src/workers/deliver';
import { makeDiagnoseProcessor, type StallDiagnosis } from '../src/workers/diagnose-and-draft';
import type { InterventionJob } from '../src/workers/jobs';
import { scanForStalls } from '../src/workers/stall-detector';
import { FakeLlm, FakeMailer } from './fakes';

/** Cites the last event id in the prompt, i.e. a grounded diagnosis. */
export function groundedDiagnosis(prompt: string): StallDiagnosis {
  const ids = [...prompt.matchAll(/^\[([^\]]+)\]/gm)].map((m) => m[1] as string);
  return {
    likelyReason: 'Card declined twice, then no activity.',
    evidence: [{ eventId: ids.at(-1) as string, observation: 'last failed payment' }],
    recommendedAction: 'Suggest an alternative payment method.',
    email: { subject: 'Your card was declined', body: 'Hi {{first_name}}, try another card.' },
  };
}

export const ALL_INTERVENTION: ExperimentConfig = { salt: 't', interventionShare: 1 };
export const ALL_CONTROL: ExperimentConfig = { salt: 't', interventionShare: 0 };

/** Fully in-memory engine: real scan/diagnose/deliver code, fake edges. */
export function buildPipeline(opts: {
  trail: StoredEvent[];
  experiment?: ExperimentConfig;
  llm?: LlmClient;
  mailer?: FakeMailer;
  retry?: RetryPolicy;
}) {
  const events = new InMemoryEventStore();
  const users = new InMemoryUserDirectory();
  const interventions = new InMemoryInterventionRepository();
  const mailer = opts.mailer ?? new FakeMailer();
  const llm = opts.llm ?? new FakeLlm({ 'stall-diagnosis': (req) => groundedDiagnosis(req.prompt) });
  const retry = opts.retry ?? { attempts: 3, baseDelayMs: 1 };
  const diagnoseQueue = new InlineQueue<InterventionJob>('diagnose-and-draft', retry);
  const deliverQueue = new InlineQueue<InterventionJob>('deliver', retry);
  const deadLetter = makeDeadLetterHandler(interventions, () => {});

  const seed = async () => {
    for (const e of opts.trail) {
      const { id: _id, receivedAt: _r, ...input } = e;
      await events.write(input);
    }
    for (const userId of new Set(opts.trail.map((e) => e.userId))) {
      await users.create({ id: userId, email: `${userId}@example.test`, name: 'Ada Lovelace' });
    }
  };

  /** One full detect -> diagnose -> deliver cycle at `now`. */
  const cycle = async (now: Date) => {
    const summary = await scanForStalls(
      {
        events,
        interventions,
        diagnoseQueue,
        rules: DEFAULT_RULES,
        experiment: opts.experiment ?? ALL_INTERVENTION,
        lookbackDays: 30,
        log: () => {},
      },
      now,
    );
    await diagnoseQueue.drain(makeDiagnoseProcessor({ events, interventions, llm, deliverQueue }), deadLetter);
    await deliverQueue.drain(makeDeliverProcessor({ interventions, users, mailer }), deadLetter);
    return summary;
  };

  return { events, users, interventions, mailer, diagnoseQueue, deliverQueue, deadLetter, seed, cycle };
}
