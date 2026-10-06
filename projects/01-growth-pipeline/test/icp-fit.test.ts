import { normaliseLead } from '../src/pipeline/stages/ingest';
import { applyIcpRules, evaluateFit } from '../src/pipeline/stages/score';
import { TASKS } from '../src/pipeline/schemas';
import { FakeLlm } from './fakes';
import { researchResponse, testIcp } from './support';

const lead = normaliseLead({ email: 'jane@acme.example', fullName: 'Jane Doe', title: 'VP Engineering', source: 'test' });

const fitWith = (response: unknown) => new FakeLlm({ [TASKS.icpFit]: () => response });

describe('icp-fit contract', () => {
  it('returns a validated verdict', async () => {
    const llm = fitWith({
      verdict: 'fit',
      reasons: ['B2B SaaS with ~150 staff'],
      matchedCriteria: ['b2b-saas', 'company-size-50-500'],
    });
    await expect(evaluateFit(llm, testIcp, lead, researchResponse)).resolves.toEqual({
      verdict: 'fit',
      reasons: ['B2B SaaS with ~150 staff'],
      matchedCriteria: ['b2b-saas', 'company-size-50-500'],
    });
    expect(llm.calls[0]?.task).toBe('icp-fit');
    expect(llm.calls[0]?.system).toContain('b2b-saas (required)');
  });

  it.each([
    ['an unknown verdict label', { verdict: 'maybe', reasons: ['x'], matchedCriteria: [] }],
    ['a criterion id not in the ICP', { verdict: 'fit', reasons: ['x'], matchedCriteria: ['made-up-criterion'] }],
    ['no reasons', { verdict: 'unfit', reasons: [], matchedCriteria: [] }],
    ['a missing field', { verdict: 'fit', reasons: ['x'] }],
    ['prose instead of JSON', 'This lead looks like a great fit!'],
  ])('rejects drift: %s', async (_label, response) => {
    await expect(evaluateFit(fitWith(response), testIcp, lead, researchResponse)).rejects.toThrow();
  });

  it('puts scraped content inside the untrusted fence', async () => {
    const llm = fitWith({ verdict: 'unfit', reasons: ['agency'], matchedCriteria: [] });
    await evaluateFit(llm, testIcp, lead, researchResponse);
    expect(llm.calls[0]?.prompt).toMatch(/<untrusted>[\s\S]*Jane Doe[\s\S]*<\/untrusted>/);
  });
});

describe('applyIcpRules', () => {
  it('downgrades "fit" to "partial" when a required criterion is not cited', () => {
    const result = applyIcpRules({ verdict: 'fit', reasons: ['looks good'], matchedCriteria: ['b2b-saas'] }, testIcp);
    expect(result.verdict).toBe('partial');
    expect(result.reasons.at(-1)).toContain('company-size-50-500');
  });

  it('leaves a fully evidenced "fit" alone and de-duplicates criteria', () => {
    const result = applyIcpRules(
      { verdict: 'fit', reasons: ['ok'], matchedCriteria: ['b2b-saas', 'company-size-50-500', 'b2b-saas'] },
      testIcp,
    );
    expect(result).toEqual({ verdict: 'fit', reasons: ['ok'], matchedCriteria: ['b2b-saas', 'company-size-50-500'] });
  });

  it('never upgrades "unfit"', () => {
    const result = applyIcpRules(
      { verdict: 'unfit', reasons: ['agency'], matchedCriteria: ['b2b-saas', 'company-size-50-500'] },
      testIcp,
    );
    expect(result.verdict).toBe('unfit');
  });
});
