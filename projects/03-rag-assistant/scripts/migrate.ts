// Applies migrations/*.sql in filename order, once each. Usage: npm run migrate
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Client } from 'pg';
import { loadEnv } from '../src/config/env';
import { logger } from '../src/lib/logger';

async function main(): Promise<void> {
  const client = new Client({ connectionString: loadEnv().DATABASE_URL });
  await client.connect();
  try {
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
    const dir = path.resolve('migrations');
    for (const name of (await readdir(dir)).filter((n) => n.endsWith('.sql')).sort()) {
      const { rowCount } = await client.query('SELECT 1 FROM schema_migrations WHERE name = $1', [name]);
      if (rowCount) continue;
      await client.query('BEGIN');
      await client.query(await readFile(path.join(dir, name), 'utf8'));
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
      await client.query('COMMIT');
      logger.info({ migration: name }, 'applied');
    }
  } catch (err) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err: unknown) => {
  logger.fatal({ err }, 'migration failed');
  process.exit(1);
});
