import type { Env } from './config/env';
import { AskService } from './answer/ask-service';
import { type EmbeddingProvider, HashingEmbedder, VoyageEmbedder } from './ingest/embeddings';
import { IngestService } from './ingest/pipeline';
import { logger } from './lib/logger';
import { AnthropicLlm, type LlmClient } from './llm/client';
import { IdentityReranker, LlmReranker, type Reranker } from './retrieval/reranker';
import { HybridRetriever } from './retrieval/retriever';
import { InMemoryVectorStore } from './store/memory-store';
import { PgVectorStore } from './store/pg-store';
import type { VectorStore } from './store/vector-store';

export interface Container {
  ask: AskService;
  ingest: IngestService;
  store: VectorStore;
  embedder: EmbeddingProvider;
}

export interface ContainerOverrides {
  llm?: LlmClient;
  embedder?: EmbeddingProvider;
  store?: VectorStore;
  reranker?: 'identity' | 'llm';
}

export function createEmbedder(env: Env): EmbeddingProvider {
  if (env.VOYAGE_API_KEY) return new VoyageEmbedder({ apiKey: env.VOYAGE_API_KEY, model: env.VOYAGE_MODEL });
  logger.warn('VOYAGE_API_KEY not set: using the lexical hashing embedder (dev/CI only)');
  return new HashingEmbedder();
}

export function buildContainer(env: Env, overrides: ContainerOverrides = {}): Container {
  const llm = overrides.llm ?? new AnthropicLlm(env.LLM_MODEL);
  const embedder = overrides.embedder ?? createEmbedder(env);
  const store =
    overrides.store ?? (env.VECTOR_STORE === 'pg' ? PgVectorStore.fromUrl(env.DATABASE_URL) : new InMemoryVectorStore());
  const rerankerKind = overrides.reranker ?? env.RERANKER;
  const reranker: Reranker = rerankerKind === 'llm' ? new LlmReranker(llm) : new IdentityReranker();
  const retriever = new HybridRetriever(embedder, store, reranker);
  return {
    ask: new AskService(retriever, llm, { minRelevance: env.MIN_RELEVANCE_SCORE ?? embedder.defaultMinRelevance }),
    ingest: new IngestService(embedder, store),
    store,
    embedder,
  };
}
