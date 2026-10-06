import { z } from 'zod';

/** One run of the E2E suite, posted by the reporter at the end of every run (pass or fail). */
export const TestStatus = z.enum(['passed', 'failed', 'timedOut', 'skipped', 'interrupted']);
export type TestStatus = z.infer<typeof TestStatus>;

export const TestResultRecord = z.object({
  testId: z.string().min(1),
  title: z.string().min(1),
  file: z.string().min(1),
  status: TestStatus,
  retry: z.number().int().min(0),
  durationMs: z.number().int().min(0),
});
export type TestResultRecord = z.infer<typeof TestResultRecord>;

export const RunResult = z.object({
  schemaVersion: z.literal(1),
  runId: z.string().min(1),
  gitSha: z.string().min(1),
  startedAt: z.iso.datetime(),
  finishedAt: z.iso.datetime(),
  results: z.array(TestResultRecord),
});
export type RunResult = z.infer<typeof RunResult>;
