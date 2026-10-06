import path from 'node:path';
import { AskService } from '../src/answer/ask-service';
import type { Chunk } from '../src/domain/types';
import { HashingEmbedder } from '../src/ingest/embeddings';
import { loadCorpusDir } from '../src/ingest/load-corpus';
import { IngestService } from '../src/ingest/pipeline';
import type { LlmClient } from '../src/llm/client';
import { IdentityReranker, type Reranker } from '../src/retrieval/reranker';
import { HybridRetriever } from '../src/retrieval/retriever';
import { InMemoryVectorStore } from '../src/store/memory-store';

export const CORPUS_DIR = path.resolve(__dirname, '../corpus');

export async function corpusAskService(llm: LlmClient, reranker: Reranker = new IdentityReranker()) {
  const embedder = new HashingEmbedder();
  const store = new InMemoryVectorStore();
  await new IngestService(embedder, store).ingest(await loadCorpusDir(CORPUS_DIR));
  const ask = new AskService(new HybridRetriever(embedder, store, reranker), llm, {
    minRelevance: embedder.defaultMinRelevance,
  });
  return { ask, store };
}

export function chunk(id: string, docId: string, text: string): Chunk {
  return { id, docId, docTitle: docId, headingPath: [], ordinal: 0, text };
}

/** Pulls `chunk_id`s out of a grounded-answer prompt, in order. */
export function chunkIdsInPrompt(prompt: string): string[] {
  return [...prompt.matchAll(/chunk_id="([^"]+)"/g)].map((m) => m[1]!);
}

/** Chunk blocks as the model sees them (text still entity-escaped). */
export function documentsInPrompt(prompt: string): { chunkId: string; docId: string; text: string }[] {
  return [...prompt.matchAll(/<document chunk_id="([^"]+)" doc_id="([^"]+)"[^>]*>\n([\s\S]*?)\n<\/document>/g)].map((m) => ({
    chunkId: m[1]!,
    docId: m[2]!,
    text: m[3]!,
  }));
}
