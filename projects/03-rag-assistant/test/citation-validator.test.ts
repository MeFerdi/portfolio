import { isVerbatim, validateCitations } from '../src/answer/citation-validator';
import type { GroundedAnswer } from '../src/answer/schema';
import { chunk } from './helpers';

const retrieved = [
  chunk('expense-policy#2', 'expense-policy', 'The daily meal allowance while travelling is $75 per person.\nClient meals are capped at $120.'),
];

const answered = (citations: GroundedAnswer['citations']): GroundedAnswer => ({ status: 'answered', answer: 'It is $75.', citations });

describe('validateCitations', () => {
  it('accepts a verbatim quote from a retrieved chunk', () => {
    expect(validateCitations(answered([{ chunkId: 'expense-policy#2', quote: 'daily meal allowance while travelling is $75' }]), retrieved)).toEqual([]);
  });

  it('tolerates whitespace differences only', () => {
    expect(validateCitations(answered([{ chunkId: 'expense-policy#2', quote: '$75 per person. Client meals are capped' }]), retrieved)).toEqual([]);
  });

  it('rejects a hallucinated chunk id', () => {
    expect(validateCitations(answered([{ chunkId: 'expense-policy#99', quote: 'daily meal allowance while travelling' }]), retrieved)).toEqual([
      { kind: 'unknown_chunk', chunkId: 'expense-policy#99' },
    ]);
  });

  it('rejects a paraphrased or altered quote', () => {
    const problems = validateCitations(answered([{ chunkId: 'expense-policy#2', quote: 'daily meal allowance when travelling is $75' }]), retrieved);
    expect(problems.map((p) => p.kind)).toEqual(['quote_not_verbatim']);
  });

  it('is case-sensitive', () => {
    const problems = validateCitations(answered([{ chunkId: 'expense-policy#2', quote: 'DAILY MEAL ALLOWANCE while travelling' }]), retrieved);
    expect(problems.map((p) => p.kind)).toEqual(['quote_not_verbatim']);
  });

  it('rejects trivially short quotes that would match anything', () => {
    const problems = validateCitations(answered([{ chunkId: 'expense-policy#2', quote: '$75' }]), retrieved);
    expect(problems.map((p) => p.kind)).toEqual(['quote_too_short']);
  });

  it('rejects an answer with no citations', () => {
    expect(validateCitations(answered([]), retrieved)).toEqual([{ kind: 'missing_citations' }]);
  });

  it('does not require citations for non-answers', () => {
    expect(validateCitations({ status: 'not_in_corpus', answer: 'n/a', citations: [] }, retrieved)).toEqual([]);
  });

  it('reports every bad citation, not just the first', () => {
    const problems = validateCitations(
      answered([
        { chunkId: 'nope#1', quote: 'daily meal allowance' },
        { chunkId: 'expense-policy#2', quote: 'made-up text that is long' },
      ]),
      retrieved,
    );
    expect(problems).toHaveLength(2);
  });
});

describe('isVerbatim', () => {
  it('accepts entity-escaped angle brackets as shown in the prompt', () => {
    expect(isVerbatim('values &lt; 5 are rejected', 'values < 5 are rejected')).toBe(true);
  });
});
