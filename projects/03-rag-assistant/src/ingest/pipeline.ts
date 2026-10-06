import { indexableText, type ParsedDocument } from '../domain/types';
import { logger } from '../lib/logger';
import type { VectorStore } from '../store/vector-store';
import { type ChunkOptions, chunkDocument, DEFAULT_CHUNK_OPTIONS } from './chunker';
import type { EmbeddingProvider } from './embeddings';
import { ParserRegistry, type RawDocument } from './parser';

export interface IngestSummary {
  documents: { id: string; title: string; chunks: number }[];
  totalChunks: number;
}

export class IngestService {
  constructor(
    private readonly embedder: EmbeddingProvider,
    private readonly store: VectorStore,
    private readonly parsers = new ParserRegistry(),
    private readonly chunkOptions: ChunkOptions = DEFAULT_CHUNK_OPTIONS,
  ) {}

  async ingest(raws: RawDocument[]): Promise<IngestSummary> {
    const summary: IngestSummary = { documents: [], totalChunks: 0 };
    for (const raw of raws) {
      const doc = await this.parsers.forSource(raw.source).parse(raw);
      const count = await this.ingestParsed(doc);
      summary.documents.push({ id: doc.id, title: doc.title, chunks: count });
      summary.totalChunks += count;
    }
    return summary;
  }

  private async ingestParsed(doc: ParsedDocument): Promise<number> {
    const chunks = chunkDocument(doc, this.chunkOptions);
    const embeddings = await this.embedder.embed(chunks.map(indexableText), 'document');
    await this.store.replaceDocument(
      doc,
      chunks.map((chunk, i) => ({ chunk, embedding: embeddings[i]! })),
    );
    logger.debug({ docId: doc.id, chunks: chunks.length }, 'ingested document');
    return chunks.length;
  }
}
