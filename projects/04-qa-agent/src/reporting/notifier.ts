import type { Logger } from 'pino';
import type { BugReport } from './bug-report';

export interface Notifier {
  readonly name: string;
  send(report: BugReport): Promise<void>;
}

/** Sends to every channel; one channel failing does not block the others. Throws only if all fail. */
export class FanoutNotifier implements Notifier {
  readonly name = 'fanout';

  constructor(
    private readonly notifiers: Notifier[],
    private readonly log: Pick<Logger, 'error'>,
  ) {}

  async send(report: BugReport): Promise<void> {
    const results = await Promise.allSettled(this.notifiers.map((n) => n.send(report)));
    const failures = results.flatMap((r, i) => (r.status === 'rejected' ? [{ name: this.notifiers[i]?.name, reason: r.reason as unknown }] : []));
    for (const f of failures) this.log.error({ notifier: f.name, err: f.reason }, 'notifier failed');
    if (this.notifiers.length > 0 && failures.length === this.notifiers.length) {
      throw new Error(`All notifiers failed (${failures.map((f) => f.name).join(', ')})`);
    }
  }
}

/** Local-dev fallback when no webhook is configured: the report goes to the service log. */
export class LogNotifier implements Notifier {
  readonly name = 'log';

  constructor(private readonly log: Pick<Logger, 'warn'>) {}

  async send(report: BugReport): Promise<void> {
    this.log.warn(
      {
        test: report.event.title,
        error: report.event.error.message,
        diagnosis: report.diagnosis,
        occurrences: report.occurrences,
      },
      'bug report (no chat webhook configured)',
    );
  }
}
