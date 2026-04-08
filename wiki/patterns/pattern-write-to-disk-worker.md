---
id: 01KNNVX2R5F7X97N4HDR0JNATD
title: Write-to-Disk Worker Pattern
type: pattern
tags: [patterns, agents, orchestration, context, memory]
created: 2026-04-07
updated: 2026-04-07
visibility: public
confidence: high
related: [pattern-fan-out-worker, concepts/context-management, concepts/state-persistence, frameworks/framework-gsd]
---

# Write-to-Disk Worker Pattern

## When to Use

Use this pattern when:

- A worker sub-agent produces **large or structured output** (e.g., analysis documents, code files, reports) that would bloat the orchestrator's context window if returned inline
- Multiple downstream agents need to **independently access the same output** at different times
- You want **persistent, inspectable artifacts** that survive beyond a single conversation turn
- Workers operate in **parallel** and their outputs should be aggregated passively rather than collected by the orchestrator

## Structure

```
Orchestrator
  └── spawns Worker(s) with: focus area + output path
        └── Worker explores / processes
        └── Worker writes output directly to disk
        └── Worker returns: short confirmation string only

Downstream Agents
  └── read from disk as needed, on demand
```

The orchestrator never receives the full content of the worker's output — it only receives a confirmation that the write succeeded. Downstream consumers load the file themselves when they need it.

## Example

In the [GSD Framework](../frameworks/framework-gsd.md), the `gsd-codebase-mapper` agent is spawned with a focus area (`tech`, `arch`, `quality`, or `concerns`). It explores the codebase, then writes structured markdown documents directly to `.planning/codebase/`:

```
# Orchestrator spawns four workers in parallel:
gsd-codebase-mapper focus=tech   → writes STACK.md, INTEGRATIONS.md
gsd-codebase-mapper focus=arch   → writes ARCHITECTURE.md, STRUCTURE.md
gsd-codebase-mapper focus=quality → writes CONVENTIONS.md, TESTING.md
gsd-codebase-mapper focus=concerns → writes CONCERNS.md

# Each worker returns only:
"✅ Wrote STACK.md and INTEGRATIONS.md to .planning/codebase/"

# Later, /gsd:execute-phase reads only the docs it needs:
loads CONVENTIONS.md + STRUCTURE.md for a UI phase
```

## Trade-offs

| Benefit | Cost |
|---|---|
| Orchestrator context stays small | Output is not immediately available in-memory |
| Artifacts are persistent and inspectable | File I/O adds latency vs. in-memory return |
| Downstream agents load lazily, on demand | Stale documents can mislead if codebase changes |
| Works well with parallel [[pattern-fan-out-worker]] | Requires a shared filesystem or storage layer |
| Output is human-readable and debuggable | Worker must handle its own write errors |

## Prescriptive Document Design

When workers write documents for consumption by other agents, outputs should be **prescriptive, not merely descriptive**. Future agent instances reading the document need actionable guidance:

- Include exact file paths with backticks: `` `src/services/user.ts` ``
- State conventions imperatively: `"Use camelCase for all function names"` not `"camelCase is sometimes used"`
- Show code examples of HOW patterns are implemented, not just that they exist
- Describe current state only — no historical notes or alternatives considered

This makes the documents behave like **grounded system prompts** for downstream execution agents.

## Related Patterns

- [Fan-Out Worker](../patterns/pattern-fan-out-worker.md) — spawning multiple parallel workers; write-to-disk is a natural complement
- [External Memory](../patterns/pattern-external-memory.md) — broader pattern of persisting agent state outside the context window
- [Context Manager Agent](../patterns/pattern-context-manager-agent.md) — agent that manages what gets loaded into context

## See Also

- [State Persistence](../concepts/state-persistence.md)
- [Context Management](../concepts/context-management.md)
- [GSD Framework](../frameworks/framework-gsd.md)
