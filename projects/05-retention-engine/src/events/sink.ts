import type { StoredEvent } from './schema';

/**
 * Downstream destination for events that are already durably stored
 * (product analytics, warehouse, CDP). Fed from the `events` queue, so a slow or
 * failing sink never blocks ingestion and gets BullMQ retries for free.
 */
export interface EventSink {
  readonly name: string;
  /** Must be safe to call more than once for the same event (at-least-once delivery). */
  send(event: StoredEvent): Promise<void>;
}

/** Dev default: structured log line per event. */
export class LogSink implements EventSink {
  readonly name = 'log';
  constructor(private readonly log: (obj: object, msg: string) => void) {}
  async send(event: StoredEvent): Promise<void> {
    this.log({ eventId: event.id, type: event.type, userId: event.userId }, 'event forwarded');
  }
}
