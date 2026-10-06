import type { Diagnosis } from '../contracts/diagnosis';
import type { FailureEvent } from '../contracts/failure-event';

/** Everything a notifier needs to render one report. */
export interface BugReport {
  event: FailureEvent;
  /** null when diagnosis failed; the report is still sent with the raw failure. */
  diagnosis: Diagnosis | null;
  diagnosisError: string | null;
  /** Suspected paths the model named that do not exist in the repo. */
  droppedPaths: string[];
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
}

export function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, Math.max(0, max - 1))}…`;
}

export function shortSha(sha: string): string {
  return /^[0-9a-f]{40}$/i.test(sha) ? sha.slice(0, 7) : sha;
}
