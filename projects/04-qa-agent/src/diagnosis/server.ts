import Fastify, { type FastifyInstance } from 'fastify';
import type { Logger } from 'pino';
import { FailureEvent } from '../contracts/failure-event';
import { RunResult } from '../contracts/run-result';
import { detectFlaky, passRateTrend } from '../health/metrics';
import type { HealthStore } from '../health/store';

export interface DiagnosisServerDeps {
  pipeline: { handle(event: FailureEvent): Promise<unknown> };
  health: HealthStore;
  log: Pick<Logger, 'error'>;
}

/**
 * POST /failures is fire-and-acknowledge: the event is validated synchronously
 * (400 on contract violation) and diagnosed in the background (202), so a slow
 * model call never stalls the test runner.
 */
export function buildDiagnosisServer(deps: DiagnosisServerDeps): FastifyInstance {
  const app = Fastify({ logger: false, bodyLimit: 1_000_000 });

  app.get('/health', async () => ({ ok: true }));

  app.post('/failures', async (request, reply) => {
    const parsed = FailureEvent.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_failure_event', issues: parsed.error.issues });
    }
    deps.pipeline.handle(parsed.data).catch((err: unknown) => {
      deps.log.error({ err, testId: parsed.data.testId }, 'failure pipeline crashed');
    });
    return reply.code(202).send({ accepted: true, testId: parsed.data.testId });
  });

  app.post('/runs', async (request, reply) => {
    const parsed = RunResult.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_run_result', issues: parsed.error.issues });
    }
    try {
      await deps.health.recordRun(parsed.data);
      return reply.code(201).send({ recorded: parsed.data.results.length });
    } catch (err) {
      deps.log.error({ err, runId: parsed.data.runId }, 'failed to record run');
      // 503 tells the reporter to spool the payload for a later retry.
      return reply.code(503).send({ error: 'health_store_unavailable' });
    }
  });

  /** Read model for the phase-2 dashboard: pass-rate trend and flaky tests over recent runs. */
  app.get('/health/summary', async (_request, reply) => {
    try {
      const rows = await deps.health.recentResults(50);
      return { trend: passRateTrend(rows), flaky: detectFlaky(rows) };
    } catch (err) {
      deps.log.error({ err }, 'failed to read health summary');
      return reply.code(503).send({ error: 'health_store_unavailable' });
    }
  });

  return app;
}
