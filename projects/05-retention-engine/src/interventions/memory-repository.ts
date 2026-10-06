import type {
  DeadLetter,
  InterventionRecord,
  InterventionRepository,
  InterventionStatus,
  NewIntervention,
} from './types';
import type { StallDiagnosis } from '../workers/diagnose-and-draft';

/** Same transition rules as PgInterventionRepository; used by tests and the simulator. */
export class InMemoryInterventionRepository implements InterventionRepository {
  readonly records = new Map<string, InterventionRecord>();
  readonly deadLetters: DeadLetter[] = [];

  constructor(private readonly now: () => Date = () => new Date()) {}

  async createIfAbsent(input: NewIntervention) {
    const existing = this.records.get(input.key);
    if (existing) return { record: existing, created: false };
    const ts = this.now().toISOString();
    const record: InterventionRecord = {
      ...input,
      status: input.cohort === 'control' ? 'control_logged' : 'pending',
      diagnosis: null,
      providerMessageId: null,
      createdAt: ts,
      updatedAt: ts,
    };
    this.records.set(input.key, record);
    return { record, created: true };
  }

  async get(key: string) {
    return this.records.get(key);
  }

  async saveDiagnosis(key: string, diagnosis: StallDiagnosis) {
    return this.transition(key, 'pending', 'drafted', { diagnosis });
  }

  async markSent(key: string, providerMessageId: string) {
    return this.transition(key, 'drafted', 'sent', { providerMessageId });
  }

  async markDeadLettered(key: string) {
    const r = this.records.get(key);
    if (r && (r.status === 'pending' || r.status === 'drafted')) {
      this.records.set(key, { ...r, status: 'dead_lettered', updatedAt: this.now().toISOString() });
    }
  }

  async recordDeadLetter(entry: Omit<DeadLetter, 'createdAt'>) {
    this.deadLetters.push({ ...entry, createdAt: this.now().toISOString() });
  }

  private transition(
    key: string,
    from: InterventionStatus,
    to: InterventionStatus,
    patch: Partial<InterventionRecord>,
  ): boolean {
    const r = this.records.get(key);
    if (!r || r.status !== from) return false;
    this.records.set(key, { ...r, ...patch, status: to, updatedAt: this.now().toISOString() });
    return true;
  }
}
