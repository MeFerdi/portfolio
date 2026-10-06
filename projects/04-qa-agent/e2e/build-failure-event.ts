import path from 'node:path';
import { FAILURE_EVENT_SCHEMA_VERSION, FailureEvent } from '../src/contracts/failure-event';

/**
 * Structural subsets of Playwright's TestCase / TestResult, so this builder is
 * a pure function that Jest can exercise without a browser or the runner.
 */
export interface ReporterTest {
  id: string;
  title: string;
  titlePath(): string[];
  location: { file: string };
}

export interface ReporterResult {
  status: string;
  retry: number;
  errors: { message?: string; stack?: string }[];
  attachments: { name: string; contentType: string; path?: string; body?: Buffer }[];
}

export interface BuildContext {
  runId: string;
  gitSha: string;
  repoRoot: string;
  now: Date;
}

const MAX_CONSOLE_LINES = 200;
// eslint-disable-next-line no-control-regex
const ANSI = /\u001b\[[0-9;]*m/g;

export function stripAnsi(text: string): string {
  return text.replace(ANSI, '');
}

function failureStatus(status: string): FailureEvent['status'] {
  return status === 'timedOut' || status === 'interrupted' ? status : 'failed';
}

function consoleLogs(result: ReporterResult): string[] {
  const attachment = result.attachments.find((a) => a.name === 'console-logs' && a.body);
  if (!attachment?.body) return [];
  return attachment.body.toString('utf8').split('\n').slice(-MAX_CONSOLE_LINES);
}

function attachmentPath(result: ReporterResult, name: string, contentTypePrefix: string): string | null {
  const match = result.attachments.find(
    (a) => a.name === name && a.path && a.contentType.startsWith(contentTypePrefix),
  );
  return match?.path ?? null;
}

/** Builds and validates the event; throws if the reporter would emit something off-contract. */
export function buildFailureEvent(test: ReporterTest, result: ReporterResult, ctx: BuildContext): FailureEvent {
  const first = result.errors[0];
  const message = stripAnsi(first?.message ?? '').trim() || `Test ended with status "${result.status}"`;
  const stack = first?.stack ? stripAnsi(first.stack) : undefined;

  return FailureEvent.parse({
    schemaVersion: FAILURE_EVENT_SCHEMA_VERSION,
    runId: ctx.runId,
    testId: test.id,
    title: test.title,
    // titlePath() starts with the root/project/file entries, which are empty or noisy.
    titlePath: test.titlePath().filter((part) => part.length > 0),
    file: path.relative(ctx.repoRoot, test.location.file).split(path.sep).join('/'),
    retry: result.retry,
    status: failureStatus(result.status),
    error: { message, stack },
    consoleLogs: consoleLogs(result),
    screenshotPath: attachmentPath(result, 'screenshot', 'image/'),
    tracePath: attachmentPath(result, 'trace', 'application/zip'),
    gitSha: ctx.gitSha,
    timestamp: ctx.now.toISOString(),
  });
}
