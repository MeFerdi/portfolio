# Frontend (phase 2)

Not built yet, on purpose. Phase 1 is the backend and its permission model;
the API is exercised through tests and `curl` (see the root README).

Planned: a small React chat widget that

- calls `POST /chat` and renders the agent's reply,
- renders each entry in `pendingActions` as a confirmation card showing the
  `summary` with **Confirm** / **Dismiss** buttons,
- calls `POST /chat/:id/confirm` with the `actionId` on Confirm and shows the
  result, and handles `409` (already used), `410` (expired) and `404`.

The confirm button is the only path by which a write ever executes, so the
card must show the summary verbatim and never auto-confirm.
