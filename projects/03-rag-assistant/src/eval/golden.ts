import { readFile } from 'node:fs/promises';
import { z } from 'zod';

export const GoldenItemSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  /** Docs that contain the answer; empty for out-of-corpus items. */
  expectedDocIds: z.array(z.string()),
  /** Case-insensitive substrings the answer must all contain. */
  expectedAnswerContains: z.array(z.string()).optional(),
  expectStatus: z.enum(['answered', 'not_in_corpus', 'refused']),
  tags: z.array(z.string()),
});
export type GoldenItem = z.infer<typeof GoldenItemSchema>;

export function parseGolden(jsonl: string): GoldenItem[] {
  const items: GoldenItem[] = [];
  const seen = new Set<string>();
  jsonl.split('\n').forEach((line, i) => {
    if (!line.trim()) return;
    const parsed = GoldenItemSchema.safeParse(JSON.parse(line));
    if (!parsed.success) throw new Error(`golden line ${i + 1}: ${z.prettifyError(parsed.error)}`);
    if (seen.has(parsed.data.id)) throw new Error(`golden line ${i + 1}: duplicate id ${parsed.data.id}`);
    seen.add(parsed.data.id);
    items.push(parsed.data);
  });
  return items;
}

export async function loadGolden(file: string): Promise<{ items: GoldenItem[]; raw: string }> {
  const raw = await readFile(file, 'utf8');
  return { items: parseGolden(raw), raw };
}
