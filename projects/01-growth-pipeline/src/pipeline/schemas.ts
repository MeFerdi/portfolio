import { z } from 'zod';
import type { Icp } from '../domain/icp';

/**
 * Output contracts for every LLM task. Anything the model returns is parsed
 * through these before it is stored or acted on; a mismatch fails the job
 * (and BullMQ retries it) rather than letting malformed data through.
 */

export const TASKS = {
  research: 'lead-research',
  icpFit: 'icp-fit',
  outreachDraft: 'outreach-draft',
} as const;

export const ResearchNotesSchema = z.object({
  summary: z.string().min(1).max(1200),
  /** Concrete, sourced observations (e.g. "hiring 3 platform engineers per careers page"). */
  signals: z.array(z.string().min(1)).max(10),
  /** What could not be determined; the scorer treats these as unknown, not negative. */
  unknowns: z.array(z.string().min(1)).max(10),
});
export type ResearchNotes = z.infer<typeof ResearchNotesSchema>;

export const VERDICTS = ['fit', 'partial', 'unfit'] as const;
export type VerdictLabel = (typeof VERDICTS)[number];

/**
 * Built per ICP so `matchedCriteria` can only name criteria that exist:
 * a model inventing a criterion id is schema drift and is rejected.
 */
export function buildFitVerdictSchema(icp: Icp) {
  const ids = icp.criteria.map((c) => c.id) as [string, ...string[]];
  return z.object({
    verdict: z.enum(VERDICTS),
    reasons: z.array(z.string().min(1)).min(1).max(8),
    matchedCriteria: z.array(z.enum(ids)),
  });
}
export type FitVerdict = z.infer<ReturnType<typeof buildFitVerdictSchema>>;

// Catches unfilled templates such as "Hi {{firstName}}" or "[Company]".
const PLACEHOLDER = /\{\{|\}\}|\[(first ?name|name|company|title)\]/i;

const noPlaceholders = (field: string, maxLength: number) =>
  z
    .string()
    .min(1)
    .max(maxLength)
    .refine((s) => !PLACEHOLDER.test(s), { message: `${field} contains an unfilled template placeholder` });

export const OutreachDraftSchema = z.object({
  subject: noPlaceholders('subject', 120),
  body: noPlaceholders('body', 1500),
  /** The lead-specific facts the draft relies on, so a reviewer can check them quickly. */
  personalisationPoints: z.array(z.string().min(1)).min(1).max(5),
});
export type OutreachDraft = z.infer<typeof OutreachDraftSchema>;
