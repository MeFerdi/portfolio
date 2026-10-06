import type { Chunk, ParsedDocument, ScoredChunk } from '../domain/types';
import { indexableText } from '../domain/types';
import { cosine } from '../ingest/embeddings';
import { Bm25Index } from './bm25';
import type { EmbeddedChunk, VectorStore } from './vector-store';

/** Brute-force store for tests and evals: exact cosine search plus BM25. */
export class InMemoryVectorStore implements VectorStore {
  private readonly chunks = new Map<string, EmbeddedChunk>();
  private readonly byDoc = new Map<string, string[]>();
  private readonly bm25 = new Bm25Index();

  async replaceDocument(doc: ParsedDocument, chunks: EmbeddedChunk[]): Promise<void> {
    for (const id of this.byDoc.get(doc.id) ?? []) {
      this.chunks.delete(id);
      this.bm25.remove(id);
    }
    for (const ec of chunks) {
      this.chunks.set(ec.chunk.id, ec);
      this.bm25.add(ec.chunk.id, indexableText(ec.chunk));
    }
    this.byDoc.set(doc.id, chunks.map((c) => c.chunk.id));
  }

  async vectorSearch(embedding: number[], k: number): Promise<ScoredChunk[]> {
    return [...this.chunks.values()]
      .map(({ chunk, embedding: e }) => ({ chunk, score: cosine(embedding, e) }))
      .sort((a, b) => b.score - a.score || a.chunk.id.localeCompare(b.chunk.id))
      .slice(0, k);
  }

  async keywordSearch(query: string, k: number): Promise<ScoredChunk[]> {
    return this.bm25.search(query, k).map(({ id, score }) => ({ chunk: this.get(id), score }));
  }

  async countChunks(): Promise<number> {
    return this.chunks.size;
  }

  async close(): Promise<void> {}

  private get(id: string): Chunk {
    const ec = this.chunks.get(id);
    if (!ec) throw new Error(`Index out of sync: unknown chunk ${id}`);
    return ec.chunk;
  }
}
