import type { Pool } from 'pg';
import { EventInput, type StoredEvent } from './schema';
import type { EventStore, WriteResult } from './store';

interface EventRow {
  id: string;
  user_id: string;
  type: string;
  occurred_at: Date;
  received_at: Date;
  idempotency_key: string;
  payload: Record<string, unknown>;
}

/**
 * System of record. The unique constraint on idempotency_key is what makes
 * retried client requests safe; ON CONFLICT DO NOTHING keeps it a single round trip
 * on the happy path.
 */
export class PgEventStore implements EventStore {
  constructor(private readonly pool: Pool) {}

  async write(input: EventInput): Promise<WriteResult> {
    const { type, userId, occurredAt, idempotencyKey, ...payload } = input;
    const inserted = await this.pool.query<EventRow>(
      `INSERT INTO events (user_id, type, occurred_at, idempotency_key, payload)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (idempotency_key) DO NOTHING
       RETURNING *`,
      [userId, type, occurredAt, idempotencyKey, payload],
    );
    const row = inserted.rows[0];
    if (row) return { event: toEvent(row), duplicate: false };

    const existing = await this.pool.query<EventRow>(
      'SELECT * FROM events WHERE idempotency_key = $1',
      [idempotencyKey],
    );
    const existingRow = existing.rows[0];
    if (!existingRow) {
      // Conflict reported but row not visible: only possible if it was deleted in between.
      throw new Error(`Event with idempotency key ${idempotencyKey} vanished after conflict`);
    }
    return { event: toEvent(existingRow), duplicate: true };
  }

  async listByUser(userId: string): Promise<StoredEvent[]> {
    const res = await this.pool.query<EventRow>(
      'SELECT * FROM events WHERE user_id = $1 ORDER BY occurred_at, received_at',
      [userId],
    );
    return res.rows.map(toEvent);
  }

  async listOnboardingUserIds(since: Date): Promise<string[]> {
    const res = await this.pool.query<{ user_id: string }>(
      `SELECT s.user_id FROM events s
       WHERE s.type = 'signed_up' AND s.occurred_at >= $1
         AND NOT EXISTS (
           SELECT 1 FROM events f WHERE f.user_id = s.user_id AND f.type = 'first_success_reached'
         )`,
      [since],
    );
    return res.rows.map((r) => r.user_id);
  }
}

function toEvent(row: EventRow): StoredEvent {
  // Re-validate on the way out: rows written by an older schema version should fail loudly.
  const input = EventInput.parse({
    ...row.payload,
    type: row.type,
    userId: row.user_id,
    occurredAt: row.occurred_at.toISOString(),
    idempotencyKey: row.idempotency_key,
  });
  return { ...input, id: row.id, receivedAt: row.received_at.toISOString() };
}
