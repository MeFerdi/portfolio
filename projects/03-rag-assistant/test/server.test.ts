import { buildServer } from '../src/api/server';
import { FakeLlm } from './fakes';
import { corpusAskService } from './helpers';
import { HashingEmbedder } from '../src/ingest/embeddings';
import { IngestService } from '../src/ingest/pipeline';

describe('HTTP API', () => {
  async function app() {
    const llm = new FakeLlm({});
    const { ask, store } = await corpusAskService(llm);
    return buildServer({ ask, store, ingest: new IngestService(new HashingEmbedder(), store) });
  }

  it('GET /health reports chunk count', async () => {
    const res = await (await app()).inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json().chunks).toBeGreaterThan(10);
  });

  it('POST /ask validates the body', async () => {
    const res = await (await app()).inject({ method: 'POST', url: '/ask', payload: {} });
    expect(res.statusCode).toBe(400);
  });

  it('POST /ask returns the public response shape', async () => {
    const res = await (await app()).inject({ method: 'POST', url: '/ask', payload: { question: 'Who won the football world cup in 2022?' } });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'not_in_corpus', answer: expect.any(String), citations: [], reason: 'low_retrieval_score' });
  });

  it('POST /ingest adds documents', async () => {
    const server = await app();
    const res = await server.inject({
      method: 'POST',
      url: '/ingest',
      payload: { documents: [{ source: 'parking.md', content: '# Parking\nVisitor parking is on level 2.' }] },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ totalChunks: 1, documents: [{ id: 'parking', chunks: 1 }] });
  });
});
