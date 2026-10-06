import type { Logger } from 'pino';
import { MissingRecordError, type PipelineRepository } from '../db/repository';
import type { ExampleMessage } from '../domain/example-message';
import type { Icp } from '../domain/icp';
import type { EmbeddingProvider } from '../embeddings/provider';
import type { LlmClient } from '../llm/client';
import type { CompanyProfile } from '../scraper/profile-parser';
import type { ProfileSource } from '../scraper/playwright-source';
import type { StageName } from './idempotency';
import { draftOutreach, exampleQueryText, shouldDraft } from './stages/draft';
import { normaliseLead, researchUrl } from './stages/ingest';
import { researchLead } from './stages/research';
import { evaluateFit } from './stages/score';

/**
 * One function per pipeline stage. Each loads what it needs by leadKey,
 * does its work, persists the result, and says what should happen next.
 * They know nothing about BullMQ, so they run the same under the queue
 * workers (src/pipeline/workers.ts), the inline runner, and in tests.
 */

export interface PipelineDeps {
  repo: PipelineRepository;
  llm: LlmClient;
  icp: Icp;
  profiles: ProfileSource;
  /** null disables example retrieval; the drafter then works without examples. */
  embeddings: EmbeddingProvider | null;
  draftExamplesK: number;
  logger: Logger;
}

export type Outcome = 'duplicate' | 'disqualified' | 'drafted';

export type Transition =
  | { leadKey: string; next: Exclude<StageName, 'ingest'> }
  | { leadKey: string; done: Outcome };

export interface LeadJobData {
  leadKey: string;
}

export async function handleIngest(deps: PipelineDeps, rawLead: unknown): Promise<Transition> {
  const lead = normaliseLead(rawLead);
  const { inserted, status } = await deps.repo.upsertLead(lead);
  // A lead still at 'ingested' may be a retry after a crash between the insert
  // and the enqueue, so it continues; anything further along is a true duplicate.
  if (!inserted && status !== 'ingested') {
    deps.logger.info({ leadKey: lead.leadKey, status }, 'duplicate lead skipped');
    return { leadKey: lead.leadKey, done: 'duplicate' };
  }
  return { leadKey: lead.leadKey, next: 'research' };
}

export async function handleResearch(deps: PipelineDeps, { leadKey }: LeadJobData): Promise<Transition> {
  const lead = await deps.repo.getLead(leadKey);
  if (!lead) throw new MissingRecordError('lead', leadKey);

  let profile: CompanyProfile | null = null;
  const url = researchUrl(lead);
  if (url) {
    try {
      profile = await deps.profiles.fetchProfile(url);
    } catch (err) {
      // Fallback: research from the lead record alone rather than failing the lead.
      deps.logger.warn({ leadKey, err: (err as Error).message }, 'profile fetch failed; researching without it');
    }
  }

  const notes = await researchLead(deps.llm, lead, profile);
  await deps.repo.saveResearch(leadKey, { profile, notes });
  await deps.repo.setStatus(leadKey, 'researched');
  return { leadKey, next: 'score' };
}

export async function handleScore(deps: PipelineDeps, { leadKey }: LeadJobData): Promise<Transition> {
  const [lead, research] = await Promise.all([deps.repo.getLead(leadKey), deps.repo.getResearch(leadKey)]);
  if (!lead) throw new MissingRecordError('lead', leadKey);
  if (!research) throw new MissingRecordError('research', leadKey);

  const verdict = await evaluateFit(deps.llm, deps.icp, lead, research.notes);
  await deps.repo.saveVerdict(leadKey, verdict, deps.icp.version);

  if (!shouldDraft(verdict)) {
    await deps.repo.setStatus(leadKey, 'disqualified');
    return { leadKey, done: 'disqualified' };
  }
  await deps.repo.setStatus(leadKey, 'scored');
  return { leadKey, next: 'draft' };
}

export async function handleDraft(deps: PipelineDeps, { leadKey }: LeadJobData): Promise<Transition> {
  const [lead, research, verdict] = await Promise.all([
    deps.repo.getLead(leadKey),
    deps.repo.getResearch(leadKey),
    deps.repo.getVerdict(leadKey),
  ]);
  if (!lead) throw new MissingRecordError('lead', leadKey);
  if (!research) throw new MissingRecordError('research', leadKey);
  if (!verdict) throw new MissingRecordError('verdict', leadKey);

  const examples = await findExamples(deps, exampleQueryText(lead, research.notes));
  const result = await draftOutreach(deps.llm, { lead, research: research.notes, verdict, examples });
  if (result.skipped) {
    await deps.repo.setStatus(leadKey, 'disqualified');
    return { leadKey, done: 'disqualified' };
  }

  await deps.repo.saveDraft(
    leadKey,
    result.draft,
    examples.map((e) => e.id),
  );
  await deps.repo.setStatus(leadKey, 'drafted');
  return { leadKey, done: 'drafted' };
}

async function findExamples(deps: PipelineDeps, query: string): Promise<ExampleMessage[]> {
  if (!deps.embeddings || deps.draftExamplesK === 0) return [];
  try {
    const [vector] = await deps.embeddings.embed([query], 'query');
    return vector ? await deps.repo.findSimilarMessages(vector, deps.draftExamplesK) : [];
  } catch (err) {
    // Examples improve drafts but are not required for one.
    deps.logger.warn({ err: (err as Error).message }, 'example retrieval failed; drafting without examples');
    return [];
  }
}

/** Runs one lead through every stage in-process. Used by tests and local dry runs; production uses the queues. */
export async function runInline(deps: PipelineDeps, rawLead: unknown): Promise<{ leadKey: string; outcome: Outcome }> {
  let t = await handleIngest(deps, rawLead);
  while ('next' in t) {
    const data = { leadKey: t.leadKey };
    t =
      t.next === 'research'
        ? await handleResearch(deps, data)
        : t.next === 'score'
          ? await handleScore(deps, data)
          : await handleDraft(deps, data);
  }
  return { leadKey: t.leadKey, outcome: t.done };
}
