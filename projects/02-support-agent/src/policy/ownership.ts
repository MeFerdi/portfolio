import { ToolRefusal } from './types';

/**
 * Customer scoping: a record is visible only to the customer who owns it.
 * Missing and not-owned are indistinguishable on purpose, so the agent
 * cannot be used to probe which ids exist.
 */
export function requireOwned<T extends { customerId: string }>(
  record: T | undefined,
  customerId: string,
  kind: string,
): T {
  if (!record || record.customerId !== customerId) {
    throw new ToolRefusal('out_of_scope', `No ${kind} with that id exists on this customer's account.`);
  }
  return record;
}
