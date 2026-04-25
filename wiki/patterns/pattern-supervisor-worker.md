---
id: 01KQ30A80A54H7Z1JPH83Z1SW0
title: "Supervisor-Worker Pattern"
type: pattern
tags: [agents, orchestration, patterns, architecture, workflow]
created: 2026-04-10
updated: 2026-04-10
visibility: public
confidence: high
related: [multi-agent-systems, context-management, agent-loops]
source: qa/sofie-session-2026-04-10-multi-agent-patterns-q-a.md
---

# Supervisor-Worker Pattern

A multi-agent architectural pattern where a **supervisor (orchestrator)** decomposes a complex task and fans it out to multiple independent **worker agents**, which execute in parallel before their results are merged into a final output.

## When to Use

- The overall task can be broken into **parallel, independently executable units** — this is the primary precondition.
- Subtasks do not depend on each other's intermediate outputs.
- You want to reduce end-to-end latency by running work concurrently.
- Workers need to be isolated from each other to avoid context bleed or interference.

## Structure

```
┌─────────────────────────────┐
│         Orchestrator        │
│  (defines fan-out strategy) │
└────────┬────────┬───────────┘
         │        │
    ┌────▼──┐ ┌───▼───┐
    │Worker │ │Worker │  ... (N workers)
    │  A    │ │  B    │
    └────┬──┘ └───┬───┘
         │        │
    ┌────▼────────▼──────┐
    │    Result Merger    │
    └────────────────────┘
```

1. **Orchestrator** — Receives the top-level task, performs task decomposition, and defines the fan-out strategy (how many workers, what each receives).
2. **Worker Agents** — Each receives a scoped subtask with minimal context. They execute independently and have no awareness of sibling workers.
3. **Result Merger** — Aggregates worker outputs into the final result. May be handled by the orchestrator itself or a dedicated merge step.

## Example

In a codebase analysis task:
- The **orchestrator** splits the repo into modules and assigns one module per worker.
- Each **worker** analyses its module independently (no cross-worker communication).
- The **merger** combines per-module reports into a single architectural summary.

> "The supervisor-worker pattern works best when tasks can be decomposed into parallel units. The orchestrator defines the fan-out strategy, workers execute independently, then results merge. Key insight: keep worker context minimal — they should not need to know about each other."
> — *Multi-agent Patterns Q&A, 2026-04-10*

## Trade-offs

| Pro | Con |
|---|---|
| Parallelism reduces latency | Orchestrator is a single point of failure |
| Worker isolation limits error propagation | Result merging adds complexity |
| Easy to scale by adding workers | Poor fit when subtasks are interdependent |
| Minimal worker context reduces token cost | Decomposition quality is critical — bad splits produce bad results |

## Related Patterns

- **Pipeline / Chain** — Sequential variant; use when subtasks must run in order.
- **Map-Reduce** — Closely related; the fan-out/merge structure is essentially map-reduce applied to LLM agents.

## See Also

- [Multi-Agent Systems](../concepts/multi-agent-systems.md)
- [Context Management](../concepts/context-management.md)
- [Agent Loops](../concepts/agent-loops.md)
- [Minimal Worker Context](../concepts/minimal-worker-context.md)
