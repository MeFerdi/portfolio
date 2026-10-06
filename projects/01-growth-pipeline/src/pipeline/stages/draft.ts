import type { ExampleMessage } from '../../domain/example-message';
import type { Lead } from '../../domain/lead';
import type { LlmClient } from '../../llm/client';
import { OUTREACH_SYSTEM, outreachPrompt } from '../prompts';
import { OutreachDraftSchema, TASKS, type FitVerdict, type OutreachDraft, type ResearchNotes } from '../schemas';

/** Stage 2 gate: never spend tokens (or risk an email) on an unfit lead. */
export function shouldDraft(verdict: FitVerdict): boolean {
  return verdict.verdict === 'fit' || verdict.verdict === 'partial';
}

/** Text embedded as the similarity query for retrieving example messages. */
export function exampleQueryText(lead: Lead, research: ResearchNotes): string {
  return [lead.title, lead.companyName, research.summary, ...research.signals].filter(Boolean).join('\n');
}

export type DraftResult = { skipped: true; reason: string } | { skipped: false; draft: OutreachDraft };

export async function draftOutreach(
  llm: LlmClient,
  input: { lead: Lead; research: ResearchNotes; verdict: FitVerdict; examples: ExampleMessage[] },
): Promise<DraftResult> {
  if (!shouldDraft(input.verdict)) {
    return { skipped: true, reason: `verdict is ${input.verdict.verdict}` };
  }
  const draft = await llm.structured({
    task: TASKS.outreachDraft,
    system: OUTREACH_SYSTEM,
    prompt: outreachPrompt(input.lead, input.research, input.verdict, input.examples),
    schema: OutreachDraftSchema,
    effort: 'medium',
    maxTokens: 4000,
  });
  return { skipped: false, draft };
}
