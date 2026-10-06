import type { Chunk, ParsedDocument, ScoredChunk } from '../domain/types';

export interface EmbeddedChunk {
  chunk: Chunk;
  embedding: number[];
}

/**
 * Storage for chunks with both a dense (vector) and a sparse (keyword) index.
 * Scores are only comparable within one method of one implementation.
 */
export interface VectorStore {
  /** Replaces every chunk of `doc` atomically, so re-ingesting a document is idempotent. */
  replaceDocument(doc: ParsedDocument, chunks: EmbeddedChunk[]): Promise<void>;
  /** Cosine similarity, highest first. */
  vectorSearch(embedding: number[], k: number): Promise<ScoredChunk[]>;
  /** Keyword relevance, highest first; only chunks sharing at least one term. */
  keywordSearch(query: string, k: number): Promise<ScoredChunk[]>;
  countChunks(): Promise<number>;
  close(): Promise<void>;
}
