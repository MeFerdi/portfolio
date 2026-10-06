import type { Scope } from '../policy/types';

export interface Principal {
  customerId: string;
  scopes: readonly Scope[];
}

/**
 * Static bearer-token table standing in for real authentication.
 * TODO: replace with verification of a signed session token (JWT from the
 * host app) that carries customer id + granted scopes as claims.
 */
export class MockAuth {
  constructor(private readonly tokens: Record<string, Principal>) {}

  resolve(token: string): Principal | undefined {
    return this.tokens[token];
  }
}
