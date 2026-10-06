import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default('0.0.0.0'),
  // Optional so tests and offline dev run without a key; the Anthropic client
  // also resolves ANTHROPIC_AUTH_TOKEN or an `ant auth login` profile.
  ANTHROPIC_API_KEY: z.string().optional(),
  LLM_MODEL: z.string().default('claude-opus-5-5'),
  // Policy knobs. Defaults are deliberately conservative.
  PENDING_ACTION_TTL_SECONDS: z.coerce.number().int().positive().default(300),
  TOOL_RATE_LIMIT_CAPACITY: z.coerce.number().int().positive().default(10),
  TOOL_RATE_LIMIT_REFILL_PER_MINUTE: z.coerce.number().positive().default(6),
  AGENT_MAX_STEPS: z.coerce.number().int().positive().default(6),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = EnvSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid environment:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}
