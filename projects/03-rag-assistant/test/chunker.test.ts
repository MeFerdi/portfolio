import { chunkDocument, splitSections } from '../src/ingest/chunker';
import type { ParsedDocument } from '../src/domain/types';

const doc = (markdown: string): ParsedDocument => ({ id: 'doc', title: 'Doc', source: 'doc.md', markdown });

describe('splitSections', () => {
  it('tracks the heading trail and resets deeper levels', () => {
    const sections = splitSections('# A\nintro\n## B\nb body\n### C\nc body\n## D\nd body');
    expect(sections.map((s) => s.headingPath)).toEqual([['A'], ['A', 'B'], ['A', 'B', 'C'], ['A', 'D']]);
  });

  it('ignores # lines inside fenced code blocks', () => {
    const sections = splitSections('# A\n```\n# not a heading\n```\ntext');
    expect(sections).toHaveLength(1);
    expect(sections[0]!.body).toContain('# not a heading');
  });

  it('drops headings with no body', () => {
    expect(splitSections('# A\n## B\nbody')).toEqual([{ headingPath: ['A', 'B'], body: 'body' }]);
  });
});

describe('chunkDocument', () => {
  it('never lets a chunk span two sections', () => {
    const chunks = chunkDocument(doc('# T\n## One\nalpha\n## Two\nbeta'), { maxChars: 1000, overlapChars: 0 });
    expect(chunks.map((c) => [c.headingPath.at(-1), c.text])).toEqual([
      ['One', 'alpha'],
      ['Two', 'beta'],
    ]);
  });

  it('assigns deterministic sequential ids', () => {
    const chunks = chunkDocument(doc('## A\nx\n## B\ny'));
    expect(chunks.map((c) => c.id)).toEqual(['doc#0', 'doc#1']);
    expect(chunks.map((c) => c.ordinal)).toEqual([0, 1]);
  });

  it('packs paragraphs up to maxChars', () => {
    const p = 'word '.repeat(19).trim(); // 94 chars
    const chunks = chunkDocument(doc([p, p, p, p].join('\n\n')), { maxChars: 200, overlapChars: 0 });
    expect(chunks).toHaveLength(2);
    expect(chunks.every((c) => c.text.length <= 200)).toBe(true);
  });

  it('splits long paragraphs on sentences and overlaps consecutive chunks', () => {
    const sentences = Array.from({ length: 12 }, (_, i) => `Sentence number ${i} is here.`);
    const chunks = chunkDocument(doc(sentences.join(' ')), { maxChars: 120, overlapChars: 40 });
    expect(chunks.length).toBeGreaterThan(2);
    for (const c of chunks) expect(c.text.length).toBeLessThanOrEqual(120);
    for (let i = 1; i < chunks.length; i++) {
      const lastOfPrev = chunks[i - 1]!.text.split(/(?<=\.)\s/).at(-1)!;
      expect(chunks[i]!.text.startsWith(lastOfPrev)).toBe(true);
    }
    // Every sentence survives chunking.
    for (const s of sentences) expect(chunks.some((c) => c.text.includes(s))).toBe(true);
  });

  it('hard-splits a single overlong word-run without losing text', () => {
    const long = 'x'.repeat(250);
    const chunks = chunkDocument(doc(long), { maxChars: 100, overlapChars: 0 });
    expect(chunks.map((c) => c.text).join('')).toBe(long);
  });

  it('rejects invalid options', () => {
    expect(() => chunkDocument(doc('x'), { maxChars: 100, overlapChars: 100 })).toThrow();
    expect(() => chunkDocument(doc('x'), { maxChars: 0, overlapChars: 0 })).toThrow();
  });

  it('returns no chunks for an empty document', () => {
    expect(chunkDocument(doc('   \n\n'))).toEqual([]);
  });
});
