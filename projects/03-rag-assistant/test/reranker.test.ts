import { applyRanking, IdentityReranker, LlmReranker } from '../src/retrieval/reranker';
import { FakeLlm } from './fakes';
import { chunk } from './helpers';

const cs = ['a', 'b', 'c', 'd'].map((id) => chunk(id, id, `text ${id}`));

describe('applyRanking', () => {
  it('orders by relevance, keeping fusion order for ties', () => {
    const out = applyRanking(cs, { ranking: [{ chunkId: 'c', relevance: 3 }, { chunkId: 'a', relevance: 1 }, { chunkId: 'b', relevance: 1 }, { chunkId: 'd', relevance: 0 }] });
    expect(out.map((c) => c.id)).toEqual(['c', 'a', 'b', 'd']);
  });

  it('ignores invented ids and never drops candidates the model forgot', () => {
    const out = applyRanking(cs, { ranking: [{ chunkId: 'zzz', relevance: 3 }, { chunkId: 'd', relevance: 2 }] });
    expect(out.map((c) => c.id)).toEqual(['d', 'a', 'b', 'c']);
  });
});

describe('rerankers', () => {
  it('identity keeps order', async () => {
    expect(await new IdentityReranker().rerank('q', cs)).toBe(cs);
  });

  it('llm reranker calls the "rerank" task with untrusted-data framing', async () => {
    const llm = new FakeLlm({ rerank: () => ({ ranking: [{ chunkId: 'b', relevance: 3 }] }) });
    const out = await new LlmReranker(llm).rerank('q', cs);
    expect(out[0]!.id).toBe('b');
    expect(llm.calls[0]!.system).toMatch(/untrusted data/);
  });
});
