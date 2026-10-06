import { z } from 'zod';

// `.env` files often carry `KEY=` for unset values; treat empty as absent.
const optionalUrl = z.preprocess((v) => (v === '' ? undefined : v), z.string().url().optional());

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  DATABASE_URL: z.string().url().default('postgres://postgres@localhost:5432/qa_agent'),
  DIAGNOSIS_PORT: z.coerce.number().int().positive().default(4000),
  // Root of the repository under test; diagnosis reads source files from here.
  REPO_ROOT: z.string().default(process.cwd()),
  SLACK_WEBHOOK_URL: optionalUrl,
  DISCORD_WEBHOOK_URL: optionalUrl,
  DEDUP_WINDOW_MINUTES: z.coerce.number().positive().default(30),
  // Optional so tests and offline dev run without a key; the Anthropic client
  // also resolves ANTHROPIC_AUTH_TOKEN or an `ant auth login` profile.
  ANTHROPIC_API_KEY: z.string().optional(),
  LLM_MODEL: z.string().default('claude-opus-5-5'),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = EnvSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid environment:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}
