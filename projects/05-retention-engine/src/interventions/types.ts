import type { OnboardingStep } from '../events/schema';
import type { Cohort } from '../experiment/cohort';
import type { RiskSignal } from '../workers/assess-risk';
import type { StallDiagnosis } from '../workers/diagnose-and-draft';

/**
 * Lifecycle (forward-only):
 *   control_logged                          control arm: assessed and recorded, never contacted
 *   pending -> drafted -> sent              intervention arm, happy path
 *   pending | drafted -> dead_lettered      gave up after retries; see dead_letters
 */
export type InterventionStatus = 'control_logged' | 'pending' | 'drafted' | 'sent' | 'dead_lettered';

export interface InterventionRecord {
  key: string;
  userId: string;
  stalledAtStep: OnboardingStep;
  ruleVersion: string;
  cohort: Cohort;
  riskScore: number;
  signals: RiskSignal[];
  status: InterventionStatus;
  diagnosis: StallDiagnosis | null;
  providerMessageId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NewIntervention = Pick<
  InterventionRecord,
  'key' | 'userId' | 'stalledAtStep' | 'ruleVersion' | 'cohort' | 'riskScore' | 'signals'
>;

export interface DeadLetter {
  queue: string;
  jobId: string;
  interventionKey: string | null;
  error: string;
  attempts: number;
  payload: unknown;
  createdAt: string;
}

export interface InterventionRepository {
  /** Insert unless the key exists. The unique key is the dedupe guarantee, not a prior read. */
  createIfAbsent(input: NewIntervention): Promise<{ record: InterventionRecord; created: boolean }>;
  get(key: string): Promise<InterventionRecord | undefined>;
  /** pending -> drafted. Returns false if the record was not pending (already handled). */
  saveDiagnosis(key: string, diagnosis: StallDiagnosis): Promise<boolean>;
  /** drafted -> sent. Returns false if the record was not drafted. */
  markSent(key: string, providerMessageId: string): Promise<boolean>;
  markDeadLettered(key: string): Promise<void>;
  recordDeadLetter(entry: Omit<DeadLetter, 'createdAt'>): Promise<void>;
}
