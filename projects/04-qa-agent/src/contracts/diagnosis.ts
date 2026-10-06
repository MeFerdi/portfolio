import { z } from 'zod';

/** What the model must return for task 'diagnose-failure'. Advisory only: it never changes pass/fail. */
export const Diagnosis = z.object({
  summary: z.string().min(1),
  likelyRootCause: z.string().min(1),
  suspectedFiles: z
    .array(
      z.object({
        path: z.string().min(1),
        reason: z.string().min(1),
      }),
    )
    .max(5),
  confidence: z.enum(['low', 'medium', 'high']),
  suggestedNextStep: z.string().min(1),
});

export type Diagnosis = z.infer<typeof Diagnosis>;
export type Confidence = Diagnosis['confidence'];
