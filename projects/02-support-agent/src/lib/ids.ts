import { randomUUID } from 'node:crypto';

/** Unguessable, prefixed ids. Pending-action ids are capabilities, so they must not be sequential. */
export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '')}`;
}
