import { z } from 'zod';
import type { ToolSpec } from '../llm/agent-model';
import type { Tool } from '../policy/types';
import { getCustomerProfile, updateCustomerRecord } from './crm';
import { getOrderStatus, listMyOrders, markTicketResolved } from './orders';
import { getPaymentStatus, getRefundStatus } from './payments';

/**
 * The complete set of capabilities the agent has. Anything not listed here
 * (issuing refunds, deleting accounts, touching another customer) does not
 * exist as far as the model is concerned, and calls to it are refused.
 */
export const ALL_TOOLS: readonly Tool[] = [
  getPaymentStatus,
  getRefundStatus,
  listMyOrders,
  getOrderStatus,
  getCustomerProfile,
  updateCustomerRecord,
  markTicketResolved,
];

export class ToolRegistry {
  private readonly byName: Map<string, Tool>;

  constructor(tools: readonly Tool[] = ALL_TOOLS) {
    this.byName = new Map(tools.map((t) => [t.name, t]));
  }

  get(name: string): Tool | undefined {
    return this.byName.get(name);
  }

  all(): Tool[] {
    return [...this.byName.values()];
  }

  /** Provider-neutral tool definitions for the model. Write tools say so in their description. */
  specs(): ToolSpec[] {
    return this.all().map((t) => ({
      name: t.name,
      description: t.access === 'write' ? `[WRITE - needs customer confirmation] ${t.description}` : t.description,
      inputSchema: toInputSchema(t.input),
    }));
  }
}

function toInputSchema(schema: z.ZodType): Record<string, unknown> {
  // The dialect marker is noise to the API; everything else passes through.
  const { $schema: _dialect, ...rest } = z.toJSONSchema(schema) as Record<string, unknown>;
  return rest;
}
