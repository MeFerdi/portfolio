import { detectFlaky, type HealthRow, passRateTrend } from '../src/health/metrics';

function row(partial: Partial<HealthRow> & Pick<HealthRow, 'runId' | 'testId' | 'status'>): HealthRow {
  return { gitSha: 'sha-a', startedAt: '2026-10-07T09:00:00.000Z', title: partial.testId, retry: 0, ...partial };
}

describe('pass-rate trend', () => {
  it('computes pass rate per run in chronological order using the final attempt', () => {
    const rows = [
      row({ runId: 'r2', startedAt: '2026-10-07T10:00:00.000Z', testId: 'login', status: 'passed' }),
      row({ runId: 'r2', startedAt: '2026-10-07T10:00:00.000Z', testId: 'checkout', status: 'failed' }),
      row({ runId: 'r1', testId: 'login', status: 'passed' }),
      row({ runId: 'r1', testId: 'checkout', status: 'failed', retry: 0 }),
      row({ runId: 'r1', testId: 'checkout', status: 'passed', retry: 1 }),
      row({ runId: 'r1', testId: 'cart', status: 'skipped' }),
    ];
    expect(passRateTrend(rows).map((r) => [r.runId, r.passed, r.total, r.passRate])).toEqual([
      ['r1', 2, 2, 1],
      ['r2', 1, 2, 0.5],
    ]);
  });

  it('returns an empty trend for no data', () => {
    expect(passRateTrend([])).toEqual([]);
  });
});

describe('flaky detection', () => {
  it('flags a test that passed and failed on the same commit', () => {
    const rows = [
      row({ runId: 'r1', testId: 'checkout', status: 'failed', retry: 0 }),
      row({ runId: 'r1', testId: 'checkout', status: 'passed', retry: 1 }),
      row({ runId: 'r1', testId: 'login', status: 'passed' }),
    ];
    expect(detectFlaky(rows)).toEqual([{ testId: 'checkout', title: 'checkout', gitSha: 'sha-a', passes: 1, failures: 1 }]);
  });

  it('does not flag a test that failed on one commit and passed on another (that is a fix or a regression)', () => {
    const rows = [
      row({ runId: 'r1', gitSha: 'sha-a', testId: 'checkout', status: 'failed' }),
      row({ runId: 'r2', gitSha: 'sha-b', testId: 'checkout', status: 'passed' }),
    ];
    expect(detectFlaky(rows)).toEqual([]);
  });

  it('counts timeouts as failures and ignores skips', () => {
    const rows = [
      row({ runId: 'r1', testId: 'cart', status: 'timedOut' }),
      row({ runId: 'r2', testId: 'cart', status: 'passed' }),
      row({ runId: 'r3', testId: 'login', status: 'skipped' }),
      row({ runId: 'r4', testId: 'login', status: 'passed' }),
    ];
    expect(detectFlaky(rows)).toEqual([{ testId: 'cart', title: 'cart', gitSha: 'sha-a', passes: 1, failures: 1 }]);
  });
});
