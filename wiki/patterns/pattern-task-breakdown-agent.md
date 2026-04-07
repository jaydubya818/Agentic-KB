---
title: "Pattern: Task Breakdown Agent"
type: pattern
tags: [agents, orchestration, workflow, patterns, architecture]
created: 2026-04-07
updated: 2026-04-07
visibility: public
confidence: high
related: [concepts/task-decomposition, pattern-pipeline, pattern-fan-out-worker, concepts/system-prompt-design]
---

# Pattern: Task Breakdown Agent

A specialised agent that sits between a planning/architecture stage and an execution stage, translating milestone-level intent into atomic, unambiguous, executor-ready task specifications.

## When to Use

- You have a multi-agent pipeline where one agent plans and another executes (e.g. a Code Generation Agent)
- Milestones or epics are too coarse for direct execution without further clarification
- You want to prevent the executor agent from making scope decisions or asking clarifying questions mid-task
- You need reproducible, verifiable outputs at each step of a pipeline

## Structure

```
[Planning Agent] → milestone list
        ↓
[Task Breakdown Agent]  ← architecture output (file paths, contracts)
        ↓
[Task list: atomic, dependency-ordered]
        ↓
[Code Generation Agent / Executor]
```

**Inputs:**
1. Full planning output (for context)
2. A specific milestone to break down (one at a time)
3. Architecture output (for exact file paths and API contracts)

**Outputs:**
A structured list of atomic tasks, each fully specified (see [Task Decomposition](../concepts/task-decomposition.md) for field definitions).

## Example

Agent system prompt snippet:

```
You are the Task Breakdown Agent. You take a milestone and produce tasks
so specific that the Code Generation Agent can execute each one without
asking any questions.

For each task you must specify:
- Task ID (e.g. M2-T3)
- Title in verb-noun format
- Exact files to create or modify
- Function signatures / interfaces to implement
- What NOT to do (scope boundary)
- Acceptance criteria (max 3, all runnable)
- Dependency task IDs
```

After outputting, the agent signals the next stage:
> "Breakdown complete for [milestone]. Ready for Context Manager Agent (05)."

## Trade-offs

| Pro | Con |
|---|---|
| Executor agent never has to make scope decisions | Adds a pipeline stage and latency |
| Verification is tractable — each task has specific acceptance criteria | Requires a well-formed architecture output upstream |
| Enables fan-out: independent tasks can parallelise | Ambiguous specs surface as clarification tasks, which slow throughput |
| Scope creep is explicit — "What NOT to do" is first-class | Over-decomposition can produce trivial tasks with unnecessary overhead |

## Key Rules

- File paths must match the architecture output **exactly** — no improvisation
- Function signatures must match upstream API contracts
- "Make it work" is never a valid acceptance criterion
- Tasks with more than 3 acceptance criteria must be split
- Ambiguous specs → emit a clarification task before the implementation task

## Related Patterns

- [Pattern: Pipeline](../patterns/pattern-pipeline.md)
- [Pattern: Fan-Out Worker](../patterns/pattern-fan-out-worker.md)
- [Task Decomposition](../concepts/task-decomposition.md)
- [System Prompt Design](../concepts/system-prompt-design.md)
- [Multi-Agent Systems](../concepts/multi-agent-systems.md)
