import { z } from 'zod';
import type { Chunk } from '../domain/types';
import type { LlmClient } from '../llm/client';
import { renderUntrustedChunks, UNTRUSTED_DATA_RULES } from '../answer/prompt';

export interface Reranker {
  readonly name: string;
  rerank(question: string, candidates: Chunk[]): Promise<Chunk[]>;
}

/** Baseline: keeps fusion order. */
export class IdentityReranker implements Reranker {
  readonly name = 'identity';
  async rerank(_question: string, candidates: Chunk[]): Promise<Chunk[]> {
    return candidates;
  }
}

export const RerankSchema = z.object({
  ranking: z
    .array(
      z.object({
        chunkId: z.string(),
        relevance: z.number().int().min(0).max(3).describe('0 = irrelevant, 3 = directly answers the question'),
      }),
    )
    .describe('One entry per candidate chunk'),
});
export type RerankOutput = z.infer<typeof RerankSchema>;

/** Listwise LLM relevance grading. One call per question over all candidates. */
export class LlmReranker implements Reranker {
  readonly name = 'llm';

  constructor(private readonly llm: LlmClient) {}

  async rerank(question: string, candidates: Chunk[]): Promise<Chunk[]> {
    if (candidates.length <= 1) return candidates;
    const output = await this.llm.structured({
      task: 'rerank',
      system: [
        'You grade how relevant each document chunk is to a question about internal company policy.',
        UNTRUSTED_DATA_RULES,
      ].join('\n\n'),
      prompt: `${renderUntrustedChunks(candidates)}\n\n<question>${question}</question>\n\nGrade every chunk.`,
      schema: RerankSchema,
      effort: 'low',
      maxTokens: 4000,
    });
    return applyRanking(candidates, output);
  }
}

/**
 * Stable sort by model relevance. Ids the model invented are ignored and
 * chunks it forgot keep their fusion position relative to each other, after
 * graded ones of equal relevance, so a sloppy grader can only reorder, never drop.
 */
export function applyRanking(candidates: Chunk[], output: RerankOutput): Chunk[] {
  const relevance = new Map<string, number>();
  for (const r of output.ranking) if (!relevance.has(r.chunkId)) relevance.set(r.chunkId, r.relevance);
  return candidates
    .map((chunk, i) => ({ chunk, i, rel: relevance.get(chunk.id) ?? -1 }))
    .sort((a, b) => b.rel - a.rel || a.i - b.i)
    .map((x) => x.chunk);
}
