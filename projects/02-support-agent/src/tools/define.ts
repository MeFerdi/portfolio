import type { Tool } from '../policy/types';

/**
 * Keeps each tool's argument type precise at its definition site, then erases
 * it for the registry. Safe because the gateway always parses raw input with
 * `tool.input` before calling `execute`/`describe`.
 */
export function defineTool<Args>(tool: Tool<Args>): Tool {
  return tool as unknown as Tool;
}
