import { draftOutreach, shouldDraft } from '../src/pipeline/stages/draft';
import { normaliseLead } from '../src/pipeline/stages/ingest';
import { TASKS, type FitVerdict } from '../src/pipeline/schemas';
import { FakeLlm } from './fakes';
import { draftResponse, researchResponse } from './support';

const lead = normaliseLead({ email: 'jane@acme.example', fullName: 'Jane Doe', source: 'test' });
const fit: FitVerdict = { verdict: 'fit', reasons: ['B2B SaaS'], matchedCriteria: ['b2b-saas'] };
const examples = [{ id: '00000000-0000-0000-0000-000000000001', subject: 'Quick idea', body: 'Short example body.' }];

const draftWith = (response: unknown) => new FakeLlm({ [TASKS.outreachDraft]: () => response });

describe('outreach-draft contract', () => {
  it('returns a validated draft and passes examples to the model', async () => {
    const llm = draftWith(draftResponse);
    const result = await draftOutreach(llm, { lead, research: researchResponse, verdict: fit, examples });
    expect(result).toEqual({ skipped: false, draft: draftResponse });
    expect(llm.calls[0]?.task).toBe('outreach-draft');
    expect(llm.calls[0]?.prompt).toContain('Short example body.');
  });

  it.each([
    ['an unfilled {{placeholder}}', { ...draftResponse, body: 'Hi {{firstName}}, quick question.' }],
    ['a [Company] placeholder in the subject', { ...draftResponse, subject: 'Idea for [Company]' }],
    ['an over-long subject', { ...draftResponse, subject: 'x'.repeat(121) }],
    ['no personalisation points', { ...draftResponse, personalisationPoints: [] }],
    ['a missing body', { subject: draftResponse.subject, personalisationPoints: ['x'] }],
  ])('rejects drift: %s', async (_label, response) => {
    await expect(
      draftOutreach(draftWith(response), { lead, research: researchResponse, verdict: fit, examples: [] }),
    ).rejects.toThrow();
  });
});

describe('drafting gate', () => {
  it.each([
    ['fit', true],
    ['partial', true],
    ['unfit', false],
  ] as const)('shouldDraft(%s) = %s', (verdict, expected) => {
    expect(shouldDraft({ verdict, reasons: ['r'], matchedCriteria: [] })).toBe(expected);
  });

  it('skips drafting for "unfit" without calling the model', async () => {
    const llm = new FakeLlm({}); // any call would throw "no responder"
    const result = await draftOutreach(llm, {
      lead,
      research: researchResponse,
      verdict: { verdict: 'unfit', reasons: ['agency'], matchedCriteria: [] },
      examples: [],
    });
    expect(result).toEqual({ skipped: true, reason: 'verdict is unfit' });
    expect(llm.calls).toHaveLength(0);
  });
});
