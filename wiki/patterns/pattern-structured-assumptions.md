---
id: 01KNNVX2R3F555C0P0DW8ND77S
title: "Pattern: Structured Assumptions"
type: pattern
tags: [patterns, agents, orchestration, workflow, prompting]
created: 2026-04-07
updated: 2026-04-07
visibility: public
confidence: high
related: [pattern-architecture-first, pattern-clarification-task, concepts/task-decomposition, concepts/human-in-the-loop]
---

# Pattern: Structured Assumptions

Before planning or implementing a complex task, a dedicated agent analyzes available evidence and produces **explicit, structured assumptions** — each with a confidence level, a cited source, and a stated consequence if the assumption is wrong. The main workflow then presents these to a human or downstream agent for confirmation.

## When to Use

- When an agent is about to make non-trivial architectural or design decisions
- When multiple valid approaches exist and the wrong choice has real consequences
- When prior decisions from earlier steps should constrain current choices
- When codebase context needs to be surfaced before a planning step
- In phased workflows where locked decisions must carry forward

## Structure

```
[Orchestrator]
    │
    ├─ spawns ──▶ [Assumptions Analyzer Agent]
    │                  │
    │                  ├─ reads codebase / prior context
    │                  ├─ forms assumptions with evidence
    │                  ├─ classifies: Confident / Likely / Unclear
    │                  └─ flags gaps for external research
    │
    ◀── returns structured assumptions ──┘
    │
    ├─ presents to human or downstream agent
    └─ confirms / revises before proceeding
```

The assumptions agent **never presents directly to the user** — it returns structured output for the orchestrator to handle.

## Example

In the [GSD Framework](../frameworks/framework-gsd.md), the `gsd-assumptions-analyzer` agent is spawned with a phase description and codebase hints. It returns:

```markdown
## Assumptions

### State Management
- **Assumption:** Use Zustand for local UI state in this phase
  - **Why this way:** `src/store/` contains 4 existing Zustand stores (e.g. `src/store/auth.ts`)
  - **If wrong:** Introducing a second state library creates inconsistency and increases bundle size
  - **Confidence:** Confident

### API Layer
- **Assumption:** Extend existing REST client rather than adding GraphQL
  - **Why this way:** `src/api/client.ts` is used in 12 components; no GraphQL tooling present
  - **If wrong:** Phase deliverable requires new infrastructure work not scoped here
  - **Confidence:** Likely

## Needs External Research
- Library X compatibility with Node 20 — not determinable from codebase alone
```

## Trade-offs

| Benefit | Cost |
|---|---|
| Surfaces hidden assumptions before they become bugs | Adds a round-trip before planning begins |
| Forces concrete consequence thinking | Requires well-structured orchestration |
| Honest confidence levels prevent overconfident planning | Analysts can over-read thin evidence |
| Prior decisions carry forward explicitly | Calibration tier must be set correctly upstream |

### Calibration

Output verbosity should scale with stakes and team maturity. A `minimal_decisive` tier produces a single recommendation per item; `full_maturity` produces multiple alternatives with deep citations. Choosing the wrong tier creates either noise or insufficient signal.

## Related Patterns

- [Pattern: Architecture First](../patterns/pattern-architecture-first.md) — assumptions naturally precede architecture decisions
- [Pattern: Clarification Task](../patterns/pattern-clarification-task.md) — similar role but focused on user-facing ambiguity rather than codebase analysis
- [Pattern: Confirm Before Destructive](../patterns/pattern-confirm-before-destructive.md) — assumptions confirmation gates irreversible actions
- [Human in the Loop](../concepts/human-in-the-loop.md) — the human review step that validates assumptions before planning proceeds

## See Also

- [GSD Framework](../frameworks/framework-gsd.md)
- [Task Decomposition](../concepts/task-decomposition.md)
- [Self-Critique](../concepts/self-critique.md)
