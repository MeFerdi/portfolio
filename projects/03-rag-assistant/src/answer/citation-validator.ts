import type { Chunk } from '../domain/types';
import { normalizeWhitespace } from '../lib/text';
import type { GroundedAnswer } from './schema';

export const MIN_QUOTE_CHARS = 12;

export type CitationProblem =
  | { kind: 'missing_citations' }
  | { kind: 'unknown_chunk'; chunkId: string }
  | { kind: 'quote_not_verbatim'; chunkId: string; quote: string }
  | { kind: 'quote_too_short'; chunkId: string; quote: string };

/**
 * Verifies that an "answered" response is grounded in what was retrieved:
 * every chunk id must be one we supplied, and every quote must occur in that
 * chunk. Only whitespace is normalised (chunk text may be re-wrapped); case,
 * punctuation and wording must match exactly.
 */
export function validateCitations(answer: GroundedAnswer, retrieved: Chunk[]): CitationProblem[] {
  if (answer.status !== 'answered') return [];
  if (answer.citations.length === 0) return [{ kind: 'missing_citations' }];
  const byId = new Map(retrieved.map((c) => [c.id, c]));
  const problems: CitationProblem[] = [];
  for (const { chunkId, quote } of answer.citations) {
    const chunk = byId.get(chunkId);
    if (!chunk) {
      problems.push({ kind: 'unknown_chunk', chunkId });
      continue;
    }
    const q = normalizeWhitespace(quote);
    if (q.length < MIN_QUOTE_CHARS) {
      problems.push({ kind: 'quote_too_short', chunkId, quote });
    } else if (!isVerbatim(q, chunk.text)) {
      problems.push({ kind: 'quote_not_verbatim', chunkId, quote });
    }
  }
  return problems;
}

export function isVerbatim(quote: string, text: string): boolean {
  // The prompt shows chunk text with < and > entity-escaped; accept quotes copied in either form.
  const q = normalizeWhitespace(quote.replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
  return q.length > 0 && normalizeWhitespace(text).includes(q);
}
