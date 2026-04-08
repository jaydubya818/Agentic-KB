---
id: 01KNNVX2R0DQ8B32F9W5P8YVEC
title: "Milestone-Based Planning Pattern"
type: pattern
tags: [agents, orchestration, workflow, patterns, task-decomposition]
created: 2025-01-30
updated: 2025-01-30
visibility: public
confidence: high
related: [concepts/task-decomposition.md, patterns/pattern-fan-out-worker.md, patterns/pattern-pipeline.md]
---

# Milestone-Based Planning Pattern

A structured approach where an agent translates high-level architecture or design into a sequenced, executable implementation plan organised around independently testable milestones.

## When to Use

- When translating an architecture or design document into actionable engineering work
- When a project spans multiple phases and intermediate checkpoints matter
- When multiple downstream agents or humans will execute the resulting tasks
- When you need explicit dependency tracking to avoid blocked work

## Structure

1. **Ingest reviewed architecture** — ensure all prior decisions, constraints, and known failure modes are understood before planning begins
2. **Identify the critical path** — determine what must exist before anything else can be built
3. **Group work into milestones** — logical checkpoints where the system is independently runnable or testable
4. **Sequence tasks within milestones** — strict ordering with explicit dependencies stated per task
5. **Estimate complexity** — use relative sizing (S/M/L/XL) rather than wall-clock time
6. **Flag risks** — surface anything with high uncertainty or external dependencies

### Milestone Rules

Each milestone must satisfy all of the following:
- Independently testable with a binary success criterion
- Contains no more than ~6 tasks
- Builds directly on the previous milestone
- The **first milestone** is always: get a skeleton running end-to-end with no real business logic

## Example

A Planning Agent sitting between an architecture review step and a task breakdown step in a multi-agent pipeline:

```
[Plan Review Agent (02)]
        ↓
[Planning Agent (03)]  ← produces milestones + task sequences
        ↓
[Task Breakdown Agent (04)]
```

Each task in the plan references specific files from the architecture, carries an explicit complexity estimate, and lists its dependencies:

```
Milestone 1: Skeleton end-to-end
  Task 1 — Scaffold project structure (S) → creates: /src/index.ts, /src/config.ts
  Task 2 — Stub API router with health endpoint (S) → requires Task 1 → creates: /src/routes/health.ts
  Task 3 — Wire config loading (M) → requires Task 1 → creates: /src/config/loader.ts
```

## Trade-offs

| Upside | Downside |
|---|---|
| Clear handoff points between agents or humans | Upfront planning cost before any code is written |
| Explicit dependencies reduce blocked work | Over-rigid sequencing can slow teams that prefer parallel exploration |
| Binary success criteria make progress measurable | Requires a mature architecture input; poor inputs produce poor plans |
| Atomic tasks reduce ambiguity for executors | Sizing estimates (S/M/L/XL) are subjective and may drift |

### Key Constraints
- No task should be "implement the whole X module" — decompose until tasks are atomic
- Any task rated M or larger is a candidate for splitting
- Every task must map to a specific file or set of files

## Related Patterns

- [Task Decomposition](../concepts/task-decomposition.md) — conceptual foundation for breaking work into atomic units
- [Fan-Out Worker Pattern](../patterns/pattern-fan-out-worker.md) — once a plan exists, fan-out execution can parallelise independent tasks
- [Pipeline Pattern](../patterns/pattern-pipeline.md) — the planning agent itself fits within a sequential agent pipeline
- [Human-in-the-Loop](../concepts/human-in-the-loop.md) — milestones are natural review gates for human oversight

## See Also

- [Multi-Agent Systems](../concepts/multi-agent-systems.md)
- [Agent Failure Modes](../concepts/agent-failure-modes.md)
