import { Redis } from 'ioredis';
import { Pool } from 'pg';
import type { Env } from './config/env';
import { PgPipelineRepository } from './db/pg-repository';
import { loadIcp } from './domain/icp';
import { VoyageEmbeddingProvider } from './embeddings/provider';
import { logger } from './lib/logger';
import { AnthropicLlm } from './llm/client';
import type { PipelineDeps } from './pipeline/handlers';
import { PlaywrightProfileSource } from './scraper/playwright-source';

/** Wires real infrastructure from env. Tests build PipelineDeps from fakes instead. */
export async function createRuntime(env: Env) {
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  // BullMQ workers need maxRetriesPerRequest: null so blocking commands are not aborted.
  const redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
  const profiles = new PlaywrightProfileSource({
    userAgent: env.SCRAPER_USER_AGENT,
    timeoutMs: env.SCRAPER_TIMEOUT_MS,
    executablePath: env.CHROMIUM_EXECUTABLE_PATH,
  });

  if (!env.VOYAGE_API_KEY) {
    logger.warn('VOYAGE_API_KEY not set: drafts will be generated without example messages');
  }

  const deps: PipelineDeps = {
    repo: new PgPipelineRepository(pool),
    llm: new AnthropicLlm(env.LLM_MODEL),
    icp: await loadIcp(env.ICP_PATH),
    profiles,
    embeddings: env.VOYAGE_API_KEY ? new VoyageEmbeddingProvider(env.VOYAGE_API_KEY, env.EMBEDDING_MODEL) : null,
    draftExamplesK: env.DRAFT_EXAMPLES_K,
    logger,
  };

  async function close(): Promise<void> {
    await profiles.close();
    await pool.end();
    redis.disconnect();
  }

  return { deps, redis, close };
}
