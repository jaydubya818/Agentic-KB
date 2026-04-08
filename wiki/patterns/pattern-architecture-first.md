---
id: 01KNNVX2QXZZYNXNHNS0BZC429
title: "Architecture First Pattern"
type: pattern
tags: [architecture, patterns, workflow, agents]
updated: 2025-01-30
visibility: public
confidence: high
related: [pattern-architecture-decision-record, pattern-clarification-task, concepts/task-decomposition]
---

# Architecture First Pattern

Establish system structure, interfaces, and constraints *before* writing implementation code. A dedicated architect role (human or agent) owns this phase and produces artifacts that downstream agents or engineers consume.

## When to Use

- Starting a new service, platform, or large feature with multiple integration points
- Planning a refactor that will touch multiple system components
- Making a technology choice that will be expensive to reverse
- When structural decisions have downstream impact on other teams or systems

## Structure

1. **Gather context** — constraints, scale targets, existing systems, team capabilities
2. **Enumerate options** — at least 2–3 viable approaches; never present a single option
3. **Evaluate trade-offs** — pros, cons, risks per option; include a risk assessment for the recommended path
4. **Produce artifacts** — ADRs, interface contracts (OpenAPI/protobuf/shared types), migration plans, diagrams
5. **Flag decision authority** — distinguish decisions the architect can make unilaterally from those needing team input

## Example

An Architect Agent is invoked before a large-scale refactor:

1. Produces an ASCII/Mermaid diagram of the current and target system boundaries
2. Writes ADR-042 documenting the migration strategy, rejected alternatives, and phased cutover plan
3. Flags the database migration as a team decision due to risk, while deciding on internal service API shape unilaterally
4. Specifies observability requirements (traces, metrics, dashboards) as part of the design — not an afterthought

## Key Design Heuristics

> "Design for the scale you need in 18 months, not 10 years."

- **Boring technology over cutting-edge** unless there is a clear, documented reason
- **Explicit contracts between services** (OpenAPI, protobuf, shared types) — implicit contracts become bugs
- **Data migrations are the hardest part** — plan them first, before anything else
- **Observability is not optional** — logging, tracing, and metrics must be designed in, not bolted on

## Trade-offs

| Benefit | Cost |
|---|---|
| Prevents expensive structural rework later | Adds upfront time before any code ships |
| Creates shared understanding across the team | Can become over-engineering if scope creeps |
| ADRs preserve decision rationale for future maintainers | Requires discipline to keep artifacts current |

## Related Patterns

- [ADR Pattern](pattern-architecture-decision-record.md) — the documentation artifact produced by this pattern
- [Clarification Before Task](pattern-clarification-task.md) — surface ambiguities before committing to a design
- [Adversarial Plan Review](pattern-adversarial-plan-review.md) — challenge the recommended option before accepting
- [Confirm Before Destructive](pattern-confirm-before-destructive.md) — gate dangerous migration steps behind human approval

## See Also

- [Task Decomposition](../concepts/task-decomposition.md)
- [Human in the Loop](../concepts/human-in-the-loop.md)
- [Agent Observability](../concepts/agent-observability.md)
