import { z } from 'zod';
import { RawLeadSchema, type Lead } from '../../domain/lead';
import { leadKey, normaliseDomain, normaliseEmail } from '../idempotency';

/** Bad input will never succeed on retry; workers map this to a non-retryable failure. */
export class InvalidLeadError extends Error {
  constructor(readonly details: string) {
    super(`Invalid lead: ${details}`);
  }
}

/** Pure: validate an untrusted lead record and normalise it into a Lead with its dedup key. */
export function normaliseLead(input: unknown): Lead {
  const parsed = RawLeadSchema.safeParse(input);
  if (!parsed.success) throw new InvalidLeadError(z.prettifyError(parsed.error));
  const raw = parsed.data;

  const companyDomain =
    raw.companyDomain !== undefined
      ? normaliseDomain(raw.companyDomain)
      : raw.websiteUrl !== undefined
        ? normaliseDomain(raw.websiteUrl)
        : null;

  return {
    leadKey: leadKey(raw),
    email: raw.email !== undefined ? normaliseEmail(raw.email) : null,
    fullName: raw.fullName ?? null,
    title: raw.title ?? null,
    companyName: raw.companyName ?? null,
    companyDomain: companyDomain || null,
    websiteUrl: raw.websiteUrl ?? null,
    source: raw.source,
    sourceRef: raw.sourceRef ?? null,
  };
}

/** The page the research stage should load, if any: an explicit URL, else the company homepage. */
export function researchUrl(lead: Lead): string | null {
  if (lead.websiteUrl) return lead.websiteUrl;
  if (lead.companyDomain) return `https://${lead.companyDomain}/`;
  return null;
}
