import { EVENT_STEP, ONBOARDING_STEPS, type OnboardingStep, type StoredEvent } from '../events/schema';

/**
 * Explicit, versioned stall rules. Bump `version` whenever a threshold or weight
 * changes: the version is part of the intervention idempotency key, so a rule change
 * may legitimately re-contact a user, but re-running the same rules never does.
 *
 * Scoring (additive, capped at 1):
 *   inactive           +0.50  no event of any kind for >= stallAfterHours[nextStep]
 *   long_inactive      +0.25  ... and for >= 2x that threshold
 *   repeated_failures  +0.50  >= repeatedFailureThreshold failures on the current step
 *   failed_attempt     +0.20  exactly one failure on the current step (below the threshold)
 * The user is "stalled" at their next step when riskScore >= stallThreshold.
 * With the defaults that means: inactive, OR repeatedly failing, on the step they are stuck on.
 */
export interface RiskRules {
  version: string;
  /** Hours of silence, per step the user is waiting on, before inactivity counts. */
  stallAfterHours: Record<Exclude<OnboardingStep, 'signup'>, number>;
  repeatedFailureThreshold: number;
  stallThreshold: number;
}

export const DEFAULT_RULES: RiskRules = {
  version: 'v1',
  stallAfterHours: {
    verify_email: 24,
    create_project: 48,
    invite_teammate: 72,
    add_payment: 72,
    first_success: 96,
  },
  repeatedFailureThreshold: 2,
  stallThreshold: 0.5,
};

export type RiskSignal =
  | { code: 'inactive'; hoursSinceLastEvent: number; thresholdHours: number; eventIds: string[] }
  | { code: 'long_inactive'; hoursSinceLastEvent: number; thresholdHours: number; eventIds: string[] }
  | { code: 'repeated_failures'; failureCount: number; reasons: string[]; eventIds: string[] }
  | { code: 'failed_attempt'; reason: string; eventIds: string[] };

export interface RiskAssessment {
  /** The step the user has not completed yet, or null when not stalled / already onboarded. */
  stalledAtStep: OnboardingStep | null;
  /** Next incomplete step regardless of stall status; null when onboarding is complete. */
  nextStep: OnboardingStep | null;
  riskScore: number;
  signals: RiskSignal[];
}

const WEIGHTS = { inactive: 0.5, long_inactive: 0.25, repeated_failures: 0.5, failed_attempt: 0.2 } as const;
const HOUR_MS = 3_600_000;

/** Pure: same events, clock and rules always give the same answer. */
export function assessRisk(events: readonly StoredEvent[], now: Date, rules: RiskRules): RiskAssessment {
  const trail = [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const completed = new Set(
    trail.filter((e) => EVENT_STEP[e.type].outcome === 'completed').map((e) => EVENT_STEP[e.type].step),
  );
  const nextStep = ONBOARDING_STEPS.find((s) => !completed.has(s)) ?? null;
  const last = trail.at(-1);

  // No signup yet (nothing to assess), or onboarding already complete.
  if (!last || nextStep === null || nextStep === 'signup') {
    return { stalledAtStep: null, nextStep, riskScore: 0, signals: [] };
  }

  const signals: RiskSignal[] = [];
  const thresholdHours = rules.stallAfterHours[nextStep];
  const hoursSinceLastEvent = round1((now.getTime() - Date.parse(last.occurredAt)) / HOUR_MS);
  if (hoursSinceLastEvent >= thresholdHours) {
    signals.push({ code: 'inactive', hoursSinceLastEvent, thresholdHours, eventIds: [last.id] });
    if (hoursSinceLastEvent >= 2 * thresholdHours) {
      signals.push({ code: 'long_inactive', hoursSinceLastEvent, thresholdHours, eventIds: [last.id] });
    }
  }

  const failures = trail.filter(
    (e) => EVENT_STEP[e.type].step === nextStep && EVENT_STEP[e.type].outcome === 'failed',
  );
  const reasons = failures.map((e) => ('reason' in e ? e.reason : 'unknown'));
  if (failures.length >= rules.repeatedFailureThreshold) {
    signals.push({
      code: 'repeated_failures',
      failureCount: failures.length,
      reasons,
      eventIds: failures.map((e) => e.id),
    });
  } else if (failures.length > 0) {
    signals.push({ code: 'failed_attempt', reason: reasons[0] ?? 'unknown', eventIds: failures.map((e) => e.id) });
  }

  const riskScore = Math.min(1, signals.reduce((sum, s) => sum + WEIGHTS[s.code], 0));
  return {
    stalledAtStep: riskScore >= rules.stallThreshold ? nextStep : null,
    nextStep,
    riskScore: round2(riskScore),
    signals,
  };
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;
