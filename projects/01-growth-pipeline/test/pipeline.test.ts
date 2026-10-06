import { MissingRecordError } from '../src/db/repository';
import { LlmOutputError } from '../src/llm/client';
import { handleIngest, runInline } from '../src/pipeline/handlers';
import { leadKey } from '../src/pipeline/idempotency';
import { TASKS } from '../src/pipeline/schemas';
import { InvalidLeadError } from '../src/pipeline/stages/ingest';
import { isPermanent } from '../src/pipeline/workers';
import { FakeLlm } from './fakes';
import { draftResponse, FakeProfileSource, InMemoryRepository, makeDeps, researchResponse } from './support';

const rawLead = {
  email: 'Jane@Acme.example',
  fullName: 'Jane Doe',
  title: 'VP Engineering',
  companyName: 'Acme Data Cloud',
  companyDomain: 'acme.example',
  source: 'test',
};

const fitVerdict = { verdict: 'fit', reasons: ['B2B SaaS, 150 staff'], matchedCriteria: ['b2b-saas', 'company-size-50-500'] };
const unfitVerdict = { verdict: 'unfit', reasons: ['Agency'], matchedCriteria: [] };

function llmReturning(verdict: unknown) {
  return new FakeLlm({
    [TASKS.research]: () => researchResponse,
    [TASKS.icpFit]: () => verdict,
    [TASKS.outreachDraft]: () => draftResponse,
  });
}

describe('pipeline stages (inline, no queues)', () => {
  it('takes a fitting lead all the way to a draft, using retrieved examples', async () => {
    const example = { id: '00000000-0000-0000-0000-000000000001', subject: 'Hi', body: 'Example that worked.' };
    const repo = new InMemoryRepository([example]);
    const llm = llmReturning(fitVerdict);
    const deps = makeDeps({ llm, repo });

    const result = await runInline(deps, rawLead);

    expect(result.outcome).toBe('drafted');
    expect(llm.calls.map((c) => c.task)).toEqual(['lead-research', 'icp-fit', 'outreach-draft']);
    expect(repo.drafts.get(result.leadKey)).toEqual({ draft: draftResponse, exampleIds: [example.id] });
    expect(repo.leads.get(result.leadKey)?.status).toBe('drafted');
  });

  it('stops after scoring for an unfit lead and never calls the drafter', async () => {
    const repo = new InMemoryRepository();
    const llm = llmReturning(unfitVerdict);

    const result = await runInline(makeDeps({ llm, repo }), rawLead);

    expect(result.outcome).toBe('disqualified');
    expect(llm.calls.map((c) => c.task)).not.toContain('outreach-draft');
    expect(repo.drafts.size).toBe(0);
    expect(repo.verdicts.get(result.leadKey)?.verdict).toBe('unfit');
  });

  it('treats a re-submitted lead as a duplicate once it has progressed', async () => {
    const repo = new InMemoryRepository();
    const deps = makeDeps({ llm: llmReturning(fitVerdict), repo });

    await runInline(deps, rawLead);
    const again = await handleIngest(deps, { ...rawLead, email: ' jane@acme.EXAMPLE ' });

    expect(again).toEqual({ leadKey: leadKey({ email: 'jane@acme.example' }), done: 'duplicate' });
    expect(repo.leads.size).toBe(1);
  });

  it('resumes a lead stuck at "ingested" (crash between insert and enqueue)', async () => {
    const deps = makeDeps({ llm: llmReturning(fitVerdict) });
    await handleIngest(deps, rawLead);
    await expect(handleIngest(deps, rawLead)).resolves.toMatchObject({ next: 'research' });
  });

  it('falls back to lead-only research when the company page cannot be fetched', async () => {
    const llm = llmReturning(fitVerdict);
    const profiles = new FakeProfileSource(new Error('robots.txt disallows fetching'));
    const repo = new InMemoryRepository();

    const result = await runInline(makeDeps({ llm, profiles, repo }), rawLead);

    expect(result.outcome).toBe('drafted');
    expect(profiles.requested).toEqual(['https://acme.example/']);
    expect(llm.calls[0]?.prompt).toContain('could not be fetched');
    expect(repo.research.get(result.leadKey)?.profile).toBeNull();
  });

  it('drafts without examples when embeddings are unavailable', async () => {
    const repo = new InMemoryRepository([{ id: 'x', subject: 's', body: 'b' }]);
    const result = await runInline(makeDeps({ llm: llmReturning(fitVerdict), repo, embeddings: null }), rawLead);
    expect(repo.drafts.get(result.leadKey)?.exampleIds).toEqual([]);
  });

  it('fails the job when the model drifts, so BullMQ can retry it', async () => {
    const llm = llmReturning({ verdict: 'probably', reasons: [], matchedCriteria: [] });
    await expect(runInline(makeDeps({ llm }), rawLead)).rejects.toThrow();
  });
});

describe('retry classification', () => {
  it.each([
    [new InvalidLeadError('no email'), true],
    [new MissingRecordError('lead', 'abc'), true],
    [new LlmOutputError('icp-fit', 'refused (cyber)'), true],
    [new LlmOutputError('icp-fit', 'truncated at max_tokens'), false],
    [new Error('ECONNRESET'), false],
  ])('isPermanent(%s) = %s', (err, expected) => {
    expect(isPermanent(err)).toBe(expected);
  });
});
