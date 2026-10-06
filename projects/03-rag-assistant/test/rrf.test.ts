import { reciprocalRankFusion } from '../src/retrieval/rrf';

const id = (s: string) => s;

describe('reciprocalRankFusion', () => {
  it('rewards items ranked well in both lists', () => {
    const fused = reciprocalRankFusion([['a', 'b', 'c'], ['b', 'c', 'a']], id, 60);
    expect(fused.map((f) => f.item)).toEqual(['b', 'a', 'c']);
  });

  it('computes Σ 1/(k+rank) and records per-list ranks', () => {
    const [top] = reciprocalRankFusion([['a'], ['x', 'a']], id, 10);
    expect(top!.item).toBe('a');
    expect(top!.score).toBeCloseTo(1 / 11 + 1 / 12);
    expect(top!.ranks).toEqual([1, 2]);
  });

  it('keeps items found by only one retriever', () => {
    const fused = reciprocalRankFusion([['a'], ['b']], id);
    expect(fused.map((f) => f.item).sort()).toEqual(['a', 'b']);
    expect(fused.find((f) => f.item === 'b')!.ranks).toEqual([null, 1]);
  });

  it('breaks ties by first appearance, deterministically', () => {
    expect(reciprocalRankFusion([['a'], ['b']], id).map((f) => f.item)).toEqual(['a', 'b']);
  });

  it('counts a duplicate within one list once, at its best rank', () => {
    const [top] = reciprocalRankFusion([['a', 'a']], id, 60);
    expect(top!.score).toBeCloseTo(1 / 61);
  });

  it('handles empty input and rejects a non-positive k', () => {
    expect(reciprocalRankFusion([[], []], id)).toEqual([]);
    expect(() => reciprocalRankFusion([['a']], id, 0)).toThrow();
  });
});
