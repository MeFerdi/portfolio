# Detect -> diagnose -> act -> measure

One stall, end to end. Solid arrows are synchronous calls; dashed arrows are queue hand-offs (BullMQ in production, `InlineQueue` in tests and the simulator).

```mermaid
sequenceDiagram
    autonumber
    actor U as New user
    participant API as Mock SaaS API (Fastify)
    participant ING as Ingestor
    participant PG as Postgres
    participant SCAN as stall-detector (scheduled)
    participant DX as diagnose-and-draft
    participant LLM as LlmClient (Claude)
    participant DL as deliver
    participant MAIL as Mailer (Resend / console)
    participant MEAS as scripts/measure.ts

    Note over U,PG: Track
    U->>API: POST /users/:id/payment-methods (Idempotency-Key)
    API->>ING: payment_failed {reason: card_declined}
    ING->>ING: Zod-validate EventInput
    ING->>PG: INSERT events ... ON CONFLICT (idempotency_key) DO NOTHING
    ING--)ING: enqueue analytics forward (best effort, event already durable)
    API-->>U: 202 {eventId}

    Note over SCAN,PG: Detect (every STALL_SCAN_EVERY_MS)
    SCAN->>PG: users who signed up in window, not yet first_success
    SCAN->>SCAN: assessRisk(trail, now, rules v1) -> {stalledAtStep, riskScore, signals}
    SCAN->>SCAN: assignCohort(hash(salt:userId))
    SCAN->>PG: INSERT interventions (key = user|step|v1) ON CONFLICT DO NOTHING
    alt control arm
        SCAN->>PG: status = control_logged (never contacted)
    else intervention arm and status = pending
        SCAN--)DX: add(jobId = intervention key)
    end

    Note over DX,LLM: Diagnose
    DX->>PG: load intervention + event trail
    DX->>LLM: structured('stall-diagnosis', StallDiagnosis schema)
    LLM-->>DX: {likelyReason, evidence[eventId], recommendedAction, email}
    DX->>DX: schema parse + every evidence.eventId must exist in trail
    alt output rejected
        DX--)DX: retry with exponential backoff, then dead_letters row
    else grounded
        DX->>PG: pending -> drafted (conditional UPDATE)
        DX--)DL: add(jobId = intervention key)
    end

    Note over DL,MAIL: Act
    DL->>PG: load record (skip if already sent)
    DL->>MAIL: send(Idempotency-Key = intervention key)
    alt send keeps failing
        DL--)DL: retries exhausted -> dead_letters row, status dead_lettered
    else accepted
        DL->>PG: drafted -> sent (conditional UPDATE)
    end
    MAIL-->>U: recovery email

    Note over U,MEAS: Measure
    U->>API: ...completes remaining steps (or not)
    MEAS->>MEAS: completion among flagged users, intervention vs control
    MEAS->>MEAS: two-proportion z-test, duplicate-send rate
```
