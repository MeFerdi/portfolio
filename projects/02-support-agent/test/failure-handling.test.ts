import { buildApp } from '../src/app';
import { AgentModelError, type AgentModel, type AgentStep } from '../src/llm/agent-model';
import { AMINA, chat, setup } from './helpers';

describe('failure handling', () => {
  it('returns 503 when the model provider fails, and the conversation stays usable', async () => {
    const { app, model } = setup([{ text: 'hello' }]);
    const first = await chat(app, AMINA, 'hi');

    model.enqueue(() => {
      throw new AgentModelError('overloaded', 529);
    });
    const failed = await chat(app, AMINA, 'still there?', first.body.conversationId);
    expect(failed.status).toBe(503);
    expect(failed.body).toMatchObject({ error: 'agent_unavailable' });

    model.enqueue({ text: 'Yes, still here.' });
    const retried = await chat(app, AMINA, 'still there?', first.body.conversationId);
    expect(retried.status).toBe(200);
  });

  it('rejects a second turn while one is in flight on the same conversation', async () => {
    let release!: (step: AgentStep) => void;
    let calls = 0;
    const model: AgentModel = {
      next: () => {
        calls++;
        if (calls === 1) return Promise.resolve({ text: 'hi', toolCalls: [], stopReason: 'end_turn' });
        return new Promise<AgentStep>((resolve) => (release = resolve));
      },
    };
    const app = buildApp({ model, logger: false });
    const first = await chat(app, AMINA, 'hi');
    const id = first.body.conversationId;

    const slow = chat(app, AMINA, 'slow one', id);
    await new Promise((r) => setImmediate(r));
    const concurrent = await chat(app, AMINA, 'impatient', id);
    expect(concurrent.status).toBe(409);

    release({ text: 'done', toolCalls: [], stopReason: 'end_turn' });
    expect((await slow).status).toBe(200);
  });

  it('returns 400 for malformed requests', async () => {
    const { app } = setup();
    const res = await app.inject({
      method: 'POST',
      url: '/chat',
      headers: { authorization: `Bearer ${AMINA}` },
      payload: { message: '', customerId: 'cus_042' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('replies with a safe fallback when the model refuses', async () => {
    const { app } = setup([{ text: '', stopReason: 'refusal' }]);
    const res = await chat(app, AMINA, 'something the model will not do');
    expect(res.body.end).toBe('model_refusal');
    expect(res.body.reply).toMatch(/can't help/);
  });
});
