import type { Pool } from 'pg';
import type {
  DeadLetter,
  InterventionRecord,
  InterventionRepository,
  NewIntervention,
} from './types';
import type { StallDiagnosis } from '../workers/diagnose-and-draft';

interface InterventionRow {
  intervention_key: string;
  user_id: string;
  stalled_at_step: InterventionRecord['stalledAtStep'];
  rule_version: string;
  cohort: InterventionRecord['cohort'];
  risk_score: string;
  signals: InterventionRecord['signals'];
  status: InterventionRecord['status'];
  diagnosis: StallDiagnosis | null;
  provider_message_id: string | null;
  created_at: Date;
  updated_at: Date;
}

/** Status transitions are conditional UPDATEs, so concurrent workers cannot both win. */
export class PgInterventionRepository implements InterventionRepository {
  constructor(private readonly pool: Pool) {}

  async createIfAbsent(input: NewIntervention) {
    const status = input.cohort === 'control' ? 'control_logged' : 'pending';
    const inserted = await this.pool.query<InterventionRow>(
      `INSERT INTO interventions
         (intervention_key, user_id, stalled_at_step, rule_version, cohort, risk_score, signals, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (intervention_key) DO NOTHING
       RETURNING *`,
      [
        input.key,
        input.userId,
        input.stalledAtStep,
        input.ruleVersion,
        input.cohort,
        input.riskScore,
        JSON.stringify(input.signals),
        status,
      ],
    );
    const row = inserted.rows[0];
    if (row) return { record: toRecord(row), created: true };
    const existing = await this.get(input.key);
    if (!existing) throw new Error(`Intervention ${input.key} vanished after conflict`);
    return { record: existing, created: false };
  }

  async get(key: string) {
    const res = await this.pool.query<InterventionRow>(
      'SELECT * FROM interventions WHERE intervention_key = $1',
      [key],
    );
    const row = res.rows[0];
    return row ? toRecord(row) : undefined;
  }

  async saveDiagnosis(key: string, diagnosis: StallDiagnosis) {
    const res = await this.pool.query(
      `UPDATE interventions SET status = 'drafted', diagnosis = $2, updated_at = now()
       WHERE intervention_key = $1 AND status = 'pending'`,
      [key, JSON.stringify(diagnosis)],
    );
    return res.rowCount === 1;
  }

  async markSent(key: string, providerMessageId: string) {
    const res = await this.pool.query(
      `UPDATE interventions SET status = 'sent', provider_message_id = $2, sent_at = now(), updated_at = now()
       WHERE intervention_key = $1 AND status = 'drafted'`,
      [key, providerMessageId],
    );
    return res.rowCount === 1;
  }

  async markDeadLettered(key: string) {
    await this.pool.query(
      `UPDATE interventions SET status = 'dead_lettered', updated_at = now()
       WHERE intervention_key = $1 AND status IN ('pending', 'drafted')`,
      [key],
    );
  }

  async recordDeadLetter(entry: Omit<DeadLetter, 'createdAt'>) {
    await this.pool.query(
      `INSERT INTO dead_letters (queue, job_id, intervention_key, error, attempts, payload)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [entry.queue, entry.jobId, entry.interventionKey, entry.error, entry.attempts, JSON.stringify(entry.payload ?? null)],
    );
  }
}

function toRecord(row: InterventionRow): InterventionRecord {
  return {
    key: row.intervention_key,
    userId: row.user_id,
    stalledAtStep: row.stalled_at_step,
    ruleVersion: row.rule_version,
    cohort: row.cohort,
    riskScore: Number(row.risk_score),
    signals: row.signals,
    status: row.status,
    diagnosis: row.diagnosis,
    providerMessageId: row.provider_message_id,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}
