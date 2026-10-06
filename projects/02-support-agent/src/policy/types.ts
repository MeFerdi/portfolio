import type { z } from 'zod';
import type { MockBackends } from '../mocks/seed';

export type Access = 'read' | 'write';

/**
 * Capability scopes a session can be granted. A tool declares exactly one;
 * the gateway refuses any tool whose scope the session lacks.
 */
export const ALL_SCOPES = ['payments:read', 'orders:read', 'crm:read', 'crm:write', 'tickets:write'] as const;
export type Scope = (typeof ALL_SCOPES)[number];
export const READ_SCOPES: readonly Scope[] = ['payments:read', 'orders:read', 'crm:read'];

/** Who is acting. Derived from authentication, never from model output. */
export interface Session {
  conversationId: string;
  customerId: string;
  scopes: readonly Scope[];
}

export interface ToolContext {
  /** The authenticated customer. Tools never accept a customer id as input. */
  customerId: string;
  now: Date;
  backends: MockBackends;
}

interface ToolBase<Args> {
  name: string;
  description: string;
  scope: Scope;
  /** Must be a strict object schema: unknown keys (e.g. `customerId`) are rejected, not ignored. */
  input: z.ZodType<Args>;
  execute(ctx: ToolContext, args: Args): unknown;
}

export interface ReadTool<Args> extends ToolBase<Args> {
  access: 'read';
}

export interface WriteTool<Args> extends ToolBase<Args> {
  access: 'write';
  /**
   * Side-effect-free check + human-readable description of what `execute`
   * would do. Runs when the PendingAction is created, so out-of-scope writes
   * are refused up front instead of being offered for confirmation.
   */
  describe(ctx: ToolContext, args: Args): string;
}

export type Tool<Args = unknown> = ReadTool<Args> | WriteTool<Args>;

export type RefusalCode =
  | 'unknown_tool'
  | 'scope_not_granted'
  | 'invalid_arguments'
  | 'out_of_scope'
  | 'invalid_state'
  | 'rate_limited';

/** Thrown by tools and the gateway when a call must not proceed. The message is safe to show the model. */
export class ToolRefusal extends Error {
  constructor(
    readonly code: RefusalCode,
    message: string,
  ) {
    super(message);
  }
}
