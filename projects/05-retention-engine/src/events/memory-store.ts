import { randomUUID } from 'node:crypto';
import type { EventInput, StoredEvent } from './schema';
import type { EventStore, WriteResult } from './store';

/**
 * In-process store with the same idempotency semantics as the Postgres store
 * (unique idempotency key). Used by tests and the offline simulator.
 */
export class InMemoryEventStore implements EventStore {
  private readonly byKey = new Map<string, StoredEvent>();
  private readonly ordered: StoredEvent[] = [];

  constructor(private readonly now: () => Date = () => new Date()) {}

  async write(input: EventInput): Promise<WriteResult> {
    const existing = this.byKey.get(input.idempotencyKey);
    if (existing) return { event: existing, duplicate: true };
    const event: StoredEvent = { ...input, id: randomUUID(), receivedAt: this.now().toISOString() };
    this.byKey.set(input.idempotencyKey, event);
    this.ordered.push(event);
    return { event, duplicate: false };
  }

  async listByUser(userId: string): Promise<StoredEvent[]> {
    return this.ordered
      .filter((e) => e.userId === userId)
      .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  }

  async listOnboardingUserIds(since: Date): Promise<string[]> {
    const signedUp = new Set<string>();
    const finished = new Set<string>();
    for (const e of this.ordered) {
      if (e.type === 'signed_up' && new Date(e.occurredAt) >= since) signedUp.add(e.userId);
      if (e.type === 'first_success_reached') finished.add(e.userId);
    }
    return [...signedUp].filter((id) => !finished.has(id));
  }

  /** Test/simulator helper. */
  all(): readonly StoredEvent[] {
    return this.ordered;
  }
}
