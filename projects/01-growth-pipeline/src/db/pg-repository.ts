import type { Pool } from 'pg';
import type { ExampleMessage } from '../domain/example-message';
import type { Lead, LeadStatus } from '../domain/lead';
import { toPgVector } from '../embeddings/provider';
import type { FitVerdict, OutreachDraft } from '../pipeline/schemas';
import type { PipelineRepository, StoredResearch } from './repository';

export class PgPipelineRepository implements PipelineRepository {
  constructor(private readonly pool: Pool) {}

  async upsertLead(lead: Lead): Promise<{ inserted: boolean; status: LeadStatus }> {
    // `xmax = 0` is true only for a freshly inserted row, which tells us
    // whether this was a new lead or a duplicate without a second query.
    const { rows } = await this.pool.query<{ inserted: boolean; status: LeadStatus }>(
      `INSERT INTO leads (lead_key, email, full_name, title, company_name, company_domain, website_url, source, source_ref)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (lead_key) DO UPDATE SET updated_at = now()
       RETURNING (xmax = 0) AS inserted, status`,
      [
        lead.leadKey,
        lead.email,
        lead.fullName,
        lead.title,
        lead.companyName,
        lead.companyDomain,
        lead.websiteUrl,
        lead.source,
        lead.sourceRef,
      ],
    );
    const row = rows[0];
    if (!row) throw new Error(`upsertLead returned no row for ${lead.leadKey}`);
    return row;
  }

  async getLead(leadKey: string): Promise<Lead | null> {
    const { rows } = await this.pool.query<Lead>(
      `SELECT lead_key AS "leadKey", email, full_name AS "fullName", title, company_name AS "companyName",
              company_domain AS "companyDomain", website_url AS "websiteUrl", source, source_ref AS "sourceRef"
         FROM leads WHERE lead_key = $1`,
      [leadKey],
    );
    return rows[0] ?? null;
  }

  async setStatus(leadKey: string, status: LeadStatus, error?: string): Promise<void> {
    await this.pool.query(`UPDATE leads SET status = $2, last_error = $3, updated_at = now() WHERE lead_key = $1`, [
      leadKey,
      status,
      error ?? null,
    ]);
  }

  async saveResearch(leadKey: string, research: StoredResearch): Promise<void> {
    await this.pool.query(
      `INSERT INTO research (lead_key, profile, summary, signals, unknowns)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (lead_key) DO UPDATE
         SET profile = EXCLUDED.profile, summary = EXCLUDED.summary, signals = EXCLUDED.signals,
             unknowns = EXCLUDED.unknowns, updated_at = now()`,
      [
        leadKey,
        research.profile === null ? null : JSON.stringify(research.profile),
        research.notes.summary,
        JSON.stringify(research.notes.signals),
        JSON.stringify(research.notes.unknowns),
      ],
    );
  }

  async getResearch(leadKey: string): Promise<StoredResearch | null> {
    const { rows } = await this.pool.query<{
      profile: StoredResearch['profile'];
      summary: string;
      signals: string[];
      unknowns: string[];
    }>(`SELECT profile, summary, signals, unknowns FROM research WHERE lead_key = $1`, [leadKey]);
    const row = rows[0];
    if (!row) return null;
    return { profile: row.profile, notes: { summary: row.summary, signals: row.signals, unknowns: row.unknowns } };
  }

  async saveVerdict(leadKey: string, verdict: FitVerdict, icpVersion: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO verdicts (lead_key, verdict, reasons, matched_criteria, icp_version)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (lead_key) DO UPDATE
         SET verdict = EXCLUDED.verdict, reasons = EXCLUDED.reasons, matched_criteria = EXCLUDED.matched_criteria,
             icp_version = EXCLUDED.icp_version, updated_at = now()`,
      [leadKey, verdict.verdict, JSON.stringify(verdict.reasons), JSON.stringify(verdict.matchedCriteria), icpVersion],
    );
  }

  async getVerdict(leadKey: string): Promise<FitVerdict | null> {
    const { rows } = await this.pool.query<FitVerdict>(
      `SELECT verdict, reasons, matched_criteria AS "matchedCriteria" FROM verdicts WHERE lead_key = $1`,
      [leadKey],
    );
    return rows[0] ?? null;
  }

  async saveDraft(leadKey: string, draft: OutreachDraft, exampleIds: string[]): Promise<void> {
    // A regenerated draft must not overwrite one a human already reviewed.
    await this.pool.query(
      `INSERT INTO drafts (lead_key, subject, body, personalisation_points, example_message_ids)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (lead_key) DO UPDATE
         SET subject = EXCLUDED.subject, body = EXCLUDED.body,
             personalisation_points = EXCLUDED.personalisation_points,
             example_message_ids = EXCLUDED.example_message_ids, updated_at = now()
         WHERE drafts.status = 'pending_review'`,
      [leadKey, draft.subject, draft.body, JSON.stringify(draft.personalisationPoints), exampleIds],
    );
  }

  async findSimilarMessages(embedding: number[], limit: number): Promise<ExampleMessage[]> {
    if (limit <= 0) return [];
    const { rows } = await this.pool.query<ExampleMessage>(
      `SELECT id, subject, body FROM successful_messages
        ORDER BY embedding <=> $1::vector
        LIMIT $2`,
      [toPgVector(embedding), limit],
    );
    return rows;
  }
}
