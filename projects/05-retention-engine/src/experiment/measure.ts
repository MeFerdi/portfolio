import type { StoredEvent } from '../events/schema';
import type { Cohort } from './cohort';
import { twoProportionZTest, type TwoProportionResult } from './stats';

export interface FlaggedUser {
  userId: string;
  cohort: Cohort;
}

export interface CohortOutcome {
  flagged: number;
  completed: number;
  rate: number;
}

export interface CompletionReport {
  intervention: CohortOutcome;
  control: CohortOutcome;
  /** intervention vs control; null when either arm is empty. */
  test: TwoProportionResult | null;
}

/**
 * Primary metric: onboarding completion (first_success_reached) among users who
 * were flagged as stalled, split by arm. Both arms are flagged by identical rules,
 * so the comparison is intention-to-treat: an intervention-arm user whose email
 * dead-lettered still counts in the intervention arm.
 */
export function completionByCohort(flagged: readonly FlaggedUser[], events: readonly StoredEvent[]): CompletionReport {
  const completedUsers = new Set(events.filter((e) => e.type === 'first_success_reached').map((e) => e.userId));
  const uniqueFlagged = new Map(flagged.map((f) => [f.userId, f.cohort]));
  const outcome = (cohort: Cohort): CohortOutcome => {
    const ids = [...uniqueFlagged].filter(([, c]) => c === cohort).map(([id]) => id);
    const completed = ids.filter((id) => completedUsers.has(id)).length;
    return { flagged: ids.length, completed, rate: ids.length ? completed / ids.length : 0 };
  };
  const intervention = outcome('intervention');
  const control = outcome('control');
  const test =
    intervention.flagged > 0 && control.flagged > 0
      ? twoProportionZTest(intervention.completed, intervention.flagged, control.completed, control.flagged)
      : null;
  return { intervention, control, test };
}

/** Share of intervention keys that produced more than one delivered email. Target: exactly 0. */
export function duplicateSendRate(sendsByKey: ReadonlyMap<string, number>): number {
  if (sendsByKey.size === 0) return 0;
  const dupes = [...sendsByKey.values()].filter((n) => n > 1).length;
  return dupes / sendsByKey.size;
}
