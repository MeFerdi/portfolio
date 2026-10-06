import { buildApp } from '../src/app/server';
import { Ingestor } from '../src/events/ingest';
import { InMemoryEventStore } from '../src/events/memory-store';
import type { StoredEvent } from '../src/events/schema';
import { InlineQueue } from '../src/queue/inline-queue';
import type { JobQueue } from '../src/queue/jobs';
import { InMemoryUserDirectory } from '../src/users/directory';

function setup(forward: JobQueue<StoredEvent> = new InlineQueue<StoredEvent>('events')) {
  const store = new InMemoryEventStore();
  const errors: object[] = [];
  const ingestor = new Ingestor(store, forward, { error: (o) => errors.push(o) });
  const app = buildApp({ ingestor, users: new InMemoryUserDirectory() });
  return { app, store, errors };
}

const event = (i: number, key = `idem-${String(i).padStart(4, '0')}`) => ({
  type: 'signed_up',
  userId: `user-${i}`,
  occurredAt: '2026-10-01T10:00:00.000Z',
  idempotencyKey: key,
});

describe('ingestion boundary: zero event loss', () => {
  it('stores exactly one event per accepted request, deduping repeated idempotency keys', async () => {
    const { app, store } = setup();
    const requests = [
      ...Array.from({ length: 50 }, (_, i) => event(i)),
      // client retries of 10 of them
      ...Array.from({ length: 10 }, (_, i) => event(i * 5)),
    ];
    const responses = await Promise.all(requests.map((payload) => app.inject({ method: 'POST', url: '/events', payload })));

    const accepted = responses.filter((r) => r.statusCode === 202);
    const duplicates = responses.filter((r) => r.statusCode === 200);
    expect(accepted).toHaveLength(50);
    expect(duplicates).toHaveLength(10);
    expect(store.all()).toHaveLength(50);

    // Every acknowledged id is in the store, and a retry returns the original id.
    const storedIds = new Set(store.all().map((e) => e.id));
    for (const r of [...accepted, ...duplicates]) expect(storedIds.has(r.json().eventId)).toBe(true);
    expect(new Set(duplicates.map((r) => r.json().eventId)).size).toBe(10);
  });

  it('rejects invalid events without storing anything', async () => {
    const { app, store } = setup();
    const res = await app.inject({ method: 'POST', url: '/events', payload: { ...event(1), type: 'nope' } });
    expect(res.statusCode).toBe(400);
    expect(store.all()).toHaveLength(0);
  });

  it('flags an idempotency key reused for a different event as a conflict', async () => {
    const { app, store } = setup();
    await app.inject({ method: 'POST', url: '/events', payload: event(1, 'shared-key') });
    const res = await app.inject({ method: 'POST', url: '/events', payload: event(2, 'shared-key') });
    expect(res.statusCode).toBe(409);
    expect(store.all()).toHaveLength(1);
  });

  it('keeps the event when the downstream enqueue fails', async () => {
    const broken: JobQueue<StoredEvent> = { add: async () => { throw new Error('redis down'); } };
    const { app, store, errors } = setup(broken);
    const res = await app.inject({ method: 'POST', url: '/events', payload: event(1) });
    expect(res.statusCode).toBe(202);
    expect(store.all()).toHaveLength(1);
    expect(errors).toHaveLength(1);
  });

  it('mock product actions emit typed events, including failures with reasons', async () => {
    const { app, store } = setup();
    const signup = await app.inject({
      method: 'POST',
      url: '/signup',
      headers: { 'idempotency-key': 'signup-0001' },
      payload: { email: 'ada@example.test', name: 'Ada' },
    });
    expect(signup.statusCode).toBe(202);
    const { userId } = signup.json();

    const pay = await app.inject({
      method: 'POST',
      url: `/users/${userId}/payment-methods`,
      headers: { 'idempotency-key': 'pay-attempt-0001' },
      payload: { cardToken: 'tok_chargeDeclined' },
    });
    expect(pay.statusCode).toBe(202);
    const trail = await store.listByUser(userId);
    expect(trail.map((e) => e.type)).toEqual(['signed_up', 'payment_failed']);
    expect(trail[1]).toMatchObject({ reason: 'card_declined' });

    const noKey = await app.inject({ method: 'POST', url: `/users/${userId}/first-success`, payload: {} });
    expect(noKey.statusCode).toBe(400);
  });
});
