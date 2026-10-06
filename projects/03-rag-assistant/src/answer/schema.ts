import { z } from 'zod';

export const GroundedAnswerSchema = z.object({
  status: z.enum(['answered', 'not_in_corpus', 'refused']),
  answer: z.string().describe('The answer, or a one-sentence explanation when not answered'),
  citations: z
    .array(
      z.object({
        chunkId: z.string().describe('chunk_id of a provided document'),
        quote: z.string().describe('Exact text copied from that chunk'),
      }),
    )
    .describe('Required when status is "answered"; empty otherwise'),
});
export type GroundedAnswer = z.infer<typeof GroundedAnswerSchema>;
