import type { Chunk, ParsedDocument } from '../domain/types';

export interface ChunkOptions {
  /** Soft upper bound on chunk length in characters. */
  maxChars: number;
  /** Trailing context (characters) repeated at the start of the next chunk in the same section. */
  overlapChars: number;
}

export const DEFAULT_CHUNK_OPTIONS: ChunkOptions = { maxChars: 800, overlapChars: 150 };

interface Section {
  headingPath: string[];
  body: string;
}

interface Unit {
  text: string;
  /** Separator placed before this unit when it follows another in a chunk. */
  sep: string;
}

/**
 * Heading-aware chunking: a chunk never spans two sections, so every chunk
 * has one unambiguous heading trail. Within a section, paragraphs are packed
 * greedily; oversized paragraphs fall back to sentences, then to words.
 */
export function chunkDocument(doc: ParsedDocument, options: ChunkOptions = DEFAULT_CHUNK_OPTIONS): Chunk[] {
  if (options.maxChars <= 0) throw new Error('maxChars must be positive');
  if (options.overlapChars < 0 || options.overlapChars >= options.maxChars) {
    throw new Error('overlapChars must be in [0, maxChars)');
  }
  const chunks: Chunk[] = [];
  for (const section of splitSections(doc.markdown)) {
    for (const text of packUnits(segment(section.body, options.maxChars), options)) {
      chunks.push({
        id: `${doc.id}#${chunks.length}`,
        docId: doc.id,
        docTitle: doc.title,
        headingPath: section.headingPath,
        ordinal: chunks.length,
        text,
      });
    }
  }
  return chunks;
}

export function splitSections(markdown: string): Section[] {
  const sections: Section[] = [];
  const trail: string[] = [];
  let buffer: string[] = [];
  let inFence = false;

  const flush = () => {
    const body = buffer.join('\n').trim();
    if (body) sections.push({ headingPath: [...trail], body });
    buffer = [];
  };

  for (const line of markdown.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    const heading = inFence ? null : /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (heading?.[1] && heading[2]) {
      flush();
      const level = heading[1].length;
      trail.length = Math.min(trail.length, level - 1);
      trail[level - 1] = heading[2];
      // Fill gaps (e.g. "#" then "###") so the trail stays dense.
      for (let i = 0; i < level; i++) trail[i] ??= '';
      continue;
    }
    buffer.push(line);
  }
  flush();
  return sections.map((s) => ({ ...s, headingPath: s.headingPath.filter(Boolean) }));
}

function segment(body: string, maxChars: number): Unit[] {
  const units: Unit[] = [];
  for (const paragraph of body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)) {
    if (paragraph.length <= maxChars) {
      units.push({ text: paragraph, sep: '\n\n' });
      continue;
    }
    let first = true;
    for (const sentence of paragraph.split(/(?<=[.!?])\s+/)) {
      for (const piece of hardSplit(sentence, maxChars)) {
        units.push({ text: piece, sep: first ? '\n\n' : ' ' });
        first = false;
      }
    }
  }
  return units;
}

function hardSplit(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  const pieces: string[] = [];
  let current = '';
  for (const word of text.split(/\s+/)) {
    if (current && current.length + 1 + word.length > maxChars) {
      pieces.push(current);
      current = '';
    }
    // A single word longer than maxChars is cut mid-word; rare in prose.
    let rest = word;
    while (rest.length > maxChars) {
      pieces.push(rest.slice(0, maxChars));
      rest = rest.slice(maxChars);
    }
    current = current ? `${current} ${rest}` : rest;
  }
  if (current) pieces.push(current);
  return pieces;
}

function packUnits(units: Unit[], { maxChars, overlapChars }: ChunkOptions): string[] {
  const out: string[] = [];
  let current: Unit[] = [];

  const length = (us: Unit[]) => us.reduce((n, u, i) => n + u.text.length + (i ? u.sep.length : 0), 0);
  const render = (us: Unit[]) => us.map((u, i) => (i ? u.sep : '') + u.text).join('');

  for (const unit of units) {
    if (current.length && length([...current, unit]) > maxChars) {
      out.push(render(current));
      // Carry trailing units as overlap, but never the whole previous chunk,
      // and never so much that the new unit no longer fits.
      const carry: Unit[] = [];
      for (let i = current.length - 1; i > 0; i--) {
        const candidate = [current[i]!, ...carry];
        if (length(candidate) > overlapChars || length([...candidate, unit]) > maxChars) break;
        carry.unshift(current[i]!);
      }
      current = carry;
    }
    current.push(unit);
  }
  if (current.length) out.push(render(current));
  return out;
}
