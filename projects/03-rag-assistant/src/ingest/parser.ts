import path from 'node:path';
import type { ParsedDocument } from '../domain/types';

export interface RawDocument {
  /** Path or URI the content came from; the doc id is derived from it. */
  source: string;
  content: string | Buffer;
}

/** Pluggable per-format parser. Output is always markdown so one chunker serves all formats. */
export interface DocumentParser {
  readonly extensions: readonly string[];
  parse(raw: RawDocument): Promise<ParsedDocument>;
}

export function docIdFromSource(source: string): string {
  const base = path.basename(source).replace(/\.[^.]+$/, '');
  return base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export class MarkdownParser implements DocumentParser {
  readonly extensions = ['.md', '.markdown'] as const;

  async parse(raw: RawDocument): Promise<ParsedDocument> {
    const text = stripFrontMatter(raw.content.toString()).replace(/\r\n/g, '\n');
    const id = docIdFromSource(raw.source);
    if (!id) throw new Error(`Cannot derive a document id from source "${raw.source}"`);
    const h1 = /^#\s+(.+)$/m.exec(text);
    return { id, title: h1?.[1]?.trim() ?? id, source: raw.source, markdown: text };
  }
}

export class PdfParser implements DocumentParser {
  readonly extensions = ['.pdf'] as const;

  async parse(_raw: RawDocument): Promise<ParsedDocument> {
    // TODO: extract text with `pdf-parse` (or `unpdf`), map font-size jumps to
    // markdown headings, then reuse the markdown chunker unchanged.
    throw new Error('Not implemented: PDF parsing');
  }
}

export class ParserRegistry {
  constructor(private readonly parsers: DocumentParser[] = [new MarkdownParser(), new PdfParser()]) {}

  forSource(source: string): DocumentParser {
    const ext = path.extname(source).toLowerCase();
    const parser = this.parsers.find((p) => p.extensions.includes(ext));
    if (!parser) throw new Error(`No parser registered for "${ext || source}"`);
    return parser;
  }
}

function stripFrontMatter(text: string): string {
  return text.startsWith('---\n') ? text.replace(/^---\n[\s\S]*?\n---\n/, '') : text;
}
