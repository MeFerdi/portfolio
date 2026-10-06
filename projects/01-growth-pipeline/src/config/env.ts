import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  DATABASE_URL: z.string().url().default('postgres://postgres@localhost:5432/app'),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  // Optional so tests and offline dev run without a key; the Anthropic client
  // also resolves ANTHROPIC_AUTH_TOKEN or an `ant auth login` profile.
  ANTHROPIC_API_KEY: z.string().optional(),
  LLM_MODEL: z.string().default('claude-opus-5-5'),
  // Embeddings for the "successful messages" example store (Voyage AI).
  VOYAGE_API_KEY: z.string().optional(),
  EMBEDDING_MODEL: z.string().default('voyage-3.5'),
  // Ideal customer profile the scorer evaluates against.
  ICP_PATH: z.string().default('config/icp.example.json'),
  WORKER_CONCURRENCY: z.coerce.number().int().min(1).max(64).default(4),
  // How many similar historical messages the drafter receives as examples.
  DRAFT_EXAMPLES_K: z.coerce.number().int().min(0).max(10).default(3),
  SCRAPER_USER_AGENT: z.string().default('GrowthPipelineBot/0.1 (+https://example.com/bot)'),
  SCRAPER_TIMEOUT_MS: z.coerce.number().int().min(1000).default(15000),
  // Set in the Alpine image, which uses the distro's Chromium instead of Playwright's download.
  CHROMIUM_EXECUTABLE_PATH: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = EnvSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid environment:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}
