import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Client } from 'pg';
import { loadEnv } from '../src/config/env';
import { logger } from '../src/lib/logger';

/** Applies migrations/*.sql in filename order, once each, each in its own transaction. */
async function main(): Promise<void> {
  const env = loadEnv();
  const dir = join(__dirname, '..', 'migrations');
  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`,
    );
    const applied = new Set(
      (await client.query<{ name: string }>('SELECT name FROM schema_migrations')).rows.map((r) => r.name),
    );
    const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
    for (const file of files) {
      if (applied.has(file)) continue;
      const sql = await readFile(join(dir, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        logger.info({ file }, 'migration applied');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }
  } finally {
    await client.end();
  }
}

main().catch((err: unknown) => {
  logger.fatal({ err }, 'migration failed');
  process.exit(1);
});
