import { z } from 'zod';

/**
 * The single contract between the test runner (Playwright reporter) and the
 * diagnosis service. Both sides parse with this schema; contract tests run the
 * same fixtures through each side so neither can drift silently.
 */
export const FAILURE_EVENT_SCHEMA_VERSION = 1;

export const FailureEvent = z.object({
  schemaVersion: z.literal(FAILURE_EVENT_SCHEMA_VERSION),
  runId: z.string().min(1),
  testId: z.string().min(1),
  title: z.string().min(1),
  /** Describe-block path down to the test title, for display. */
  titlePath: z.array(z.string()),
  /** Spec file, relative to the repository root. */
  file: z.string().min(1),
  /** Playwright attempt number; 0 is the first run. */
  retry: z.number().int().min(0),
  status: z.enum(['failed', 'timedOut', 'interrupted']),
  error: z.object({
    message: z.string().min(1),
    stack: z.string().optional(),
  }),
  /** Browser console output captured during the test, oldest first. */
  consoleLogs: z.array(z.string()).max(500),
  screenshotPath: z.string().nullable(),
  tracePath: z.string().nullable(),
  gitSha: z.string().min(1),
  timestamp: z.iso.datetime(),
});

export type FailureEvent = z.infer<typeof FailureEvent>;
