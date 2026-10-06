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
  PORT: z.coerce.number().int().positive().default(3000),
  // Without a Resend key the workers print emails to stdout (ConsoleMailer).
  RESEND_API_KEY: z.string().optional(),
  MAIL_FROM: z.string().default('Onboarding <onboarding@example.com>'),
  EXPERIMENT_SALT: z.string().default('onboarding-recovery-2026q4'),
  EXPERIMENT_INTERVENTION_SHARE: z.coerce.number().min(0).max(1).default(0.5),
  STALL_SCAN_EVERY_MS: z.coerce.number().int().positive().default(15 * 60_000),
  STALL_LOOKBACK_DAYS: z.coerce.number().int().positive().default(30),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = EnvSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid environment:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}
