import { z } from 'zod';
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
