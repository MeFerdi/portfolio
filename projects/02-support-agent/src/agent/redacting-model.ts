import type { AgentMessage, AgentModel, AgentRequest, AgentStep } from '../llm/agent-model';
import { type PiiVault, redactDeep, redactText, restoreDeep } from '../policy/redact';

/**
 * Wraps any AgentModel so it only ever sees redacted text: user messages,
 * tool results and earlier assistant output are redacted on the way in, and
 * placeholders in the model's reply and tool arguments are restored on the
 * way out. This is the single choke point for "no PII to the LLM".
 */
export class RedactingAgentModel implements AgentModel {
  constructor(
    private readonly inner: AgentModel,
    private readonly vault: PiiVault,
  ) {}

  async next(req: AgentRequest): Promise<AgentStep> {
    const step = await this.inner.next({ ...req, messages: req.messages.map((m) => this.redactMessage(m)) });
    return {
      ...step,
      text: this.vault.restore(step.text),
      toolCalls: step.toolCalls.map((c) => ({ ...c, input: restoreDeep(c.input, this.vault) })),
    };
  }

  private redactMessage(m: AgentMessage): AgentMessage {
    switch (m.role) {
      case 'user':
        return { role: 'user', text: redactText(m.text, this.vault) };
      case 'tool':
        return { role: 'tool', results: m.results.map((r) => ({ ...r, content: redactText(r.content, this.vault) })) };
      case 'assistant':
        // providerContent is the model's own (already redacted) output and may
        // carry signed blocks that must be replayed byte-for-byte.
        return {
          ...m,
          text: redactText(m.text, this.vault),
          toolCalls: m.toolCalls.map((c) => ({ ...c, input: redactDeep(c.input, this.vault) })),
        };
    }
  }
}

