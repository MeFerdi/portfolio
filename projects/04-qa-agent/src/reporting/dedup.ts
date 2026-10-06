import { createHash } from 'node:crypto';
import type { FailureEvent } from '../contracts/failure-event';
import type { BugReport } from './bug-report';

/**
 * Stable signature for "the same error": first line of the message with
 * volatile parts (numbers, quoted values, hex ids, durations) normalised away.
 */
export function errorSignature(message: string): string {
  const firstLine = (message.split('\n').find((l) => l.trim().length > 0) ?? '').trim();
  const normalized = firstLine
    .replace(/"[^"]*"|'[^']*'/g, '<str>')
    .replace(/\b[0-9a-f]{8,}\b/gi, '<hex>')
    .replace(/\d+(\.\d+)?/g, '<n>')
    .replace(/\s+/g, ' ')
    .toLowerCase();
  return createHash('sha1').update(normalized).digest('hex').slice(0, 12);
}

export function dedupKey(event: FailureEvent): string {
  return `${event.testId}:${errorSignature(event.error.message)}`;
}

export type DedupDecision = { action: 'report'; occurrences: 1 } | { action: 'suppress'; occurrences: number };

interface OpenWindow {
  openedAt: number;
  firstSeen: string;
  lastSeen: string;
  count: number;
  report?: BugReport;
}

/**
 * First occurrence of a key reports immediately; repeats inside the window are
 * counted and suppressed. When a window closes with repeats, flushExpired()
 * returns one follow-up report carrying the occurrence count.
 *
 * State is in-process: a restart forgets open windows (at worst, one extra report).
 */
export class Deduplicator {
  private readonly windows = new Map<string, OpenWindow>();

  constructor(private readonly windowMs: number) {}

  observe(key: string, now: Date): DedupDecision {
    const open = this.windows.get(key);
    if (open && now.getTime() - open.openedAt < this.windowMs) {
      open.count += 1;
      open.lastSeen = now.toISOString();
      return { action: 'suppress', occurrences: open.count };
    }
    this.windows.set(key, { openedAt: now.getTime(), firstSeen: now.toISOString(), lastSeen: now.toISOString(), count: 1 });
    return { action: 'report', occurrences: 1 };
  }

  /** Remember the report sent for this window so a follow-up can reuse its diagnosis. */
  attachReport(key: string, report: BugReport): void {
    const open = this.windows.get(key);
    if (open) open.report = report;
  }

  /** Used when delivery failed, so the next occurrence is reported instead of suppressed. */
  forget(key: string): void {
    this.windows.delete(key);
  }

  flushExpired(now: Date): BugReport[] {
    const followUps: BugReport[] = [];
    for (const [key, open] of this.windows) {
      if (now.getTime() - open.openedAt < this.windowMs) continue;
      this.windows.delete(key);
      if (open.count > 1 && open.report) {
        followUps.push({ ...open.report, occurrences: open.count, firstSeen: open.firstSeen, lastSeen: open.lastSeen });
      }
    }
    return followUps;
  }
}
