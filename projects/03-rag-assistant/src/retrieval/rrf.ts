export interface Fused<T> {
  item: T;
  score: number;
  /** 1-based rank in each input list, or null where the item was absent. */
  ranks: (number | null)[];
}

/**
 * Reciprocal rank fusion (Cormack et al., 2009): score = Σ 1 / (k + rank).
 * Uses ranks only, so lists with incomparable score scales (cosine vs BM25)
 * can be merged without normalisation. Ties break on first appearance.
 */
export function reciprocalRankFusion<T>(lists: T[][], keyOf: (item: T) => string, k = 60): Fused<T>[] {
  if (k <= 0) throw new Error('RRF k must be positive');
  const fused = new Map<string, Fused<T> & { firstSeen: number }>();
  let seen = 0;
  lists.forEach((list, listIndex) => {
    const seenInList = new Set<string>();
    list.forEach((item, i) => {
      const key = keyOf(item);
      if (seenInList.has(key)) return; // duplicates within one list count once, at their best rank
      seenInList.add(key);
      let entry = fused.get(key);
      if (!entry) {
        entry = { item, score: 0, ranks: lists.map(() => null), firstSeen: seen++ };
        fused.set(key, entry);
      }
      entry.score += 1 / (k + i + 1);
      entry.ranks[listIndex] = i + 1;
    });
  });
  return [...fused.values()]
    .sort((a, b) => b.score - a.score || a.firstSeen - b.firstSeen)
    .map(({ firstSeen: _firstSeen, ...rest }) => rest);
}
