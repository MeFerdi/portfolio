import { loadEnv } from './config/env';
import { logger } from './lib/logger';
import { closeQueues, createQueues } from './pipeline/queues';
import { startWorkers } from './pipeline/workers';
import { createRuntime } from './runtime';

/** Worker process: consumes all four stage queues until SIGINT/SIGTERM. */
async function main(): Promise<void> {
  const env = loadEnv();
  const runtime = await createRuntime(env);
  const queues = createQueues(runtime.redis);
  const workers = startWorkers(runtime.deps, queues, runtime.redis, env.WORKER_CONCURRENCY);
  logger.info({ concurrency: env.WORKER_CONCURRENCY, icp: runtime.deps.icp.version }, 'pipeline workers started');

  let stopping = false;
  const shutdown = async (signal: string) => {
    if (stopping) return;
    stopping = true;
    logger.info({ signal }, 'shutting down: finishing in-flight jobs');
    // Worker.close() waits for active jobs, so nothing is left half-processed.
    await Promise.all(workers.map((w) => w.close()));
    await closeQueues(queues);
    await runtime.close();
    process.exit(0);
  };
  process.on('SIGINT', (s) => void shutdown(s));
  process.on('SIGTERM', (s) => void shutdown(s));
}

main().catch((err: unknown) => {
  logger.fatal({ err }, 'worker process failed to start');
  process.exit(1);
});
