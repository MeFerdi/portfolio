import {
  answerContains,
  citationCorrectness,
  faithfulnessScore,
  gateCorrect,
  mean,
  rankedDocIds,
  recallAtK,
  reciprocalRank,
  statusMatch,
} from '../src/eval/metrics';
import { chunk } from './helpers';

describe('retrieval metrics', () => {
  it('rankedDocIds dedupes chunk-level ranks into doc ranks', () => {
    expect(rankedDocIds([{ docId: 'a' }, { docId: 'a' }, { docId: 'b' }])).toEqual(['a', 'b']);
  });

  it('recall@k counts expected docs inside the cutoff', () => {
    expect(recallAtK(['a', 'b', 'c'], ['a', 'c'], 2)).toBe(0.5);
    expect(recallAtK(['a', 'b', 'c'], ['a', 'c'], 3)).toBe(1);
    expect(recallAtK(['x'], ['a'], 5)).toBe(0);
    expect(recallAtK(['a'], [], 5)).toBeNull();
  });

  it('reciprocal rank uses the first relevant doc', () => {
    expect(reciprocalRank(['x', 'a', 'b'], ['b', 'a'])).toBe(0.5);
    expect(reciprocalRank(['x'], ['a'])).toBe(0);
    expect(reciprocalRank(['a'], [])).toBeNull();
  });
});

describe('citationCorrectness', () => {
  const retrieved = [chunk('d1#0', 'd1', 'Receipts are required for every expense over $25.'), chunk('d2#0', 'd2', 'Other text here.')];

  it('scores the share of valid citations', () => {
    const score = citationCorrectness(
      [
        { chunkId: 'd1#0', quote: 'required for every expense over $25' }, // ok
        { chunkId: 'd1#0', quote: 'required for all expenses' }, // paraphrase
        { chunkId: 'zz#9', quote: 'Receipts are required' }, // unknown chunk
        { chunkId: 'd2#0', quote: 'Other text here.' }, // wrong doc
      ],
      retrieved,
      ['d1'],
    );
    expect(score).toBe(0.25);
  });

  it('is null when there is nothing to score', () => {
    expect(citationCorrectness([], retrieved, ['d1'])).toBeNull();
  });
});

describe('answer and status metrics', () => {
  it('answerContains requires every needle, case-insensitively', () => {
    expect(answerContains('Up to 5 days, used by March 31.', ['5', 'march 31'])).toBe(1);
    expect(answerContains('Up to 5 days.', ['5', 'March 31'])).toBe(0);
    expect(answerContains('anything', undefined)).toBeNull();
  });

  it('statusMatch is exact', () => {
    expect(statusMatch('refused', 'refused')).toBe(1);
    expect(statusMatch('not_in_corpus', 'refused')).toBe(0);
    expect(statusMatch(undefined, 'answered')).toBe(0);
  });

  it('gateCorrect only judges answerable and out-of-corpus items', () => {
    expect(gateCorrect(true, 'answered')).toBe(1);
    expect(gateCorrect(false, 'answered')).toBe(0);
    expect(gateCorrect(false, 'not_in_corpus')).toBe(1);
    expect(gateCorrect(true, 'not_in_corpus')).toBe(0);
    expect(gateCorrect(true, 'refused')).toBeNull();
  });

  it('faithfulnessScore maps verdicts', () => {
    expect([faithfulnessScore('faithful'), faithfulnessScore('partially_faithful'), faithfulnessScore('unfaithful')]).toEqual([1, 0.5, 0]);
  });

  it('mean ignores nulls and reports n', () => {
    expect(mean([1, null, 0, undefined])).toEqual({ value: 0.5, n: 2 });
    expect(mean([null])).toEqual({ value: null, n: 0 });
  });
});
