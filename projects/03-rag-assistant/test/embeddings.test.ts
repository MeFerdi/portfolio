import { cosine, HashingEmbedder, VoyageEmbedder } from '../src/ingest/embeddings';

describe('HashingEmbedder', () => {
  it('is deterministic, normalised, and lexically sensitive', async () => {
    const e = new HashingEmbedder(256);
    const [a1, a2, b, c] = await e.embed(['meal allowance travel', 'meal allowance travel', 'travel meal limits', 'parental leave weeks'], 'document');
    expect(a1).toEqual(a2);
    expect(Math.hypot(...a1!)).toBeCloseTo(1);
    expect(cosine(a1!, b!)).toBeGreaterThan(cosine(a1!, c!));
  });
});

describe('VoyageEmbedder', () => {
  it('posts the documented request shape and restores input order', async () => {
    const fetchImpl = jest.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string) as { input: string[] };
      return new Response(
        JSON.stringify({ data: body.input.map((_, i) => ({ index: i, embedding: [i] })).reverse() }),
        { status: 200 },
      );
    });
    const e = new VoyageEmbedder({ apiKey: 'k', model: 'voyage-3.5', batchSize: 2, fetchImpl: fetchImpl as unknown as typeof fetch });
    const out = await e.embed(['a', 'b', 'c'], 'query');
    expect(out).toEqual([[0], [1], [0]]);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe('https://api.voyageai.com/v1/embeddings');
    expect(JSON.parse(init.body as string)).toMatchObject({ model: 'voyage-3.5', input_type: 'query' });
  });

  it('surfaces HTTP errors', async () => {
    const fetchImpl = (async () => new Response('nope', { status: 401 })) as unknown as typeof fetch;
    await expect(new VoyageEmbedder({ apiKey: 'k', model: 'm', fetchImpl }).embed(['a'], 'document')).rejects.toThrow(/401/);
  });
});
