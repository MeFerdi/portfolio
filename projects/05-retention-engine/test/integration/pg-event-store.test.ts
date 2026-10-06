/**
 * Real Postgres. Skipped unless INTEGRATION=1:
 *   docker compose up -d && npm run migrate && npm run test:integration
 */
import { randomUUID } from 'node:crypto';
import type { Pool } from 'pg';
import { loadEnv } from '../../src/config/env';
import { createPool } from '../../src/db/pool';
import { PgEventStore } from '../../src/events/pg-store';
import { PgInterventionRepository } from '../../src/interventions/pg-repository';

const run = process.env.INTEGRATION === '1' ? describe : describe.skip;

run('Postgres stores (integration)', () => {
  let pool: Pool;
  beforeAll(() => {
    pool = createPool(loadEnv().DATABASE_URL);
  });
  afterAll(async () => {
    await pool.end();
  });

  it('enforces the event idempotency key under concurrent writes', async () => {
    const store = new PgEventStore(pool);
    const userId = `it-${randomUUID()}`;
    const input = { type: 'signed_up' as const, userId, occurredAt: new Date().toISOString(), idempotencyKey: `it-${randomUUID()}` };
    const results = await Promise.all(Array.from({ length: 10 }, () => store.write(input)));
    expect(results.filter((r) => !r.duplicate)).toHaveLength(1);
    expect(new Set(results.map((r) => r.event.id)).size).toBe(1);
    expect(await store.listByUser(userId)).toHaveLength(1);
  });

  it('creates one intervention per key under concurrent scans', async () => {
    const repo = new PgInterventionRepository(pool);
    const userId = `it-${randomUUID()}`;
    const input = {
      key: `${userId}|add_payment|v1`,
      userId,
      stalledAtStep: 'add_payment' as const,
      ruleVersion: 'v1',
      cohort: 'intervention' as const,
      riskScore: 0.5,
      signals: [],
    };
    const results = await Promise.all(Array.from({ length: 10 }, () => repo.createIfAbsent(input)));
    expect(results.filter((r) => r.created)).toHaveLength(1);
  });
});
