import { createHash } from 'node:crypto';

export type Cohort = 'intervention' | 'control';

export interface ExperimentConfig {
  /** Changing the salt reshuffles everyone: treat it as starting a new experiment. */
  salt: string;
  /** Fraction of users in the intervention arm, 0..1. */
  interventionShare: number;
}

export const DEFAULT_EXPERIMENT: ExperimentConfig = {
  salt: 'onboarding-recovery-2026q4',
  interventionShare: 0.5,
};

/**
 * Deterministic, stateless assignment: hash(salt:userId) mapped onto [0, 1).
 * No assignment table is needed, and a user can never flip arms between scans.
 */
export function assignCohort(userId: string, config: ExperimentConfig = DEFAULT_EXPERIMENT): Cohort {
  if (config.interventionShare < 0 || config.interventionShare > 1) {
    throw new Error(`interventionShare must be within [0, 1], got ${config.interventionShare}`);
  }
  const digest = createHash('sha256').update(`${config.salt}:${userId}`).digest();
  const bucket = digest.readUInt32BE(0) / 0x1_0000_0000;
  return bucket < config.interventionShare ? 'intervention' : 'control';
}
