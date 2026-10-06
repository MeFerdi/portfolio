/** A source document after parsing, before chunking. */
export interface ParsedDocument {
  /** Stable id derived from the source path, e.g. "expense-policy". */
  id: string;
  title: string;
  source: string;
  /** Markdown body; headings drive chunk boundaries. */
  markdown: string;
}

export interface Chunk {
  /** `${docId}#${ordinal}` — deterministic so re-ingest is idempotent. */
  id: string;
  docId: string;
  docTitle: string;
  /** Heading trail the chunk sits under, outermost first. */
  headingPath: string[];
  ordinal: number;
  text: string;
}

export interface ScoredChunk {
  chunk: Chunk;
  score: number;
}

export type AnswerStatus = 'answered' | 'not_in_corpus' | 'refused';

export interface Citation {
  chunkId: string;
  docId: string;
  quote: string;
}

export interface AskResult {
  answer: string;
  citations: Citation[];
  status: AnswerStatus;
  /** Machine-readable reason when status is not `answered`. */
  reason?: 'low_retrieval_score' | 'model_declined' | 'citation_validation_failed';
  /** Chunks handed to the model, in rank order. Not exposed over HTTP. */
  retrieved: Chunk[];
}

/** Text used for both embedding and keyword indexing. */
export function indexableText(chunk: Chunk): string {
  return [chunk.docTitle, ...chunk.headingPath, chunk.text].join('\n');
}
