import { readFile } from 'node:fs/promises';
import { z } from 'zod';

const CriterionSchema = z.object({
  /** Stable identifier the model must cite in `matchedCriteria`. */
  id: z.string().regex(/^[a-z0-9-]+$/, 'criterion ids are kebab-case'),
  description: z.string().min(1),
  /** A "fit" verdict requires every required criterion to be matched. */
  required: z.boolean().default(false),
});

export const IcpSchema = z
  .object({
    /** Stored on every verdict so scores can be traced to the ICP that produced them. */
    version: z.string().min(1),
    name: z.string().min(1),
    summary: z.string().min(1),
    criteria: z.array(CriterionSchema).min(1),
    disqualifiers: z.array(z.string().min(1)).default([]),
  })
  .refine((icp) => new Set(icp.criteria.map((c) => c.id)).size === icp.criteria.length, {
    message: 'criterion ids must be unique',
  });

export type Icp = z.infer<typeof IcpSchema>;
export type IcpCriterion = Icp['criteria'][number];

export async function loadIcp(path: string): Promise<Icp> {
  const raw: unknown = JSON.parse(await readFile(path, 'utf8'));
  return IcpSchema.parse(raw);
}
