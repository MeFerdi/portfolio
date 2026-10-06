import { createHash } from 'node:crypto';
import pino from 'pino';
import type { PipelineRepository, StoredResearch } from '../src/db/repository';
import type { ExampleMessage } from '../src/domain/example-message';
import { IcpSchema, type Icp } from '../src/domain/icp';
import type { Lead, LeadStatus } from '../src/domain/lead';
import type { EmbeddingInputType, EmbeddingProvider } from '../src/embeddings/provider';
import type { PipelineDeps } from '../src/pipeline/handlers';
import type { FitVerdict, OutreachDraft } from '../src/pipeline/schemas';
import type { ProfileSource } from '../src/scraper/playwright-source';
import type { CompanyProfile } from '../src/scraper/profile-parser';
import type { FakeLlm } from './fakes';

export const testIcp: Icp = IcpSchema.parse({
  version: 'test-1',
  name: 'Test ICP',
  summary: 'B2B SaaS, 50-500 employees.',
  criteria: [
    { id: 'b2b-saas', description: 'Sells SaaS to businesses', required: true },
    { id: 'company-size-50-500', description: '50-500 employees', required: true },
    { id: 'technical-buyer', description: 'Engineering leader' },
  ],
  disqualifiers: ['Agencies'],
});

/** Deterministic embeddings: same text, same unit vector. Useful for wiring, not for semantic quality. */
export class FakeEmbeddingProvider implements EmbeddingProvider {
  readonly calls: { texts: string[]; inputType: EmbeddingInputType }[] = [];

  constructor(readonly dimensions = 8) {}

  async embed(texts: string[], inputType: EmbeddingInputType): Promise<number[][]> {
    this.calls.push({ texts, inputType });
    return texts.map((t) => {
      const bytes = createHash('sha256').update(t).digest();
      const v = Array.from({ length: this.dimensions }, (_, i) => (bytes[i % bytes.length] ?? 0) - 127.5);
      const norm = Math.hypot(...v);
      return v.map((x) => x / norm);
    });
  }
}

export class FakeProfileSource implements ProfileSource {
  readonly requested: string[] = [];

  constructor(private readonly profile: CompanyProfile | Error) {}

  async fetchProfile(url: string): Promise<CompanyProfile> {
    this.requested.push(url);
    if (this.profile instanceof Error) throw this.profile;
    return this.profile;
  }

  async close(): Promise<void> {}
}

export class InMemoryRepository implements PipelineRepository {
  readonly leads = new Map<string, { lead: Lead; status: LeadStatus; error?: string }>();
  readonly research = new Map<string, StoredResearch>();
  readonly verdicts = new Map<string, FitVerdict>();
  readonly drafts = new Map<string, { draft: OutreachDraft; exampleIds: string[] }>();

  constructor(readonly examples: ExampleMessage[] = []) {}

  async upsertLead(lead: Lead) {
    const existing = this.leads.get(lead.leadKey);
    if (existing) return { inserted: false, status: existing.status };
    this.leads.set(lead.leadKey, { lead, status: 'ingested' });
    return { inserted: true, status: 'ingested' as const };
  }
  async getLead(leadKey: string) {
    return this.leads.get(leadKey)?.lead ?? null;
  }
  async setStatus(leadKey: string, status: LeadStatus, error?: string) {
    const row = this.leads.get(leadKey);
    if (row) this.leads.set(leadKey, { ...row, status, error });
  }
  async saveResearch(leadKey: string, research: StoredResearch) {
    this.research.set(leadKey, research);
  }
  async getResearch(leadKey: string) {
    return this.research.get(leadKey) ?? null;
  }
  async saveVerdict(leadKey: string, verdict: FitVerdict) {
    this.verdicts.set(leadKey, verdict);
  }
  async getVerdict(leadKey: string) {
    return this.verdicts.get(leadKey) ?? null;
  }
  async saveDraft(leadKey: string, draft: OutreachDraft, exampleIds: string[]) {
    this.drafts.set(leadKey, { draft, exampleIds });
  }
  async findSimilarMessages(_embedding: number[], limit: number) {
    return this.examples.slice(0, limit);
  }
}

export const sampleProfile: CompanyProfile = {
  url: 'https://acme.example/',
  name: 'Acme Data Cloud',
  description: 'Managed data pipelines for B2B SaaS teams.',
  industry: 'Software',
  employeeCount: 150,
  location: 'Nairobi, KE',
  socialLinks: [],
  hasCareersPage: true,
  headings: ['We run your data plumbing'],
  textExcerpt: 'Acme Data Cloud operates ingestion pipelines.',
};

export const researchResponse = {
  summary: 'Acme Data Cloud sells managed data pipelines to B2B SaaS companies; about 150 employees.',
  signals: ['Hiring platform engineers per careers page'],
  unknowns: ['Annual revenue'],
};

export const draftResponse = {
  subject: 'Pipelines for Acme’s platform hires',
  body: 'Hi Jane, saw Acme is hiring platform engineers. We help teams like yours cut pipeline toil. Worth a 15-minute call next week?',
  personalisationPoints: ['Hiring platform engineers'],
};

export function makeDeps(overrides: Partial<PipelineDeps> & { llm: FakeLlm }): PipelineDeps {
  return {
    repo: new InMemoryRepository(),
    icp: testIcp,
    profiles: new FakeProfileSource(sampleProfile),
    embeddings: new FakeEmbeddingProvider(),
    draftExamplesK: 2,
    logger: pino({ level: 'silent' }),
    ...overrides,
  };
}
