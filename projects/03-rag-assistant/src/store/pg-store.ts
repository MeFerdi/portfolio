import { Pool } from 'pg';
import type { Chunk, ParsedDocument, ScoredChunk } from '../domain/types';
import type { EmbeddedChunk, VectorStore } from './vector-store';

interface ChunkRow {
  id: string;
  doc_id: string;
  doc_title: string;
  heading_path: string[];
  ordinal: number;
  text: string;
  score: number;
}

const CHUNK_COLUMNS = 'id, doc_id, doc_title, heading_path, ordinal, text';

/**
 * Postgres + pgvector implementation. Schema lives in migrations/.
 * Not covered by the offline test suite; see README roadmap (testcontainers).
 */
export class PgVectorStore implements VectorStore {
  constructor(private readonly pool: Pool) {}

  static fromUrl(url: string): PgVectorStore {
    return new PgVectorStore(new Pool({ connectionString: url }));
  }

  async replaceDocument(doc: ParsedDocument, chunks: EmbeddedChunk[]): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO documents (id, title, source) VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, source = EXCLUDED.source, ingested_at = now()`,
        [doc.id, doc.title, doc.source],
      );
      await client.query('DELETE FROM chunks WHERE doc_id = $1', [doc.id]);
      for (const { chunk, embedding } of chunks) {
        await client.query(
          `INSERT INTO chunks (${CHUNK_COLUMNS}, embedding) VALUES ($1, $2, $3, $4, $5, $6, $7::vector)`,
          [chunk.id, chunk.docId, chunk.docTitle, chunk.headingPath, chunk.ordinal, chunk.text, toVectorLiteral(embedding)],
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async vectorSearch(embedding: number[], k: number): Promise<ScoredChunk[]> {
    const { rows } = await this.pool.query<ChunkRow>(
      `SELECT ${CHUNK_COLUMNS}, 1 - (embedding <=> $1::vector) AS score
       FROM chunks ORDER BY embedding <=> $1::vector LIMIT $2`,
      [toVectorLiteral(embedding), k],
    );
    return rows.map(toScored);
  }

  async keywordSearch(query: string, k: number): Promise<ScoredChunk[]> {
    // OR the terms: plainto/websearch_to_tsquery AND them, which almost never
    // matches a natural-language question. Terms are [a-z0-9] only, so safe to splice.
    const terms = query.toLowerCase().match(/[a-z0-9]+/g) ?? [];
    if (terms.length === 0) return [];
    const { rows } = await this.pool.query<ChunkRow>(
      `SELECT ${CHUNK_COLUMNS}, ts_rank_cd(tsv, q) AS score
       FROM chunks, to_tsquery('english', $1) q
       WHERE tsv @@ q ORDER BY score DESC, id LIMIT $2`,
      [terms.join(' | '), k],
    );
    return rows.map(toScored);
  }

  async countChunks(): Promise<number> {
    const { rows } = await this.pool.query<{ n: string }>('SELECT count(*) AS n FROM chunks');
    return Number(rows[0]?.n ?? 0);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

function toVectorLiteral(v: number[]): string {
  return `[${v.join(',')}]`;
}

function toScored(row: ChunkRow): ScoredChunk {
  const chunk: Chunk = {
    id: row.id,
    docId: row.doc_id,
    docTitle: row.doc_title,
    headingPath: row.heading_path,
    ordinal: row.ordinal,
    text: row.text,
  };
  return { chunk, score: Number(row.score) };
}
