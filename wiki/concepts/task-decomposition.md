---
id: 01KNNVX2QK8EWFZS8YK1AW9C8J
title: Task Decomposition
type: concept
tags: [agents, orchestration, workflow, architecture, patterns]
created: 2025-01-01
updated: 2026-04-07
visibility: public
confidence: high
related: [pattern-pipeline, pattern-fan-out-worker, concepts/agent-loops, concepts/system-prompt-design]
---

# Task Decomposition

## Definition

Task decomposition is the process of breaking down a high-level goal or milestone into atomic, unambiguous units of work that can be executed independently (or in a defined order) by a code generation agent, human developer, or automated system — without requiring further clarification.

In agentic pipelines, task decomposition is typically a dedicated agent role: the **Task Breakdown Agent** receives a milestone and produces a structured list of tasks specific enough that the downstream executor needs to ask zero questions.

## What Makes a Task Atomic

A well-decomposed task satisfies all four properties:

1. **Bounded file scope** — it touches a predictable, limited set of files
2. **Single clear outcome** — one thing is done when this task is complete
3. **Verifiable** — completion can be confirmed with a specific, runnable check
4. **Time-bounded** — completable in one focused session

If a task fails any of these, it should be split further.

## Required Task Specification Fields

Each atomic task should include:

| Field | Purpose |
|---|---|
| **Task ID** | Hierarchical identifier, e.g. `M2-T3` (Milestone 2, Task 3) |
| **Title** | Verb-noun format — e.g. "Create UserRepository class" |
| **Files to create or modify** | Exact paths from the architecture output |
| **What to implement** | Function signatures, interfaces, explicit behavior |
| **What NOT to do** | Scope boundaries to prevent creep |
| **Acceptance criteria** | Specific and testable — max 3; split if more needed |
| **Dependencies** | Task IDs that must be complete first |

## Why It Matters

Vague tasks are the primary source of rework and agent failure in code generation workflows. When a downstream agent (or developer) has to interpret ambiguity, they introduce assumptions that compound across a codebase. Tight decomposition:

- Eliminates back-and-forth between planning and execution agents
- Makes progress measurable and verifiable at each step
- Enables parallel execution where dependencies allow
- Surfaces ambiguity early — if a task can't be specified, a **clarification task** is written before the implementation task

## Key Rules

- File paths must match the architecture output exactly — no invented paths
- Function signatures must match API contracts from architecture
- **"Make it work" is never an acceptance criterion** — it must name a specific, testable condition
- Max 3 acceptance criteria per task; exceed that → split the task
- Ambiguous spec → write a clarification task before the implementation task

## Example

```
Task ID: M2-T3
Title: Create UserRepository class
Files: src/repositories/user_repository.py
What to implement:
  - UserRepository(db: Database)
  - get_by_id(user_id: str) -> User | None
  - save(user: User) -> None
What NOT to do: Do not implement authentication logic here
Acceptance criteria:
  1. get_by_id returns None for unknown IDs (unit test passes)
  2. save persists user to DB and is idempotent on same user_id
  3. All methods raise RepositoryError (not raw DB errors)
Dependencies: M2-T1 (Database class), M2-T2 (User model)
```

## Pitfalls

- **Over-decomposition**: Tasks so small they lose context and create coordination overhead
- **Under-decomposition**: Tasks too large to be atomic; executor must make architectural decisions
- **Missing dependencies**: Parallel execution of dependent tasks causes merge conflicts or test failures
- **Acceptance criteria that test the wrong thing**: e.g. "function exists" vs. "function returns correct value for edge case X"

## See Also

- [Pattern: Pipeline](../patterns/pattern-pipeline.md)
- [Pattern: Fan-Out Worker](../patterns/pattern-fan-out-worker.md)
- [Agent Loops](./agent-loops.md)
- [System Prompt Design](./system-prompt-design.md)
- [Tool Use](./tool-use.md)
