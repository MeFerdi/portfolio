import type { Logger } from 'pino';
import type { FailureEvent } from '../contracts/failure-event';
import type { LlmClient } from '../llm/client';
import type { BugReport } from '../reporting/bug-report';
import { type Deduplicator, dedupKey } from '../reporting/dedup';
import type { Notifier } from '../reporting/notifier';
import { type ContextLimits, type FileReader, gatherContext } from './context';
import { diagnoseFailure } from './diagnose';

export interface PipelineDeps {
  llm: LlmClient;
  notifier: Notifier;
  dedup: Deduplicator;
  repoRoot: string;
  getRepoIndex: () => Promise<string[]>;
  log: Pick<Logger, 'info' | 'warn' | 'error'>;
  limits?: ContextLimits;
  reader?: FileReader;
  now?: () => Date;
}

export type PipelineOutcome =
  | { status: 'reported'; report: BugReport }
  | { status: 'suppressed'; occurrences: number }
  | { status: 'notify-failed'; report: BugReport; error: string };

/**
 * validated event -> dedup -> context -> diagnosis -> notify.
 * Diagnosis failure degrades to a report without AI output; it never drops the failure.
 */
export class FailurePipeline {
  constructor(private readonly deps: PipelineDeps) {}

  async handle(event: FailureEvent): Promise<PipelineOutcome> {
    const { log } = this.deps;
    const now = (this.deps.now ?? (() => new Date()))();
    const key = dedupKey(event);

    // Dedup before the LLM call: repeats cost nothing.
    const decision = this.deps.dedup.observe(key, now);
    if (decision.action === 'suppress') {
      log.info({ key, occurrences: decision.occurrences }, 'duplicate failure suppressed');
      return { status: 'suppressed', occurrences: decision.occurrences };
    }

    const report: BugReport = {
      event,
      diagnosis: null,
      diagnosisError: null,
      droppedPaths: [],
      occurrences: 1,
      firstSeen: now.toISOString(),
      lastSeen: now.toISOString(),
    };

    try {
      const context = await gatherContext(event, {
        repoRoot: this.deps.repoRoot,
        repoIndex: await this.deps.getRepoIndex(),
        limits: this.deps.limits,
        reader: this.deps.reader,
      });
      if (context.notes.length > 0) log.warn({ testId: event.testId, notes: context.notes }, 'context gathered with gaps');
      const result = await diagnoseFailure(event, context, this.deps.llm);
      report.diagnosis = result.diagnosis;
      report.droppedPaths = result.droppedPaths;
      if (result.droppedPaths.length > 0) {
        log.warn({ testId: event.testId, dropped: result.droppedPaths }, 'dropped hallucinated suspected files');
      }
    } catch (err) {
      report.diagnosisError = err instanceof Error ? err.message : String(err);
      log.error({ testId: event.testId, err }, 'diagnosis failed; reporting raw failure');
    }

    this.deps.dedup.attachReport(key, report);
    try {
      await this.deps.notifier.send(report);
      return { status: 'reported', report };
    } catch (err) {
      this.deps.dedup.forget(key);
      const error = err instanceof Error ? err.message : String(err);
      log.error({ testId: event.testId, err }, 'report delivery failed');
      return { status: 'notify-failed', report, error };
    }
  }

  /** Called on a timer: sends one occurrence-count follow-up per closed window with repeats. */
  async flushRecurring(): Promise<number> {
    const followUps = this.deps.dedup.flushExpired((this.deps.now ?? (() => new Date()))());
    for (const report of followUps) {
      try {
        await this.deps.notifier.send(report);
      } catch (err) {
        this.deps.log.error({ testId: report.event.testId, err }, 'recurring-failure follow-up failed');
      }
    }
    return followUps.length;
  }
}
