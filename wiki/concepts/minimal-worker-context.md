---
id: 01KQ30A80BRRQG25RQAH938ND8
title: "Minimal Worker Context"
type: concept
tags: [agents, orchestration, context, architecture, patterns]
created: 2026-04-10
updated: 2026-04-10
visibility: public
confidence: high
related: [pattern-supervisor-worker, context-management, multi-agent-systems]
source: qa/sofie-session-2026-04-10-multi-agent-patterns-q-a.md
---

# Minimal Worker Context

## Definition

Minimal worker context is a design principle for multi-agent systems stating that **each worker agent should hold only the context strictly required to complete its own assigned subtask** — and no more. Workers must not need awareness of sibling workers, the orchestrator's internal state, or the broader task structure.

This principle is a key design constraint of the [Supervisor-Worker Pattern](../patterns/pattern-supervisor-worker.md).

## Why It Matters

- **Token efficiency** — Smaller context windows cost less and leave more room for task-relevant content.
- **Isolation** — Workers that carry no cross-worker state cannot corrupt each other's reasoning or outputs.
- **Scalability** — Stateless, minimal-context workers are easier to spawn in parallel without coordination overhead.
- **Debuggability** — A worker's behaviour depends only on its own input, making failures easier to reproduce and trace.
- **Error containment** — A failure in one worker does not cascade into others because there is no shared context to corrupt.

## Example

In a supervisor-worker pipeline processing 10 documents:
- ❌ **Violation**: Each worker receives all 10 documents plus a note saying "you are handling document 3".
- ✅ **Correct**: Each worker receives only document 3 (or whichever is assigned), with no reference to the other documents or workers.

The orchestrator retains the global view; workers operate in deliberate ignorance of it.

## Relationship to Task Decomposition

Minimal worker context only works when [task decomposition](../patterns/pattern-supervisor-worker.md#structure) produces genuinely independent subtasks. If a worker *needs* to know about another worker's output to do its job, the decomposition is wrong — the tasks are not truly parallel. Redesign the decomposition before trying to enforce context minimality.

## Common Pitfalls

- Passing the full original prompt to every worker "for context" — this defeats the principle.
- Including the list of all sibling workers or their assigned tasks in each worker's prompt.
- Merging step context leaking back into worker prompts on retry.

## See Also

- [Supervisor-Worker Pattern](../patterns/pattern-supervisor-worker.md)
- [Context Management](../concepts/context-management.md)
- [Multi-Agent Systems](../concepts/multi-agent-systems.md)
- [Agent Loops](../concepts/agent-loops.md)
