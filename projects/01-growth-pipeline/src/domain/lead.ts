import { z } from 'zod';

/**
 * A lead as it arrives from any LeadSource, before normalisation.
 * At least an email, or a company domain plus a person's name, is required
 * so that every lead has a stable identity (see pipeline/idempotency.ts).
 */
export const RawLeadSchema = z
  .object({
    email: z.string().trim().email().optional(),
    fullName: z.string().trim().min(1).optional(),
    title: z.string().trim().min(1).optional(),
    companyName: z.string().trim().min(1).optional(),
    companyDomain: z.string().trim().min(1).optional(),
    /** Public company page to research, e.g. https://acme.com/about. */
    websiteUrl: z.string().trim().url().optional(),
    /** Which LeadSource produced the record, e.g. "csv-import". */
    source: z.string().min(1),
    /** Identifier of the record within its source, for traceability. */
    sourceRef: z.string().optional(),
  })
  .refine((l) => l.email !== undefined || (l.companyDomain !== undefined && l.fullName !== undefined), {
    message: 'A lead needs an email, or both companyDomain and fullName',
  });

export type RawLead = z.infer<typeof RawLeadSchema>;

/** A validated lead with its deduplication key and normalised identity fields. */
export interface Lead {
  leadKey: string;
  email: string | null;
  fullName: string | null;
  title: string | null;
  companyName: string | null;
  companyDomain: string | null;
  websiteUrl: string | null;
  source: string;
  sourceRef: string | null;
}

export type LeadStatus =
  | 'ingested'
  | 'researched'
  | 'scored'
  | 'disqualified'
  | 'drafted'
  | 'failed';
