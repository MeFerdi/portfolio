import { randomUUID } from 'node:crypto';
import type { EventInput, StoredEvent } from '../src/events/schema';

export const T0 = Date.parse('2026-10-01T00:00:00Z');
export const hours = (h: number) => new Date(T0 + h * 3_600_000);

/** A stored event `atHour` hours after T0. */
export function ev(
  type: EventInput['type'],
  atHour: number,
  extra: { userId?: string; reason?: string; id?: string } = {},
): StoredEvent {
  const { userId = 'user-1', reason, id = randomUUID() } = extra;
  return {
    type,
    ...(reason ? { reason } : {}),
    userId,
    occurredAt: hours(atHour).toISOString(),
    idempotencyKey: `key-${id}`,
    id,
    receivedAt: hours(atHour).toISOString(),
  } as StoredEvent;
}
