---
id: 01KNNVX2QX5TBN1JT3AG2QQVKX
title: "Pattern: Clarification Task"
type: pattern
tags: [agents, workflow, patterns, orchestration, architecture]
created: 2026-04-07
updated: 2026-04-07
visibility: public
confidence: high
related: [concepts/task-decomposition, concepts/agent-failure-modes, concepts/human-in-the-loop, patterns/pattern-pipeline]
---

# Pattern: Clarification Task

When a specification is ambiguous at decomposition time, insert an explicit **clarification task** into the task list before the implementation task that depends on the unclear decision. Do not proceed with assumptions.

## When to Use

- A task cannot be fully specified because a design decision has not been made
- Two valid implementations exist and the choice has downstream consequences
- An API contract from the architecture output is underspecified
- A milestone scope is unclear (e.g., "handle errors" without defining which errors)

Do **not** use this pattern as a way to defer thinking. Only insert a clarification task when a genuine ambiguity exists that a downstream agent or developer cannot safely resolve alone.

## Structure

```
Task ID: M2-T2a  (clarification task, prefixed before implementation task M2-T2b)
Title: Clarify error handling contract for PaymentService
Files: (none — output is a written decision)
What to implement:
  - Document which exceptions PaymentService should raise vs. catch-and-log
  - Confirm whether CallerError or ServiceError is returned on network timeout
Acceptance criteria:
  1. Written decision exists in docs/decisions/payment-error-contract.md
Dependencies: M2-T1

Task ID: M2-T2b
Title: Implement PaymentService error handling
Dependencies: M2-T2a  ← blocks on clarification
```

## Example

A Task Breakdown Agent encounters a milestone: "Integrate with third-party SMS provider." The architecture output specifies a `SmsClient` interface but does not define retry behaviour on failure.

Rather than assuming (retry 3 times? fail fast? queue?), the agent emits:

1. `M3-T1a` — Clarification: Define retry policy for SmsClient failures (owner: architect)
2. `M3-T1b` — Implement SmsClient with agreed retry policy (depends on M3-T1a)

The downstream code generation agent is blocked on `M3-T1b` until the decision is documented — preventing silent, hard-to-reverse assumptions from entering the codebase.

## Trade-offs

| Pro | Con |
|---|---|
| Surfaces ambiguity early, before it compounds | Adds latency — a human or decision-making agent must resolve it |
| Makes assumptions explicit and reviewable | Can feel over-formal for small, obvious decisions |
| Prevents silent divergence between architecture intent and implementation | Requires discipline to not skip when "it's probably fine" |

## Related Patterns

- [Task Decomposition](../concepts/task-decomposition.md) — the parent process that generates these tasks
- [Human-in-the-Loop](../concepts/human-in-the-loop.md) — clarification tasks often require human resolution
- [Pattern: Confirm Before Destructive](./pattern-confirm-before-destructive.md) — similar gate pattern for risky actions
- [Agent Failure Modes](../concepts/agent-failure-modes.md) — unresolved ambiguity is a primary failure source

## See Also

- [Pipeline Pattern](./pattern-pipeline.md)
- [System Prompt Design](../concepts/system-prompt-design.md)
