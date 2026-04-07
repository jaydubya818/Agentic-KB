---
title: "Architecture Decision Record (ADR) Pattern"
type: pattern
tags: [architecture, patterns, workflow, documentation]
created: 2025-01-30
updated: 2025-01-30
visibility: public
confidence: high
related: [pattern-architecture-first, concepts/system-prompt-design, concepts/task-decomposition]
---

# Architecture Decision Record (ADR) Pattern

A structured format for capturing significant architecture decisions, their context, trade-offs, and consequences — so that future developers understand not just *what* was decided but *why*.

## When to Use

- A decision will have long-lasting structural impact (tech stack choice, service boundaries, API contracts)
- Multiple reasonable options exist and the rejection rationale matters
- You need an audit trail for compliance, onboarding, or retrospectives
- A decision involves trade-offs the team should explicitly accept

## Structure

Each ADR is a standalone markdown document with a sequential identifier:

```markdown
# ADR-NNN: [Decision Title]

**Date**: YYYY-MM-DD
**Status**: Proposed | Accepted | Superseded

## Context
[What situation prompted this decision? What are the constraints?]

## Decision
[What was decided?]

## Rationale
[Why this option over others? What trade-offs were evaluated?]

## Alternatives Considered
1. [Option A] — rejected because [reason]
2. [Option B] — rejected because [reason]

## Consequences
**Positive**: [benefits]
**Negative**: [costs, risks, limitations]
**Neutral**: [things that change but aren't good/bad]

## Implementation Notes
[How to implement; any migration steps needed]
```

## Example

An agent asked to evaluate a message queue technology produces:

- **ADR-012: Use Kafka over RabbitMQ for event streaming** — with context (high-throughput requirements, replay needs), rationale (log compaction, consumer groups), alternatives rejected (RabbitMQ: no replay; SQS: vendor lock-in), and negative consequences (operational complexity).

## Trade-offs

| Benefit | Cost |
|---|---|
| Decisions are revisitable and auditable | Adds documentation overhead |
| Rejection reasoning prevents re-litigating old debates | Requires discipline to maintain status field |
| Onboarding is faster when context is preserved | ADRs can go stale if not updated to "Superseded" |

## Design Principles Behind Good ADRs

- **Present multiple options before recommending one** — a single option is a decree, not a decision
- **Design for 18-month scale, not 10-year scale** — avoid speculative over-engineering
- **Prefer boring technology** unless there is a clear, documented reason for novelty
- **Data migrations are the hardest part** — plan them first and note them explicitly in Implementation Notes
- **Observability is not optional** — flag logging, tracing, and metrics requirements in Consequences
- **Flag team decisions vs. unilateral ones** — note which decisions require broader sign-off

## Related Patterns

- [Architecture First Pattern](pattern-architecture-first.md) — establish system structure before implementation
- [Clarification Before Task Pattern](pattern-clarification-task.md) — surface ambiguities before committing to a design
- [Adversarial Plan Review](pattern-adversarial-plan-review.md) — stress-test ADR alternatives before accepting

## See Also

- [Task Decomposition](../concepts/task-decomposition.md)
- [System Prompt Design](../concepts/system-prompt-design.md)
- [Agent Observability](../concepts/agent-observability.md)
