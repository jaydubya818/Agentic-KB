---
title: "Context Manager Agent Pattern"
type: pattern
tags: [agents, context, orchestration, patterns, architecture]
created: 2025-01-01
updated: 2025-01-01
visibility: public
confidence: high
related: [concepts/context-management.md, concepts/task-decomposition.md, concepts/multi-agent-systems.md, patterns/pattern-pipeline.md]
---

# Context Manager Agent Pattern

A dedicated agent that runs before a code-generation (or any execution) agent, determining precisely which context is needed for the task at hand — and, crucially, which context to exclude.

## When to Use

- In multi-agent pipelines where an execution agent (e.g. Code Generation Agent) consumes context from a growing codebase
- When context bloat is a recurring problem — long projects accumulate files that pollute prompts
- When tasks are broken down by a [Task Decomposition](../concepts/task-decomposition.md) step and each subtask has distinct, bounded context needs
- When multiple agents share a large architecture document, but each needs only a slice of it

## Structure

The Context Manager Agent sits between the Task Breakdown Agent and the Code Generation Agent in the pipeline.

```
Task Spec + Architecture + File List
          │
  [Context Manager Agent]
          │
  Scoped Context Package
          │
  [Code Generation Agent]
```

**Inputs:**
1. The specific task spec (from Task Breakdown Agent)
2. The full architecture output
3. A current file listing or summary of what has been built

**Outputs (structured):**
- **Files to Read** — ordered by importance, with a reason for each; if only one function in a large file is relevant, name the function
- **Files to Ignore** — explicitly lists files that appear relevant but aren't needed
- **Relevant Contracts (inlined)** — specific function signatures, types, or API contracts pasted directly so the execution agent needn't search
- **Current State Summary** — 2–3 sentences on what has been built that affects this task
- **Watch-Outs** — gotchas, edge cases, or prior decisions that could cause a mistake
- **Reminder** — a closing instruction scoping the execution agent to exactly the current task

## Example

For a task "implement the `/users/:id` endpoint":

- **Read:** `src/routes/users.ts` (route registration pattern), `src/db/user-model.ts` (User type definition)
- **Ignore:** `src/routes/auth.ts` (different domain), `src/utils/logger.ts` (not needed for this endpoint)
- **Inlined contract:** `getUserById(id: string): Promise<User | null>` from the architecture doc
- **State summary:** "Auth middleware is complete. The `/users` list endpoint is live. No user detail route exists yet."
- **Watch-out:** "User IDs are UUIDs, not integers — do not cast to number."

## Trade-offs

| Pro | Con |
|---|---|
| Keeps execution agent prompts small and focused | Adds an extra LLM call (latency + cost) per task |
| Explicit ignore list prevents plausible-but-wrong file reads | Requires a reliable file index or codebase summary as input |
| Inlined contracts reduce hallucination of interfaces | Context Manager itself can be wrong about what's relevant |
| 400-token output cap enforces discipline | May need tuning per project as codebase grows |

The hard output cap (400 tokens) is a key design constraint — if the output exceeds it, the agent has loaded too much. This acts as a forcing function for selectivity.

## Key Rules

- More context is **not** better — load only what is needed for the specific task
- Never include test files unless the task is writing tests
- Never include files from previous milestones unless they define an interface this task must implement

## Related Patterns

- [Pipeline Pattern](../patterns/pattern-pipeline.md) — the Context Manager Agent is a stage in a sequential pipeline
- [Fan-out Worker Pattern](../patterns/pattern-fan-out-worker.md) — context scoping becomes critical when workers run in parallel
- [External Memory Pattern](../patterns/pattern-external-memory.md) — the file index / codebase summary the Context Manager reads is a form of external memory

## See Also

- [Context Management](../concepts/context-management.md)
- [Task Decomposition](../concepts/task-decomposition.md)
- [Multi-Agent Systems](../concepts/multi-agent-systems.md)
