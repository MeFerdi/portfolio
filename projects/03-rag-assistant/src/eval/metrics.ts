import { isVerbatim } from '../answer/citation-validator';
import type { AnswerStatus, Chunk } from '../domain/types';

/** Distinct doc ids in first-seen order: chunk rank -> document rank. */
export function rankedDocIds(chunks: Pick<Chunk, 'docId'>[]): string[] {
  return [...new Set(chunks.map((c) => c.docId))];
}

/** Share of expected docs present in the top-k ranked docs. Null when nothing is expected. */
export function recallAtK(ranked: string[], expected: string[], k: number): number | null {
  if (expected.length === 0) return null;
  const top = new Set(ranked.slice(0, k));
  return expected.filter((d) => top.has(d)).length / expected.length;
}

/** 1 / rank of the first expected doc (0 if absent). Null when nothing is expected. */
export function reciprocalRank(ranked: string[], expected: string[]): number | null {
  if (expected.length === 0) return null;
  const want = new Set(expected);
  const idx = ranked.findIndex((d) => want.has(d));
  return idx === -1 ? 0 : 1 / (idx + 1);
}

/**
 * Share of citations that point at a retrieved chunk, from an expected document,
 * with a verbatim quote. Null when there are no citations to judge.
 */
export function citationCorrectness(
  citations: { chunkId: string; quote: string }[],
  retrieved: Chunk[],
  expectedDocIds: string[],
): number | null {
  if (citations.length === 0) return null;
  const byId = new Map(retrieved.map((c) => [c.id, c]));
  const want = new Set(expectedDocIds);
  const ok = citations.filter((c) => {
    const chunk = byId.get(c.chunkId);
    return chunk !== undefined && (want.size === 0 || want.has(chunk.docId)) && isVerbatim(c.quote, chunk.text);
  });
  return ok.length / citations.length;
}

/** Null when the item has no expectations about answer text. */
export function answerContains(answer: string, needles: string[] | undefined): number | null {
  if (!needles?.length) return null;
  const hay = answer.toLowerCase();
  return needles.every((n) => hay.includes(n.toLowerCase())) ? 1 : 0;
}

export function statusMatch(actual: AnswerStatus | undefined, expected: AnswerStatus): number {
  return actual === expected ? 1 : 0;
}

/**
 * Did the retrieval gate make the right call? Answerable items must pass,
 * out-of-corpus items must be stopped. Refusal items are the model's job: null.
 */
export function gateCorrect(passed: boolean, expected: AnswerStatus): number | null {
  if (expected === 'answered') return passed ? 1 : 0;
  if (expected === 'not_in_corpus') return passed ? 0 : 1;
  return null;
}

export type FaithfulnessVerdict = 'faithful' | 'partially_faithful' | 'unfaithful';

export function faithfulnessScore(verdict: FaithfulnessVerdict): number {
  return { faithful: 1, partially_faithful: 0.5, unfaithful: 0 }[verdict];
}

export interface Aggregate {
  value: number | null;
  /** Items that contributed (non-null). */
  n: number;
}

export function mean(values: (number | null | undefined)[]): Aggregate {
  const xs = values.filter((v): v is number => typeof v === 'number');
  return { value: xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null, n: xs.length };
}
