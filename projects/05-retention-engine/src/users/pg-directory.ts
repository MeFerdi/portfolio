import type { Pool } from 'pg';
import type { UserDirectory, UserProfile } from './directory';

export class PgUserDirectory implements UserDirectory {
  constructor(private readonly pool: Pool) {}

  async create(profile: UserProfile): Promise<void> {
    await this.pool.query(
      'INSERT INTO users (id, email, name) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
      [profile.id, profile.email, profile.name],
    );
  }

  async get(userId: string): Promise<UserProfile | undefined> {
    const res = await this.pool.query<UserProfile>('SELECT id, email, name FROM users WHERE id = $1', [userId]);
    return res.rows[0];
  }
}
