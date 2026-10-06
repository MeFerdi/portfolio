import type { FastifyInstance } from 'fastify';
import { buildApp, type PolicyConfig } from '../src/app';
import { ManualClock } from '../src/lib/clock';
import { seedBackends } from '../src/mocks/seed';
import { type ScriptEntry, ScriptedAgentModel } from './fakes';

export const AMINA = 'tok_amina';
export const BRIAN = 'tok_brian';
export const AMINA_READONLY = 'tok_amina_readonly';

export function setup(script: ScriptEntry[] = [], policy: Partial<PolicyConfig> = {}) {
  const model = new ScriptedAgentModel(script);
  const backends = seedBackends();
  const clock = new ManualClock();
  const app = buildApp({ model, backends, clock, policy, logger: false });
  return { app, model, backends, clock };
}

export interface ChatResponse {
  conversationId: string;
  reply: string;
  end: string;
  pendingActions: { id: string; tool: string; summary: string; expiresAt: string }[];
  toolEvents: { tool: string; status: string; code?: string }[];
}

export async function chat(app: FastifyInstance, token: string, message: string, conversationId?: string) {
  const res = await app.inject({
    method: 'POST',
    url: '/chat',
    headers: { authorization: `Bearer ${token}` },
    payload: { message, ...(conversationId ? { conversationId } : {}) },
  });
  return { status: res.statusCode, body: res.json() as ChatResponse };
}

export async function confirm(app: FastifyInstance, token: string, conversationId: string, actionId: string) {
  const res = await app.inject({
    method: 'POST',
    url: `/chat/${conversationId}/confirm`,
    headers: { authorization: `Bearer ${token}` },
    payload: { actionId },
  });
  return { status: res.statusCode, body: res.json() as Record<string, unknown> };
}
