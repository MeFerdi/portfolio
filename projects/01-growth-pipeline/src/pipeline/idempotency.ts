import { createHash } from 'node:crypto';
import type { RawLead } from '../domain/lead';

/**
 * Identity rules for leads. The same person arriving from two sources, or the
 * same CSV imported twice, must collapse to one key so that:
 *  - the `leads` table upsert is a no-op on repeat, and
 *  - BullMQ refuses to enqueue a second job with the same jobId.
 * Keys are hashed so no PII ends up in Redis key names or logs.
 */

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** "HTTPS://www.Acme.com:443/about?x=1" -> "acme.com" */
export function normaliseDomain(input: string): string {
  let host = input.trim().toLowerCase();
  host = host.replace(/^[a-z][a-z0-9+.-]*:\/\//, '');
  host = host.split(/[/?#]/, 1)[0] ?? '';
  host = host.replace(/^[^@]*@/, ''); // credentials or an email pasted as a domain
  host = host.replace(/:\d+$/, '');
  host = host.replace(/\.$/, '');
  host = host.replace(/^www\./, '');
  return host;
}

/** "  José  O'Brien-Smith " -> "jose obrien smith" */
export function normaliseName(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’.]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** The human-readable identity a key is derived from. Never stored in Redis. */
export function canonicalIdentity(lead: Pick<RawLead, 'email' | 'companyDomain' | 'fullName'>): string {
  if (lead.email) return `email:${normaliseEmail(lead.email)}`;
  if (lead.companyDomain && lead.fullName) {
    return `domain-name:${normaliseDomain(lead.companyDomain)}|${normaliseName(lead.fullName)}`;
  }
  throw new Error('Cannot derive a lead key without an email or companyDomain + fullName');
}

export function leadKey(lead: Pick<RawLead, 'email' | 'companyDomain' | 'fullName'>): string {
  return createHash('sha256').update(canonicalIdentity(lead)).digest('hex').slice(0, 32);
}

export type StageName = 'ingest' | 'research' | 'score' | 'draft';

/** BullMQ forbids ':' in custom job ids, hence the dash. */
export function stageJobId(stage: StageName, key: string): string {
  return `${stage}-${key}`;
}
