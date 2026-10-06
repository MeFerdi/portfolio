import { MarkdownParser, ParserRegistry } from '../src/ingest/parser';
import { HashingEmbedder } from '../src/ingest/embeddings';
import { IngestService } from '../src/ingest/pipeline';
import { InMemoryVectorStore } from '../src/store/memory-store';

describe('ingestion', () => {
  it('parses title and id from markdown', async () => {
    const doc = await new MarkdownParser().parse({ source: 'docs/My Policy.md', content: '---\nx: 1\n---\n# Real Title\nbody' });
    expect(doc).toMatchObject({ id: 'my-policy', title: 'Real Title' });
    expect(doc.markdown.startsWith('# Real Title')).toBe(true);
  });

  it('PDF parsing is an explicit, unimplemented extension point', async () => {
    const parser = new ParserRegistry().forSource('handbook.pdf');
    await expect(parser.parse({ source: 'handbook.pdf', content: Buffer.from('') })).rejects.toThrow('Not implemented: PDF parsing');
  });

  it('rejects unknown formats', () => {
    expect(() => new ParserRegistry().forSource('x.docx')).toThrow(/No parser/);
  });

  it('re-ingesting a document replaces its chunks', async () => {
    const store = new InMemoryVectorStore();
    const svc = new IngestService(new HashingEmbedder(), store);
    await svc.ingest([{ source: 'a.md', content: '# A\n## One\nfirst\n## Two\nsecond' }]);
    expect(await store.countChunks()).toBe(2);
    await svc.ingest([{ source: 'a.md', content: '# A\nonly one section now' }]);
    expect(await store.countChunks()).toBe(1);
    expect((await store.keywordSearch('second', 5))).toEqual([]);
  });
});
