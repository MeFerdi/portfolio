import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url().default('postgres://postgres@localhost:5432/rag'),
  /** `memory` ingests corpus/ at boot; `pg` uses Postgres + pgvector. */
  VECTOR_STORE: z.enum(['memory', 'pg']).default('memory'),
  // Optional so tests and offline dev run without a key; the Anthropic client
  // also resolves ANTHROPIC_AUTH_TOKEN or an `ant auth login` profile.
  ANTHROPIC_API_KEY: z.string().optional(),
  LLM_MODEL: z.string().default('claude-opus-5-5'),
  /** Without a key the deterministic hashing embedder is used (dev/CI only). */
  VOYAGE_API_KEY: z.string().optional(),
  VOYAGE_MODEL: z.string().default('voyage-3.5'),
  RERANKER: z.enum(['identity', 'llm']).default('identity'),
  /** Override the not-in-corpus gate; defaults are per embedder. */
  MIN_RELEVANCE_SCORE: z.coerce.number().min(-1).max(1).optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = EnvSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid environment:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}
