import type { z } from 'zod';
import { EventInput, type StoredEvent } from './schema';
import type { EventStore } from './store';
import type { JobQueue } from '../queue/jobs';

export type IngestOutcome =
  | { status: 'accepted'; event: StoredEvent }
  | { status: 'duplicate'; event: StoredEvent }
  /** Same idempotency key reused for a different event: a client bug, never silently merged. */
  | { status: 'conflict'; existing: StoredEvent }
  | { status: 'invalid'; issues: z.core.$ZodIssue[] };

/**
 * The ingestion boundary. Order matters: validate -> durable write -> enqueue.
 * Once write() resolves the event is safe; enqueue only feeds downstream sinks,
 * and the stall detector reads the store directly, so an enqueue failure delays
 * analytics but cannot lose an event or a stall.
 */
export class Ingestor {
  constructor(
    private readonly store: EventStore,
    private readonly forwardQueue: JobQueue<StoredEvent>,
    private readonly log: { error: (obj: object, msg: string) => void },
  ) {}

  async ingest(raw: unknown): Promise<IngestOutcome> {
    const parsed = EventInput.safeParse(raw);
    if (!parsed.success) return { status: 'invalid', issues: parsed.error.issues };
    const input = parsed.data;

    const { event, duplicate } = await this.store.write(input);
    if (duplicate) {
      const sameEvent = event.userId === input.userId && event.type === input.type;
      return sameEvent ? { status: 'duplicate', event } : { status: 'conflict', existing: event };
    }

    try {
      await this.forwardQueue.add(event.id, event);
    } catch (err) {
      // TODO: transactional outbox so forwarding is guaranteed, not best-effort.
      this.log.error({ err, eventId: event.id }, 'event stored but not enqueued for forwarding');
    }
    return { status: 'accepted', event };
  }
}
