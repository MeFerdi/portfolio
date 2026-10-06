import type { Chunk } from '../domain/types';
import type { EmbeddingProvider } from '../ingest/embeddings';
import type { VectorStore } from '../store/vector-store';
import type { Reranker } from './reranker';
import { reciprocalRankFusion } from './rrf';

export interface RetrievalOptions {
  /** Candidates pulled from each index before fusion. */
  candidates: number;
  /** Chunks returned after reranking (the model's context). */
  topK: number;
  rrfK: number;
}

export const DEFAULT_RETRIEVAL_OPTIONS: RetrievalOptions = { candidates: 20, topK: 5, rrfK: 60 };

export interface RetrievalResult {
  chunks: Chunk[];
  /** Best cosine similarity; drives the not-in-corpus gate. */
  topVectorScore: number;
  keywordHits: number;
}

export class HybridRetriever {
  constructor(
    private readonly embedder: EmbeddingProvider,
    private readonly store: VectorStore,
    private readonly reranker: Reranker,
    private readonly options: RetrievalOptions = DEFAULT_RETRIEVAL_OPTIONS,
  ) {}

  get rerankerName(): string {
    return this.reranker.name;
  }

  async retrieve(question: string): Promise<RetrievalResult> {
    const [queryEmbedding] = await this.embedder.embed([question], 'query');
    if (!queryEmbedding) throw new Error('Embedder returned no vector for the query');
    const [vector, keyword] = await Promise.all([
      this.store.vectorSearch(queryEmbedding, this.options.candidates),
      this.store.keywordSearch(question, this.options.candidates),
    ]);
    const fused = reciprocalRankFusion(
      [vector.map((s) => s.chunk), keyword.map((s) => s.chunk)],
      (c) => c.id,
      this.options.rrfK,
    ).map((f) => f.item);
    // Rerank depth = candidates: bounds LLM reranker cost regardless of list overlap.
    const reranked = await this.reranker.rerank(question, fused.slice(0, this.options.candidates));
    return {
      chunks: reranked.slice(0, this.options.topK),
      topVectorScore: vector[0]?.score ?? 0,
      keywordHits: keyword.length,
    };
  }
}
