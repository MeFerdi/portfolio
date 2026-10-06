import type { Lead } from '../../domain/lead';
import type { LlmClient } from '../../llm/client';
import type { CompanyProfile } from '../../scraper/profile-parser';
import { RESEARCH_SYSTEM, researchPrompt } from '../prompts';
import { ResearchNotesSchema, TASKS, type ResearchNotes } from '../schemas';

/**
 * AI research step: condenses the lead record and (if available) the parsed
 * company page into notes the scorer can reason over. A missing profile is a
 * degraded input, not a failure: the model is told the page was unavailable.
 */
export function researchLead(llm: LlmClient, lead: Lead, profile: CompanyProfile | null): Promise<ResearchNotes> {
  return llm.structured({
    task: TASKS.research,
    system: RESEARCH_SYSTEM,
    prompt: researchPrompt(lead, profile),
    schema: ResearchNotesSchema,
    effort: 'low',
    maxTokens: 4000,
  });
}
