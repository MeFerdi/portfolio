import { buildFailureEvent, type ReporterResult, type ReporterTest } from '../e2e/build-failure-event';
import { FailureEvent } from '../src/contracts/failure-event';
import { buildDiagnosisServer } from '../src/diagnosis/server';
import { MALFORMED_FIXTURES, VALID_FIXTURES } from './fixtures/failure-events';

const silentLog = { error: () => undefined };

function playwrightLikeFailure(): { test: ReporterTest; result: ReporterResult } {
  return {
    test: {
      id: 'checkout-abc123',
      title: 'order total equals the sum of line totals',
      titlePath: () => ['', 'chromium', 'checkout.spec.ts', 'checkout', 'order total equals the sum of line totals'],
      location: { file: '/repo/e2e/checkout.spec.ts' },
    },
    result: {
      status: 'failed',
      retry: 1,
      errors: [
        {
          // Playwright messages carry ANSI colour codes; the builder must strip them.
          message: '\u001b[31mError: expect(locator).toHaveText(expected) failed\u001b[39m\nExpected: "$49.97"',
          stack: 'Error: ...\n    at /repo/e2e/checkout.spec.ts:14:51',
        },
      ],
      attachments: [
        { name: 'screenshot', contentType: 'image/png', path: '/repo/test-results/x/test-failed-1.png' },
        { name: 'trace', contentType: 'application/zip', path: '/repo/test-results/x/trace.zip' },
        { name: 'console-logs', contentType: 'text/plain', body: Buffer.from('[info] a\n[error] b') },
      ],
    },
  };
}

describe('FailureEvent contract: producer side (reporter builder)', () => {
  const ctx = { runId: 'run-1', gitSha: 'abc1234', repoRoot: '/repo', now: new Date('2026-10-07T10:00:00Z') };

  it('builds an event that validates against the shared schema', () => {
    const { test, result } = playwrightLikeFailure();
    const event = buildFailureEvent(test, result, ctx);

    expect(FailureEvent.safeParse(event).success).toBe(true);
    expect(event).toMatchObject({
      file: 'e2e/checkout.spec.ts',
      retry: 1,
      status: 'failed',
      screenshotPath: '/repo/test-results/x/test-failed-1.png',
      tracePath: '/repo/test-results/x/trace.zip',
      consoleLogs: ['[info] a', '[error] b'],
      titlePath: ['chromium', 'checkout.spec.ts', 'checkout', 'order total equals the sum of line totals'],
    });
    expect(event.error.message).not.toContain('\u001b[');
  });

  it('falls back to a status message when Playwright reports no error (e.g. timeout)', () => {
    const { test, result } = playwrightLikeFailure();
    const event = buildFailureEvent(test, { ...result, status: 'timedOut', errors: [], attachments: [] }, ctx);
    expect(event.status).toBe('timedOut');
    expect(event.error.message).toBe('Test ended with status "timedOut"');
    expect(event.screenshotPath).toBeNull();
  });

  it('refuses to emit an off-contract event', () => {
    const { test, result } = playwrightLikeFailure();
    expect(() => buildFailureEvent(test, result, { ...ctx, gitSha: '' })).toThrow();
  });
});

describe('FailureEvent contract: consumer side (diagnosis service)', () => {
  function setup() {
    const handled: FailureEvent[] = [];
    const app = buildDiagnosisServer({
      pipeline: { handle: async (e) => void handled.push(e) },
      health: { recordRun: async () => undefined, recentResults: async () => [] },
      log: silentLog,
    });
    return { app, handled };
  }

  it.each(VALID_FIXTURES.map((f) => [f.testId, f] as const))('accepts valid fixture %s with 202', async (_id, fixture) => {
    const { app, handled } = setup();
    const res = await app.inject({ method: 'POST', url: '/failures', payload: fixture });
    expect(res.statusCode).toBe(202);
    expect(handled).toEqual([fixture]);
  });

  it.each(Object.entries(MALFORMED_FIXTURES))('rejects malformed event (%s) with 400 and never diagnoses it', async (_name, payload) => {
    const { app, handled } = setup();
    const res = await app.inject({
      method: 'POST',
      url: '/failures',
      headers: { 'content-type': 'application/json' },
      payload: JSON.stringify(payload),
    });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toMatchObject({ error: 'invalid_failure_event' });
    expect(handled).toHaveLength(0);
  });

  it('accepts what the reporter builds (round trip)', async () => {
    const { app } = setup();
    const { test, result } = playwrightLikeFailure();
    const event = buildFailureEvent(test, result, { runId: 'r', gitSha: 'abc', repoRoot: '/repo', now: new Date() });
    const res = await app.inject({ method: 'POST', url: '/failures', payload: event });
    expect(res.statusCode).toBe(202);
  });
});

describe('run results endpoint', () => {
  const run = {
    schemaVersion: 1,
    runId: 'run-1',
    gitSha: 'abc',
    startedAt: '2026-10-07T10:00:00.000Z',
    finishedAt: '2026-10-07T10:01:00.000Z',
    results: [{ testId: 't1', title: 'x', file: 'e2e/a.spec.ts', status: 'passed', retry: 0, durationMs: 120 }],
  };

  it('records a valid run', async () => {
    const recorded: unknown[] = [];
    const app = buildDiagnosisServer({
      pipeline: { handle: async () => undefined },
      health: { recordRun: async (r) => void recorded.push(r), recentResults: async () => [] },
      log: silentLog,
    });
    const res = await app.inject({ method: 'POST', url: '/runs', payload: run });
    expect(res.statusCode).toBe(201);
    expect(recorded).toHaveLength(1);
  });

  it('returns 503 when the store is down so the reporter spools the run', async () => {
    const app = buildDiagnosisServer({
      pipeline: { handle: async () => undefined },
      health: { recordRun: async () => Promise.reject(new Error('ECONNREFUSED')), recentResults: async () => [] },
      log: silentLog,
    });
    const res = await app.inject({ method: 'POST', url: '/runs', payload: run });
    expect(res.statusCode).toBe(503);
  });
});

describe('health summary endpoint', () => {
  it('returns trend and flaky tests computed from stored rows', async () => {
    const base = { gitSha: 'sha', startedAt: '2026-10-07T10:00:00.000Z', title: 'checkout', testId: 'checkout', runId: 'r1' };
    const app = buildDiagnosisServer({
      pipeline: { handle: async () => undefined },
      health: {
        recordRun: async () => undefined,
        recentResults: async () => [
          { ...base, status: 'failed', retry: 0 },
          { ...base, status: 'passed', retry: 1 },
        ],
      },
      log: silentLog,
    });
    const res = await app.inject({ method: 'GET', url: '/health/summary' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ trend: [{ runId: 'r1', passRate: 1 }], flaky: [{ testId: 'checkout' }] });
  });
});
