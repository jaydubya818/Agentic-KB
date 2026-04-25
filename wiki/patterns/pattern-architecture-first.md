     1|---
     2|id: 01KNNVX2QXZZYNXNHNS0BZC429
     3|title: "Architecture First Pattern"
     4|type: pattern
     5|tags: [architecture, patterns, workflow, agents]
     6|stale_after_days: 730
updated: 2025-01-30
     7|visibility: public
     8|confidence: high
     9|related: [pattern-architecture-decision-record, pattern-clarification-task, concepts/task-decomposition]
    10|---
    11|
    12|# Architecture First Pattern
    13|
    14|Establish system structure, interfaces, and constraints *before* writing implementation code. A dedicated architect role (human or agent) owns this phase and produces artifacts that downstream agents or engineers consume.
    15|
    16|## When to Use
    17|
    18|- Starting a new service, platform, or large feature with multiple integration points
    19|- Planning a refactor that will touch multiple system components
    20|- Making a technology choice that will be expensive to reverse
    21|- When structural decisions have downstream impact on other teams or systems
    22|
    23|## Structure
    24|
    25|1. **Gather context** — constraints, scale targets, existing systems, team capabilities
    26|2. **Enumerate options** — at least 2–3 viable approaches; never present a single option
    27|3. **Evaluate trade-offs** — pros, cons, risks per option; include a risk assessment for the recommended path
    28|4. **Produce artifacts** — ADRs, interface contracts (OpenAPI/protobuf/shared types), migration plans, diagrams
    29|5. **Flag decision authority** — distinguish decisions the architect can make unilaterally from those needing team input
    30|
    31|## Example
    32|
    33|An Architect Agent is invoked before a large-scale refactor:
    34|
    35|1. Produces an ASCII/Mermaid diagram of the current and target system boundaries
    36|2. Writes ADR-042 documenting the migration strategy, rejected alternatives, and phased cutover plan
    37|3. Flags the database migration as a team decision due to risk, while deciding on internal service API shape unilaterally
    38|4. Specifies observability requirements (traces, metrics, dashboards) as part of the design — not an afterthought
    39|
    40|## Key Design Heuristics
    41|
    42|> "Design for the scale you need in 18 months, not 10 years."
    43|
    44|- **Boring technology over cutting-edge** unless there is a clear, documented reason
    45|- **Explicit contracts between services** (OpenAPI, protobuf, shared types) — implicit contracts become bugs
    46|- **Data migrations are the hardest part** — plan them first, before anything else
    47|- **Observability is not optional** — logging, tracing, and metrics must be designed in, not bolted on
    48|
    49|## Trade-offs
    50|
    51|| Benefit | Cost |
    52||---|---|
    53|| Prevents expensive structural rework later | Adds upfront time before any code ships |
    54|| Creates shared understanding across the team | Can become over-engineering if scope creeps |
    55|| ADRs preserve decision rationale for future maintainers | Requires discipline to keep artifacts current |
    56|
    57|## Related Patterns
    58|
    59|- [ADR Pattern](pattern-architecture-decision-record.md) — the documentation artifact produced by this pattern
    60|- [Clarification Before Task](pattern-clarification-task.md) — surface ambiguities before committing to a design
    61|- [Adversarial Plan Review](pattern-adversarial-plan-review.md) — challenge the recommended option before accepting
    62|- [Confirm Before Destructive](pattern-confirm-before-destructive.md) — gate dangerous migration steps behind human approval
    63|
    64|## See Also
    65|
    66|- [Task Decomposition](../concepts/task-decomposition.md)
    67|- [Human in the Loop](../concepts/human-in-the-loop.md)
    68|- [Agent Observability](../concepts/agent-observability.md)
    69|