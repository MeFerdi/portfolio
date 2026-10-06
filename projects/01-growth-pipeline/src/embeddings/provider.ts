/**
 * Embeddings for the store of historically successful outreach messages.
 * Anthropic does not offer an embeddings API; the intended production
 * implementation is Voyage AI. Tests use a deterministic fake (test/fakes.ts).
 *
 * The dimension must match the `vector(N)` column in migrations/001_init.sql.
 */
export const EMBEDDING_DIMENSIONS = 1024;

export type EmbeddingInputType = 'document' | 'query';

export interface EmbeddingProvider {
  readonly dimensions: number;
  /** One vector per input, in input order. */
  embed(texts: string[], inputType: EmbeddingInputType): Promise<number[][]>;
}

export class VoyageEmbeddingProvider implements EmbeddingProvider {
  readonly dimensions = EMBEDDING_DIMENSIONS;

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  async embed(_texts: string[], _inputType: EmbeddingInputType): Promise<number[][]> {
    // TODO: call the Voyage embeddings endpoint for this.model with this.apiKey,
    // batch inputs, retry on 429, and assert every vector has this.dimensions entries.
    void this.apiKey;
    void this.model;
    throw new Error('Not implemented: VoyageEmbeddingProvider.embed (next step: Voyage embeddings HTTP call)');
  }
}

/** Formats a vector as a pgvector literal, e.g. "[0.1,0.2]". */
export function toPgVector(vector: number[]): string {
  return `[${vector.join(',')}]`;
}
