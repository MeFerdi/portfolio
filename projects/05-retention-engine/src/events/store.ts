import type { EventInput, StoredEvent } from './schema';

export interface WriteResult {
  event: StoredEvent;
  /** True when an event with the same idempotency key already existed; nothing was written. */
  duplicate: boolean;
}

/** System of record for onboarding events. Postgres in production, in-memory in tests. */
export interface EventStore {
  write(input: EventInput): Promise<WriteResult>;
  /** Full trail for one user, oldest first. */
  listByUser(userId: string): Promise<StoredEvent[]>;
  /** Users who signed up at or after `since` and have not reached first_success. */
  listOnboardingUserIds(since: Date): Promise<string[]>;
}
