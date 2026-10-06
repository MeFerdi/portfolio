# Annotated journey: one flagged-and-recovered user

> **Status: TEMPLATE, not yet filled.** Every `<<PLACEHOLDER>>` below must be replaced with output from a real run before this page is cited anywhere. When filled from `scripts/simulate.ts`, the user is **synthetic** and the page must keep saying so.

How to produce the material:

```bash
npm run simulate -- --users 50 --seed <<SEED>> --llm   # real model drafts; needs ANTHROPIC_API_KEY
npm run measure -- data/synthetic-run.json
# pick one intervention-arm user whose record is "sent" and who later reached first_success
```

## 1. Who

| Field | Value |
|---|---|
| User id | `<<USER_ID>>` (synthetic: yes/no `<<SYNTHETIC>>`) |
| Cohort | `<<intervention>>` |
| Rule version | `<<v1>>` |
| Run | seed `<<SEED>>`, commit `<<GIT_SHA>>`, model `<<LLM_MODEL>>` |

## 2. Event trail up to the flag

| Event id | Occurred at | Type | Reason | Annotation |
|---|---|---|---|---|
| `<<id>>` | `<<ts>>` | signed_up | | `<<why it matters>>` |
| `<<id>>` | `<<ts>>` | `<<...>>` | `<<...>>` | `<<...>>` |

## 3. Why the rules flagged them

`assessRisk` output, verbatim:

```json
<<RISK_ASSESSMENT_JSON>>
```

Annotation: `<<which rule fired, threshold vs observed, would a human have flagged this?>>`

## 4. What the model concluded

```json
<<STALL_DIAGNOSIS_JSON>>
```

| Check | Result |
|---|---|
| Every evidence `eventId` exists in the trail | `<<pass/fail>>` |
| Reason is supported by the cited events (human judgement) | `<<yes/partly/no + note>>` |
| Email addresses the actual blocker, no invented offers | `<<yes/no + note>>` |

## 5. What was sent

- Intervention key: `<<user|step|v1>>`
- Provider message id: `<<id>>`
- Attempts before success: `<<n>>`
- Subject: `<<subject>>`

```text
<<EMAIL_BODY>>
```

## 6. What happened next

| Event id | Occurred at | Type | Annotation |
|---|---|---|---|
| `<<id>>` | `<<ts>>` | `<<...>>` | `<<...>>` |

## 7. Honest read

`<<In a synthetic run, recovery is drawn from --base-recovery + --uplift, so this section can only judge the quality of the diagnosis and the email, not whether the email caused the recovery. State that explicitly.>>`
