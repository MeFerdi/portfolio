import type { OnboardingStep } from '../events/schema';

/**
 * One intervention per (user, stalled step, rule version). This string is the
 * primary key in Postgres, the BullMQ jobId, and the email provider's idempotency
 * key, so every layer dedupes on the same identity.
 * BullMQ rejects custom job ids containing ':', hence '|'.
 */
export function interventionKey(userId: string, stalledAtStep: OnboardingStep, ruleVersion: string): string {
  return `${userId}|${stalledAtStep}|${ruleVersion}`;
}
