import { tokenize } from '../lib/text';

export interface Bm25Params {
  k1: number;
  b: number;
}

/** Okapi BM25 over pre-tokenised documents. In-memory stand-in for Postgres full-text search. */
export class Bm25Index {
  private readonly docs = new Map<string, Map<string, number>>();
  private readonly lengths = new Map<string, number>();
  private readonly docFreq = new Map<string, number>();
  private totalLength = 0;

  constructor(private readonly params: Bm25Params = { k1: 1.2, b: 0.75 }) {}

  add(id: string, text: string): void {
    this.remove(id);
    const tf = new Map<string, number>();
    const tokens = tokenize(text);
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    this.docs.set(id, tf);
    this.lengths.set(id, tokens.length);
    this.totalLength += tokens.length;
    for (const t of tf.keys()) this.docFreq.set(t, (this.docFreq.get(t) ?? 0) + 1);
  }

  remove(id: string): void {
    const tf = this.docs.get(id);
    if (!tf) return;
    for (const t of tf.keys()) {
      const df = (this.docFreq.get(t) ?? 1) - 1;
      if (df === 0) this.docFreq.delete(t);
      else this.docFreq.set(t, df);
    }
    this.totalLength -= this.lengths.get(id) ?? 0;
    this.docs.delete(id);
    this.lengths.delete(id);
  }

  search(query: string, k: number): { id: string; score: number }[] {
    const terms = [...new Set(tokenize(query))];
    const n = this.docs.size;
    if (n === 0 || terms.length === 0) return [];
    const avgLen = this.totalLength / n;
    const { k1, b } = this.params;
    const results: { id: string; score: number }[] = [];
    for (const [id, tf] of this.docs) {
      let score = 0;
      const len = this.lengths.get(id) ?? 0;
      for (const term of terms) {
        const f = tf.get(term);
        if (!f) continue;
        const df = this.docFreq.get(term) ?? 0;
        const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5));
        score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * len) / avgLen)));
      }
      if (score > 0) results.push({ id, score });
    }
    return results.sort((x, y) => y.score - x.score || x.id.localeCompare(y.id)).slice(0, k);
  }
}
