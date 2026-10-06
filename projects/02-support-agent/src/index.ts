import { buildApp } from './app';
import { loadEnv } from './config/env';
import { logger } from './lib/logger';
import { AnthropicAgentModel } from './llm/anthropic-agent-model';

async function main(): Promise<void> {
  const env = loadEnv();
  const app = buildApp({
    model: new AnthropicAgentModel(env.LLM_MODEL),
    policy: {
      pendingActionTtlMs: env.PENDING_ACTION_TTL_SECONDS * 1000,
      rateLimit: { capacity: env.TOOL_RATE_LIMIT_CAPACITY, refillPerMinute: env.TOOL_RATE_LIMIT_REFILL_PER_MINUTE },
      maxSteps: env.AGENT_MAX_STEPS,
    },
  });
  await app.listen({ port: env.PORT, host: env.HOST });
}

main().catch((err: unknown) => {
  logger.fatal({ err }, 'failed to start');
  process.exit(1);
});
