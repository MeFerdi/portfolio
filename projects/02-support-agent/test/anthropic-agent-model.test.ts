import Anthropic from '@anthropic-ai/sdk';
import { AgentModelError } from '../src/llm/agent-model';
import { AnthropicAgentModel, toAnthropicMessages } from '../src/llm/anthropic-agent-model';
import { ToolRegistry } from '../src/tools/registry';

/** Adapter contract tests: request shape and response mapping, with fetch stubbed (no network, no key). */
function stubClient(respond: (body: Record<string, unknown>) => Response) {
  const sent: Record<string, unknown>[] = [];
  const client = new Anthropic({
    apiKey: 'test-key',
    maxRetries: 0,
    fetch: async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      sent.push(body);
      return respond(body);
    },
  });
  return { client, sent };
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const toolUseResponse = {
  id: 'msg_1',
  type: 'message',
  role: 'assistant',
  model: 'claude-opus-5-5',
  stop_reason: 'tool_use',
  stop_sequence: null,
  usage: { input_tokens: 10, output_tokens: 5 },
  content: [
    { type: 'thinking', thinking: '', signature: 'sig-abc' },
    { type: 'text', text: 'Checking.' },
    { type: 'tool_use', id: 'toolu_1', name: 'get_order_status', input: { orderId: 'ord_1001' } },
  ],
};

describe('AnthropicAgentModel', () => {
  it('sends auto tool_choice and clean JSON schemas, and maps tool calls back', async () => {
    const { client, sent } = stubClient(() => json(200, toolUseResponse));
    const model = new AnthropicAgentModel('claude-opus-5-5', client);

    const step = await model.next({ system: 'sys', messages: [{ role: 'user', text: 'hi' }], tools: new ToolRegistry().specs() });

    const req = sent[0]!;
    expect(req.tool_choice).toEqual({ type: 'auto' });
    const tools = req.tools as { name: string; input_schema: Record<string, unknown> }[];
    expect(tools.find((t) => t.name === 'update_customer_record')?.input_schema).toMatchObject({
      type: 'object',
      additionalProperties: false,
    });
    expect(JSON.stringify(tools)).not.toContain('$schema');

    expect(step).toMatchObject({
      text: 'Checking.',
      stopReason: 'tool_use',
      toolCalls: [{ id: 'toolu_1', name: 'get_order_status', input: { orderId: 'ord_1001' } }],
    });
  });

  it('wraps provider errors as AgentModelError', async () => {
    const { client } = stubClient(() => json(529, { type: 'error', error: { type: 'overloaded_error', message: 'Overloaded' } }));
    const model = new AnthropicAgentModel('claude-opus-5-5', client);
    await expect(model.next({ system: 's', messages: [{ role: 'user', text: 'hi' }], tools: [] })).rejects.toBeInstanceOf(AgentModelError);
  });
});

describe('toAnthropicMessages', () => {
  it('replays provider content verbatim and merges consecutive user-role entries', () => {
    const providerContent = toolUseResponse.content;
    const out = toAnthropicMessages([
      { role: 'user', text: 'hi' },
      { role: 'assistant', text: 'Checking.', toolCalls: [], providerContent },
      { role: 'tool', results: [{ toolCallId: 'toolu_1', content: '{}', isError: false }] },
      { role: 'user', text: 'next' },
    ]);
    expect(out).toHaveLength(3);
    expect(out[1]).toEqual({ role: 'assistant', content: providerContent });
    expect(out[2]).toEqual({
      role: 'user',
      content: [
        { type: 'tool_result', tool_use_id: 'toolu_1', content: '{}', is_error: false },
        { type: 'text', text: 'next' },
      ],
    });
  });
});
