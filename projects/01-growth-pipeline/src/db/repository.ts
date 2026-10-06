import type { ExampleMessage } from '../domain/example-message';
import type { Lead, LeadStatus } from '../domain/lead';
import type { FitVerdict, OutreachDraft, ResearchNotes } from '../pipeline/schemas';
import type { CompanyProfile } from '../scraper/profile-parser';

export interface StoredResearch {
  profile: CompanyProfile | null;
  notes: ResearchNotes;
}

/**
 * Persistence used by the pipeline stages. Every write is an upsert keyed by
 * leadKey, so replaying a stage (BullMQ retry, crash recovery) is safe.
 */
export interface PipelineRepository {
  /** Inserts the lead if new; returns the stored status either way. */
  upsertLead(lead: Lead): Promise<{ inserted: boolean; status: LeadStatus }>;
  getLead(leadKey: string): Promise<Lead | null>;
  setStatus(leadKey: string, status: LeadStatus, error?: string): Promise<void>;

  saveResearch(leadKey: string, research: StoredResearch): Promise<void>;
  getResearch(leadKey: string): Promise<StoredResearch | null>;

  saveVerdict(leadKey: string, verdict: FitVerdict, icpVersion: string): Promise<void>;
  getVerdict(leadKey: string): Promise<FitVerdict | null>;

  saveDraft(leadKey: string, draft: OutreachDraft, exampleIds: string[]): Promise<void>;

  /** Nearest successful messages by cosine distance. */
  findSimilarMessages(embedding: number[], limit: number): Promise<ExampleMessage[]>;
}

export class MissingRecordError extends Error {
  constructor(what: string, leadKey: string) {
    super(`Missing ${what} for lead ${leadKey}`);
  }
}
