import type { Pool } from 'pg';
import type { RunResult } from '../contracts/run-result';
import type { HealthRow } from './metrics';

export interface HealthStore {
  recordRun(run: RunResult): Promise<void>;
  /** Most recent results across runs, newest runs first. */
  recentResults(limitRuns: number): Promise<HealthRow[]>;
}

/** Postgres-backed store. Writes are idempotent so the reporter can safely re-deliver a spooled run. */
export class PgHealthStore implements HealthStore {
  constructor(private readonly pool: Pool) {}

  async recordRun(run: RunResult): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO test_runs (run_id, git_sha, started_at, finished_at)
         VALUES ($1, $2, $3, $4) ON CONFLICT (run_id) DO NOTHING`,
        [run.runId, run.gitSha, run.startedAt, run.finishedAt],
      );
      for (const r of run.results) {
        await client.query(
          `INSERT INTO test_results (run_id, test_id, title, file, status, retry, duration_ms)
           VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (run_id, test_id, retry) DO NOTHING`,
          [run.runId, r.testId, r.title, r.file, r.status, r.retry, r.durationMs],
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async recentResults(limitRuns: number): Promise<HealthRow[]> {
    const { rows } = await this.pool.query<{
      run_id: string;
      git_sha: string;
      started_at: Date;
      test_id: string;
      title: string;
      status: HealthRow['status'];
      retry: number;
    }>(
      `WITH recent AS (
         SELECT run_id, git_sha, started_at FROM test_runs ORDER BY started_at DESC LIMIT $1
       )
       SELECT r.run_id, r.git_sha, r.started_at, t.test_id, t.title, t.status, t.retry
       FROM recent r JOIN test_results t USING (run_id)
       ORDER BY r.started_at DESC, t.test_id, t.retry`,
      [limitRuns],
    );
    return rows.map((row) => ({
      runId: row.run_id,
      gitSha: row.git_sha,
      startedAt: row.started_at.toISOString(),
      testId: row.test_id,
      title: row.title,
      status: row.status,
      retry: row.retry,
    }));
  }
}
