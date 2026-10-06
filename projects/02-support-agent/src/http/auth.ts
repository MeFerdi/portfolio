import type { FastifyRequest } from 'fastify';
import { HttpError } from '../lib/errors';
import type { MockAuth, Principal } from '../mocks/auth';

/** Resolves the bearer token to the authenticated customer. The customer id never comes from the request body. */
export function authenticate(request: FastifyRequest, auth: MockAuth): Principal {
  const header = request.headers.authorization ?? '';
  const match = /^Bearer (\S+)$/.exec(header);
  const principal = match?.[1] ? auth.resolve(match[1]) : undefined;
  if (!principal) throw new HttpError(401, 'unauthenticated', 'A valid bearer token is required.');
  return principal;
}
