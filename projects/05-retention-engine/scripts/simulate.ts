/**
 * SYNTHETIC DATA GENERATOR. Every number this produces describes simulated users
 * whose recovery behaviour is set by the --base-recovery and --uplift flags. It
 * exercises the real detection, cohort, diagnosis, delivery and measurement code;
 * it cannot tell you whether the interventions work on real people.
 *
 *   npm run simulate -- --users 1000 --seed 7 --uplift 0.1 --mail-failure-rate 0.3
 *   npm run simulate -- --users 20 --llm     # real model drafts (needs ANTHROPIC_API_KEY)
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { loadEnv } from '../src/config/env';
import { Ingestor } from '../src/events/ingest';
import { InMemoryEventStore } from '../src/events/memory-store';
import { ONBOARDING_STEPS, type EventInput, type OnboardingStep, type StoredEvent } from '../src/events/schema';
import { DEFAULT_EXPERIMENT } from '../src/experiment/cohort';
import { InMemoryInterventionRepository } from '../src/interventions/memory-repository';
import { AnthropicLlm, type LlmClient } from '../src/llm/client';
import { InlineQueue } from '../src/queue/inline-queue';
import { InMemoryUserDirectory } from '../src/users/directory';
import { DEFAULT_RULES } from '../src/workers/assess-risk';
import { makeDeadLetterHandler } from '../src/workers/dead-letter';
import { makeDeliverProcessor } from '../src/workers/deliver';
import { makeDiagnoseProcessor } from '../src/workers/diagnose-and-draft';
import type { InterventionJob } from '../src/workers/jobs';
import { scanForStalls } from '../src/workers/stall-detector';
import { seededRandom } from './lib/rng';
import { ChaosMailer, TemplateDiagnosisLlm } from './lib/simulation-doubles';

const { values: args } = parseArgs({
  options: {
    users: { type: 'string', default: '500' },
    seed: { type: 'string', default: '42' },
    'base-recovery': { type: 'string', default: '0.15' },
    uplift: { type: 'string', default: '0.10' },
    'mail-failure-rate': { type: 'string', default: '0.2' },
    scans: { type: 'string', default: '3' },
    llm: { type: 'boolean', default: false },
    out: { type: 'string', default: 'data/synthetic-run.json' },
  },
});

/** Probability a user who reached a step goes on to complete it (before any intervention). */
const CONTINUE_PROB: Record<Exclude<OnboardingStep, 'signup'>, number> = {
  verify_email: 0.85,
  create_project: 0.8,
  invite_teammate: 0.7,
  add_payment: 0.7,
  first_success: 0.8,
};
/** Failure modes injected before a step completes (or stalls). */
const FAILURES: Partial<Record<OnboardingStep, { type: EventInput['type']; reasons: string[]; prob: number }>> = {
  verify_email: { type: 'email_verification_failed', reasons: ['link_expired', 'bounced'], prob: 0.1 },
  invite_teammate: { type: 'teammate_invite_failed', reasons: ['invalid_email', 'seat_limit_reached'], prob: 0.1 },
  add_payment: {
    type: 'payment_failed',
    reasons: ['card_declined', 'insufficient_funds', 'expired_card', 'authentication_required'],
    prob: 0.35,
  },
};
const COMPLETION_TYPE: Record<OnboardingStep, EventInput['type']> = {
  signup: 'signed_up',
  verify_email: 'email_verified',
  create_project: 'project_created',
  invite_teammate: 'teammate_invited',
  add_payment: 'payment_added',
  first_success: 'first_success_reached',
};

const HOUR = 3_600_000;
const START = Date.parse('2026-09-01T00:00:00Z');
const SCAN_AT = new Date(START + 14 * 24 * HOUR);

async function main(): Promise<void> {
  const nUsers = Number(args.users);
  const seed = Number(args.seed);
  const baseRecovery = Number(args['base-recovery']);
  const uplift = Number(args.uplift);
  const random = seededRandom(seed);
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(random() * xs.length)] as T;

  const events = new InMemoryEventStore(() => SCAN_AT);
  const users = new InMemoryUserDirectory();
  const interventions = new InMemoryInterventionRepository(() => SCAN_AT);
  const forward = new InlineQueue<StoredEvent>('events');
  const ingestor = new Ingestor(events, forward, { error: (o, m) => console.error(m, o) });
  let seq = 0;
  const emit = async (userId: string, type: EventInput['type'], at: number, reason?: string) => {
    const outcome = await ingestor.ingest({
      type,
      ...(reason ? { reason } : {}),
      userId,
      occurredAt: new Date(at).toISOString(),
      idempotencyKey: `sim-${seed}-${++seq}`,
    });
    if (outcome.status !== 'accepted') throw new Error(`simulator emitted a bad event: ${outcome.status}`);
  };

  /** Walk a user forward from `fromIndex`; returns when they stall or finish. */
  const walk = async (userId: string, fromIndex: number, startAt: number, continueProb: (s: OnboardingStep) => number) => {
    let t = startAt;
    for (const step of ONBOARDING_STEPS.slice(fromIndex)) {
      const failure = FAILURES[step];
      if (failure && random() < failure.prob) {
        const tries = 1 + Math.floor(random() * 3);
        for (let i = 0; i < tries; i++) {
          t += (0.1 + random() * 2) * HOUR;
          await emit(userId, failure.type, t, pick(failure.reasons));
        }
      }
      if (step !== 'signup' && random() >= continueProb(step)) return;
      t += (0.5 + random() * 20) * HOUR;
      await emit(userId, COMPLETION_TYPE[step], t);
    }
  };

  // 1. Organic onboarding up to the scan.
  for (let i = 0; i < nUsers; i++) {
    const userId = `synthetic-user-${String(i).padStart(5, '0')}`;
    await users.create({ id: userId, email: `${userId}@example.test`, name: `Synthetic ${i}` });
    const signupAt = START + random() * 7 * 24 * HOUR;
    await walk(userId, 0, signupAt, (s) => CONTINUE_PROB[s as keyof typeof CONTINUE_PROB]);
  }

  // 2. Detect -> diagnose -> deliver, scanning several times to exercise idempotency.
  const env = loadEnv();
  const llm: LlmClient = args.llm ? new AnthropicLlm(env.LLM_MODEL) : new TemplateDiagnosisLlm();
  const mailer = new ChaosMailer(random, Number(args['mail-failure-rate']));
  const diagnoseQueue = new InlineQueue<InterventionJob>('diagnose-and-draft');
  const deliverQueue = new InlineQueue<InterventionJob>('deliver');
  const deadLetter = makeDeadLetterHandler(interventions, () => {});
  const diagnose = makeDiagnoseProcessor({ events, interventions, llm, deliverQueue });
  const deliver = makeDeliverProcessor({ interventions, users, mailer });

  for (let i = 0; i < Number(args.scans); i++) {
    await scanForStalls(
      { events, interventions, diagnoseQueue, rules: DEFAULT_RULES, experiment: DEFAULT_EXPERIMENT, lookbackDays: 30, log: () => {} },
      SCAN_AT,
    );
    await diagnoseQueue.drain(diagnose, deadLetter);
    await deliverQueue.drain(deliver, deadLetter);
  }

  // 3. SYNTHETIC outcome model: flagged users recover with a fixed probability,
  //    plus `uplift` if they actually received an email. This is an input, not a finding.
  const records = [...interventions.records.values()];
  for (const r of records) {
    const p = baseRecovery + (r.status === 'sent' ? uplift : 0);
    if (random() < p) {
      await walk(r.userId, ONBOARDING_STEPS.indexOf(r.stalledAtStep), SCAN_AT.getTime() + HOUR, () => 1);
    }
  }

  const out = path.resolve(args.out);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(
    out,
    JSON.stringify(
      {
        synthetic: true,
        note: 'SYNTHETIC DATA. Recovery rates are simulator inputs, not measured effects.',
        params: { nUsers, seed, baseRecovery, uplift, mailFailureRate: Number(args['mail-failure-rate']), scans: Number(args.scans), llm: args.llm, rules: DEFAULT_RULES.version },
        flagged: records.map((r) => ({ userId: r.userId, cohort: r.cohort, stalledAtStep: r.stalledAtStep, status: r.status, key: r.key })),
        mail: { attempts: mailer.attempts, transientFailures: mailer.transientFailures, deliveredByKey: Object.fromEntries(mailer.deliveredByKey) },
        deadLetters: interventions.deadLetters,
        events: events.all(),
      },
      null,
      2,
    ),
  );
  console.log(`[SYNTHETIC] ${nUsers} users, ${records.length} stalls recorded, ${mailer.deliveredByKey.size} emails delivered -> ${out}`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
