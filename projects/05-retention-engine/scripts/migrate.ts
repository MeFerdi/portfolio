/**
 * Minimal forward-only migration runner: applies migrations/*.sql in filename
 * order, each in its own transaction, recording applied files in schema_migrations.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { loadEnv } from '../src/config/env';
import { createPool } from '../src/db/pool';
import { logger } from '../src/lib/logger';

async function main(): Promise<void> {
  const env = loadEnv();
  const pool = createPool(env.DATABASE_URL);
  const dir = path.join(__dirname, '..', 'migrations');
  try {
    await pool.query(
      'CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())',
    );
    const applied = new Set(
      (await pool.query<{ name: string }>('SELECT name FROM schema_migrations')).rows.map((r) => r.name),
    );
    const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
    for (const file of files) {
      if (applied.has(file)) continue;
      const sql = await readFile(path.join(dir, file), 'utf8');
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        logger.info({ file }, 'migration applied');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }
  } finally {
    await pool.end();
  }
}

main().catch((err: unknown) => {
  logger.error({ err }, 'migration failed');
  process.exit(1);
});
