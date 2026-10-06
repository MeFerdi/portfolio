import { Pool } from 'pg';
import { loadEnv } from '../../src/config/env';
import { PgPipelineRepository } from '../../src/db/pg-repository';
import { normaliseLead } from '../../src/pipeline/stages/ingest';

/**
 * Needs `docker compose up -d` and `npm run migrate`. Run with:
 *   npm run test:integration
 */
const describeIntegration = process.env.INTEGRATION === '1' ? describe : describe.skip;

describeIntegration('PgPipelineRepository (real Postgres + pgvector)', () => {
  let pool: Pool;
  let repo: PgPipelineRepository;
  const lead = normaliseLead({ email: `it-${Date.now()}@integration.example`, fullName: 'IT Lead', source: 'integration' });

  beforeAll(() => {
    pool = new Pool({ connectionString: loadEnv().DATABASE_URL });
    repo = new PgPipelineRepository(pool);
  });

  afterAll(async () => {
    await pool.query('DELETE FROM leads WHERE lead_key = $1', [lead.leadKey]);
    await pool.end();
  });

  it('upserts a lead idempotently', async () => {
    await expect(repo.upsertLead(lead)).resolves.toEqual({ inserted: true, status: 'ingested' });
    await expect(repo.upsertLead(lead)).resolves.toEqual({ inserted: false, status: 'ingested' });
    await expect(repo.getLead(lead.leadKey)).resolves.toEqual(lead);
  });

  it('round-trips research and verdicts', async () => {
    const notes = { summary: 's', signals: ['a'], unknowns: [] };
    await repo.saveResearch(lead.leadKey, { profile: null, notes });
    await repo.saveResearch(lead.leadKey, { profile: null, notes }); // replay is safe
    await expect(repo.getResearch(lead.leadKey)).resolves.toEqual({ profile: null, notes });

    const verdict = { verdict: 'partial' as const, reasons: ['r'], matchedCriteria: ['b2b-saas'] };
    await repo.saveVerdict(lead.leadKey, verdict, 'it-1');
    await expect(repo.getVerdict(lead.leadKey)).resolves.toEqual(verdict);
  });

  it('runs a pgvector similarity query', async () => {
    const vector = Array.from({ length: 1024 }, (_, i) => (i === 0 ? 1 : 0));
    await expect(repo.findSimilarMessages(vector, 3)).resolves.toBeInstanceOf(Array);
  });
});

// Redis/BullMQ end-to-end (enqueue -> workers -> drafted) is on the roadmap; see README.
