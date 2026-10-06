import { Pool } from 'pg';
import { loadEnv } from './config/env';
import { buildRepoIndex } from './diagnosis/repo-index';
import { FailurePipeline } from './diagnosis/pipeline';
import { buildDiagnosisServer } from './diagnosis/server';
import { PgHealthStore } from './health/store';
import { logger } from './lib/logger';
import { AnthropicLlm } from './llm/client';
import { Deduplicator } from './reporting/dedup';
import { DiscordNotifier } from './reporting/discord';
import { FanoutNotifier, LogNotifier, type Notifier } from './reporting/notifier';
import { SlackNotifier } from './reporting/slack';

const REPO_INDEX_TTL_MS = 60_000;

async function main(): Promise<void> {
  const env = loadEnv();

  const channels: Notifier[] = [];
  if (env.SLACK_WEBHOOK_URL) channels.push(new SlackNotifier(env.SLACK_WEBHOOK_URL));
  if (env.DISCORD_WEBHOOK_URL) channels.push(new DiscordNotifier(env.DISCORD_WEBHOOK_URL));
  if (channels.length === 0) channels.push(new LogNotifier(logger));

  // The index changes only when code changes; refresh at most once a minute.
  let cachedIndex: { at: number; files: string[] } | null = null;
  const getRepoIndex = async (): Promise<string[]> => {
    if (!cachedIndex || Date.now() - cachedIndex.at > REPO_INDEX_TTL_MS) {
      cachedIndex = { at: Date.now(), files: await buildRepoIndex(env.REPO_ROOT) };
    }
    return cachedIndex.files;
  };

  const windowMs = env.DEDUP_WINDOW_MINUTES * 60_000;
  const pipeline = new FailurePipeline({
    llm: new AnthropicLlm(env.LLM_MODEL),
    notifier: new FanoutNotifier(channels, logger),
    dedup: new Deduplicator(windowMs),
    repoRoot: env.REPO_ROOT,
    getRepoIndex,
    log: logger,
  });

  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const app = buildDiagnosisServer({ pipeline, health: new PgHealthStore(pool), log: logger });

  const flushTimer = setInterval(() => {
    pipeline.flushRecurring().catch((err: unknown) => logger.error({ err }, 'recurring flush failed'));
  }, Math.min(windowMs, 60_000));

  const shutdown = async () => {
    clearInterval(flushTimer);
    await app.close();
    await pool.end();
  };
  process.once('SIGTERM', () => void shutdown());
  process.once('SIGINT', () => void shutdown());

  await app.listen({ port: env.DIAGNOSIS_PORT, host: '0.0.0.0' });
  logger.info({ port: env.DIAGNOSIS_PORT, channels: channels.map((c) => c.name), repoRoot: env.REPO_ROOT }, 'diagnosis service listening');
}

main().catch((err: unknown) => {
  logger.fatal({ err }, 'diagnosis service failed to start');
  process.exit(1);
});
