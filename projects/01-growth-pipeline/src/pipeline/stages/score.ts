import type { Icp } from '../../domain/icp';
import type { Lead } from '../../domain/lead';
import type { LlmClient } from '../../llm/client';
import { icpFitPrompt, icpFitSystem } from '../prompts';
import { buildFitVerdictSchema, TASKS, type FitVerdict, type ResearchNotes } from '../schemas';

/** Stage 1 of the two-stage LLM logic: is this lead worth contacting? */
export async function evaluateFit(llm: LlmClient, icp: Icp, lead: Lead, research: ResearchNotes): Promise<FitVerdict> {
  const verdict = await llm.structured({
    task: TASKS.icpFit,
    system: icpFitSystem(icp),
    prompt: icpFitPrompt(lead, research),
    schema: buildFitVerdictSchema(icp),
    effort: 'medium',
    maxTokens: 4000,
  });
  return applyIcpRules(verdict, icp);
}

/**
 * Deterministic guardrail on top of the model's judgement: a "fit" verdict
 * that does not cite every required criterion is downgraded to "partial".
 * The model can be persuasive; the ICP's hard requirements are not negotiable.
 */
export function applyIcpRules(verdict: FitVerdict, icp: Icp): FitVerdict {
  const matchedCriteria = [...new Set(verdict.matchedCriteria)];
  if (verdict.verdict !== 'fit') return { ...verdict, matchedCriteria };

  const missing = icp.criteria.filter((c) => c.required && !matchedCriteria.includes(c.id)).map((c) => c.id);
  if (missing.length === 0) return { ...verdict, matchedCriteria };

  return {
    verdict: 'partial',
    matchedCriteria,
    reasons: [...verdict.reasons, `Downgraded from fit: required criteria not evidenced (${missing.join(', ')})`],
  };
}
