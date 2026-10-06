import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import type { RunResult, TestResultRecord } from '../src/contracts/run-result';
import { buildFailureEvent } from './build-failure-event';
import { resolveGitSha } from './git';

interface DiagnosisReporterOptions {
  /** Base URL of the diagnosis service. */
  endpoint?: string;
  /** Where undeliverable payloads are written so nothing is lost when the service is down. */
  spoolDir?: string;
  timeoutMs?: number;
}

/**
 * Observes Playwright results; it never changes them. Pass/fail is decided by
 * the assertions in the specs; this reporter only forwards what happened.
 */
export default class DiagnosisReporter implements Reporter {
  private readonly endpoint: string;
  private readonly spoolDir: string;
  private readonly timeoutMs: number;
  private readonly runId = randomUUID();
  private readonly gitSha = resolveGitSha();
  private readonly results: TestResultRecord[] = [];
  private readonly pending: Promise<void>[] = [];
  private repoRoot = process.cwd();
  private startedAt = new Date();

  constructor(options: DiagnosisReporterOptions = {}) {
    this.endpoint = (options.endpoint ?? process.env.DIAGNOSIS_URL ?? 'http://localhost:4000').replace(/\/$/, '');
    this.spoolDir = options.spoolDir ?? 'test-results/undelivered';
    this.timeoutMs = options.timeoutMs ?? 10_000;
  }

  onBegin(config: FullConfig, _suite: Suite): void {
    // The config file sits at the repository root; spec paths are reported relative to it.
    this.repoRoot = config.configFile ? path.dirname(config.configFile) : process.cwd();
    this.startedAt = new Date();
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    this.results.push({
      testId: test.id,
      title: test.title,
      file: path.relative(this.repoRoot, test.location.file).split(path.sep).join('/'),
      status: result.status,
      retry: result.retry,
      durationMs: Math.max(0, Math.round(result.duration)),
    });

    if (result.status === test.expectedStatus || result.status === 'skipped') return;

    try {
      const event = buildFailureEvent(test, result, {
        runId: this.runId,
        gitSha: this.gitSha,
        repoRoot: this.repoRoot,
        now: new Date(),
      });
      this.pending.push(this.deliver('/failures', event, `failure-${test.id}-${result.retry}`));
    } catch (err) {
      // A contract violation here is a bug in the reporter, not in the app under test.
      console.error(`[diagnosis-reporter] could not build FailureEvent for "${test.title}":`, err);
    }
  }

  async onEnd(_result: FullResult): Promise<void> {
    await Promise.allSettled(this.pending);
    const run: RunResult = {
      schemaVersion: 1,
      runId: this.runId,
      gitSha: this.gitSha,
      startedAt: this.startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      results: this.results,
    };
    await this.deliver('/runs', run, `run-${this.runId}`);
  }

  printsToStdio(): boolean {
    return false;
  }

  private async deliver(route: string, payload: unknown, spoolName: string): Promise<void> {
    try {
      const res = await fetch(`${this.endpoint}${route}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    } catch (err) {
      const file = path.join(this.spoolDir, `${spoolName}.json`);
      await mkdir(this.spoolDir, { recursive: true });
      await writeFile(file, JSON.stringify(payload, null, 2));
      console.error(`[diagnosis-reporter] POST ${route} failed (${String(err)}); spooled to ${file}`);
    }
  }
}
