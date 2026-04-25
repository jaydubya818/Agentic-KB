---
id: 01KQ308V70139EX1KTSRA6XJYA
title: Multi-Agent Systems
type: concept
tags: [agents, orchestration, architecture, patterns, workflow]
created: 2026-04-08
updated: 2026-04-09
visibility: public
confidence: high
related: [pattern-supervisor-worker, pattern-fan-out, agent-loops, context-management, agent-failure-modes]
---

# Multi-Agent Systems

## Definition

A multi-agent system is an architecture where multiple LLM-powered agents collaborate — each handling a scoped subtask — coordinated by an orchestrator or via a defined topology. Agents are not anthropomorphized roles; they are **context isolation boundaries**.

> "Sub-agents exist primarily to isolate context, not to anthropomorphize role division."

The goal is to decompose work too large or too parallel for a single agent's context window into manageable, independently executable units.

---

## Why It Matters

Single-agent systems hit three ceilings:

1. **Context limits** — long tasks overflow the context window
2. **Latency** — sequential tool calls are slow for parallelisable work
3. **Reliability** — one agent doing everything increases blast radius of errors

Multi-agent architectures solve all three — at the cost of coordination overhead, token multiplication, and failure propagation complexity.

---

## The Three Core Patterns

| Pattern | Best For | Key Risk |
|---|---|---|
| **Fan-Out Orchestrator-Worker** | Independent parallel subtasks | Token cost multiplies rapidly |
| **Pipeline** | Sequential ETL-style stages with clear interfaces | Single slow stage blocks everything |
| **Hierarchical** | Large projects with natural sub-domains | Failure propagation is hard to trace |

---

## Pattern 1: Fan-Out Orchestrator-Worker (Default Choice)

A central orchestrator maintains the high-level plan and dispatches atomic, independent subtasks to stateless workers — all **in a single response turn** to achieve true parallelism.

```
Orchestrator → Worker A (subtask 1) ─┐
             → Worker B (subtask 2) ─┼─ parallel execution
             → Worker C (subtask 3) ─┘
             ← collects all results
             → synthesizes final output
```

### The Parallelism Rule (Critical)

Multiple agent calls issued **in a single response turn** execute in parallel. Calls across separate turns are sequential.

```
# WRONG — sequential, slow:
Turn 1: Agent call #1 → wait → result
Turn 2: Agent call #2 → wait → result

# RIGHT — parallel, fast:
Turn 1: Agent calls #1, #2, #3 simultaneously → wait → all results
```

Your orchestrator prompt **must explicitly instruct** the agent to dispatch all parallel calls in a single response.

### Orchestrator Prompt Rules

- Explicitly forbid the orchestrator from doing specialist work (`NEVER do X yourself`)
- Require all parallel dispatches in a **single response turn**
- Define explicit error recovery paths
- Scope workers to specific tools (restrict capabilities)

---

## Pattern 2: Pipeline

Best for sequential, dependent stages where the output of stage N feeds stage N+1:

```
Ingester → Analyst → Formatter → Publisher
```

Use for ETL-style workflows, document processing, or code generation pipelines where each stage has a clean interface. Validate output before passing forward.

**Risk**: a single slow or failing stage blocks the entire pipeline. Add validation gates between stages.

---

## Pattern 3: Hierarchical

Use when the problem has natural sub-domains that are themselves complex enough to warrant their own orchestrator:

```
Root Orchestrator
├── Domain Orchestrator A → Workers
└── Domain Orchestrator B → Workers
```

Best for large, long-running projects. Hardest to debug — failures deep in the hierarchy are difficult to trace. Requires robust logging at every level (see [agent observability](agent-observability.md)).

---

## Example

A research assistant agent:
- **Orchestrator**: receives a research question, decomposes into 4 sub-questions
- **Workers A–D**: each searches a different source in parallel (single turn dispatch)
- **Orchestrator**: collects all results, synthesizes a final report

Without the parallel dispatch rule, this takes 4× as long.

---

## Common Pitfalls

- **Sequential dispatch**: issuing agent calls one per turn, losing all parallelism benefit
- **Orchestrator doing specialist work**: undermines the separation of concerns
- **No error recovery paths**: one worker failure cascades
- **Unbounded token cost**: spawning too many workers multiplies context cost rapidly
- **Over-decomposition**: splitting work so finely that coordination overhead exceeds compute savings

---

## See Also

- [Agent Loops](agent-loops.md) — the execution model underlying each agent
- [Context Management](context-management.md) — why context isolation is the primary motivation
- [Agent Failure Modes](agent-failure-modes.md) — what goes wrong and how to detect it
- [Agent Observability](agent-observability.md) — tracing failures in hierarchical systems
- [Human-in-the-Loop](human-in-the-loop.md) — when to add approval gates between stages
