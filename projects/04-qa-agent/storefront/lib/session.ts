import type { FastifyReply, FastifyRequest } from 'fastify';
import type { InMemoryStore } from '../store';

export const SESSION_COOKIE = 'sid';

export function readCookie(request: FastifyRequest, name: string): string | undefined {
  const header = request.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}

export function setSessionCookie(reply: FastifyReply, sid: string): void {
  reply.header('set-cookie', `${SESSION_COOKIE}=${encodeURIComponent(sid)}; Path=/; HttpOnly; SameSite=Lax`);
}

/** Returns the session id, or sends a redirect to /login and returns null. */
export function requireSession(request: FastifyRequest, reply: FastifyReply, store: InMemoryStore): string | null {
  const sid = readCookie(request, SESSION_COOKIE);
  if (!sid || !store.sessionEmail(sid)) {
    void reply.redirect('/login');
    return null;
  }
  return sid;
}
