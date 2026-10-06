import type { TestStatus } from '../contracts/run-result';

export interface HealthRow {
  runId: string;
  gitSha: string;
  startedAt: string;
  testId: string;
  title: string;
  status: TestStatus;
  retry: number;
}

export interface RunPassRate {
  runId: string;
  gitSha: string;
  startedAt: string;
  total: number;
  passed: number;
  passRate: number;
}

export interface FlakyTest {
  testId: string;
  title: string;
  gitSha: string;
  passes: number;
  failures: number;
}

const FAILED: ReadonlySet<TestStatus> = new Set(['failed', 'timedOut']);

/**
 * Pass rate per run, oldest first. A test's outcome in a run is its final
 * attempt (highest retry), matching what CI reports. Skipped tests are excluded.
 */
export function passRateTrend(rows: HealthRow[]): RunPassRate[] {
  const finalAttempt = new Map<string, HealthRow>();
  for (const row of rows) {
    const key = `${row.runId}\u0000${row.testId}`;
    const prev = finalAttempt.get(key);
    if (!prev || row.retry > prev.retry) finalAttempt.set(key, row);
  }

  const runs = new Map<string, RunPassRate>();
  for (const row of finalAttempt.values()) {
    if (row.status === 'skipped') continue;
    const run = runs.get(row.runId) ?? { runId: row.runId, gitSha: row.gitSha, startedAt: row.startedAt, total: 0, passed: 0, passRate: 0 };
    run.total += 1;
    if (row.status === 'passed') run.passed += 1;
    runs.set(row.runId, run);
  }

  return [...runs.values()]
    .map((r) => ({ ...r, passRate: r.total === 0 ? 0 : r.passed / r.total }))
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt) || a.runId.localeCompare(b.runId));
}

/**
 * A test is flaky if it both passed and failed on the same commit: the code did
 * not change, so the outcome did not depend on the code. Counts every attempt.
 */
export function detectFlaky(rows: HealthRow[]): FlakyTest[] {
  const groups = new Map<string, FlakyTest>();
  for (const row of rows) {
    const key = `${row.testId}\u0000${row.gitSha}`;
    const group = groups.get(key) ?? { testId: row.testId, title: row.title, gitSha: row.gitSha, passes: 0, failures: 0 };
    if (row.status === 'passed') group.passes += 1;
    else if (FAILED.has(row.status)) group.failures += 1;
    groups.set(key, group);
  }
  return [...groups.values()]
    .filter((g) => g.passes > 0 && g.failures > 0)
    .sort((a, b) => b.failures - a.failures || a.testId.localeCompare(b.testId));
}
