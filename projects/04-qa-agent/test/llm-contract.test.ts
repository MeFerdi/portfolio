import { z } from 'zod';
import { buildUserContent } from '../src/llm/client';
import { FakeLlm } from './fakes';

const Verdict = z.object({ verdict: z.enum(['fit', 'partial', 'unfit']) });

describe('LLM output contract', () => {
  it('accepts output that matches the schema', async () => {
    const llm = new FakeLlm({ check: () => ({ verdict: 'fit' }) });
    await expect(
      llm.structured({ task: 'check', system: '', prompt: '', schema: Verdict }),
    ).resolves.toEqual({ verdict: 'fit' });
  });

  it('rejects output that drifts from the schema', async () => {
    const llm = new FakeLlm({ check: () => ({ verdict: 'maybe' }) });
    await expect(
      llm.structured({ task: 'check', system: '', prompt: '', schema: Verdict }),
    ).rejects.toThrow();
  });
});

describe('user content builder', () => {
  it('keeps text-only prompts as a plain string', () => {
    expect(buildUserContent('hello')).toBe('hello');
    expect(buildUserContent('hello', [])).toBe('hello');
  });

  it('places base64 image blocks before the prompt text', () => {
    expect(buildUserContent('what broke?', [{ mediaType: 'image/png', base64: 'AAAA' }])).toEqual([
      { type: 'image', source: { type: 'base64', media_type: 'image/png', data: 'AAAA' } },
      { type: 'text', text: 'what broke?' },
    ]);
  });
});
