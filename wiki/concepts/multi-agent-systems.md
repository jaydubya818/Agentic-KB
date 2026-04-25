---
id: 01KQ2Z439J752WAEZVTJD6C97S
title: Multi-Agent Systems
type: concept
tags: [agents, orchestration, architecture, context, patterns]
created: 2024-01-01
updated: 2026-04-25
visibility: public
confidence: high
related: [context-management, agent-failure-modes, agent-loops, cost-optimization]
---

# Multi-Agent Systems

Multi-agent architectures distribute work across multiple language model instances, each with its own context window. When designed well, this distribution enables capabilities beyond single-agent limits. When designed poorly, it introduces coordination overhead that negates benefits.

> **Critical insight**: Sub-agents exist primarily to isolate context, not to anthropomorphize role division.

## Definition

A multi-agent system is a collection of LLM-powered agents that coordinate to accomplish tasks that exceed the capabilities of any single agent. Each agent operates within its own context window, enabling parallel execution, specialization, and separation of concerns.

## Why It Matters

### The Context Bottleneck

Single agents face inherent ceilings in reasoning capability, context management, and tool coordination. As tasks grow more complex, context windows fill with accumulated history, retrieved documents, and tool outputs. Performance degrades via predictable patterns:

- **Lost-in-the-middle effect**: Relevant information buried in long contexts is underweighted
- **Attention scarcity**: Model attention is diluted across too many tokens
- **Context poisoning**: Accumulated errors and irrelevant content degrade downstream reasoning

Multi-agent architectures address these limitations by partitioning work across multiple context windows. Each agent operates in a clean context focused on its subtask. Results aggregate at a coordination layer without any single context bearing the full burden.

### The Parallelization Argument

Many tasks contain parallelizable subtasks that a single agent must execute sequentially. A research task might require searching multiple independent sources, analyzing different documents, or comparing competing approaches. Multi-agent systems assign these to concurrent agents, reducing wall-clock time and preventing context accumulation.

## Core Patterns

Three dominant architectural patterns exist:

| Pattern | Control Style | Best For |
|---|---|---|
| **Supervisor / Orchestrator** | Centralized | Tasks with clear decomposition, auditability requirements |
| **Peer-to-Peer / Swarm** | Distributed handoffs | Flexible routing, emergent collaboration |
| **Hierarchical** | Layered abstraction | Large-scale systems with multiple domains |

See [pattern-supervisor-worker](../patterns/pattern-supervisor-worker.md) for implementation details on the most common pattern.

## Token Economics

Multi-agent systems consume significantly more tokens than single-agent approaches. Production benchmarks show:

| Architecture | Token Multiplier | Use Case |
|---|---|---|
| Single agent chat | 1× baseline | Simple queries |
| Single agent with tools | ~4× baseline | Tool-using tasks |
| Multi-agent system | ~15× baseline | Complex research / coordination |

Research on the BrowseComp evaluation found that **three factors explain 95% of performance variance**:
1. Token usage (~80% of variance)
2. Number of tool calls
3. Model choice

This validates the multi-agent approach: distributing work across agents with separate context windows adds capacity for parallel reasoning.

**Model selection matters more than raw token budgets.** Claude Sonnet 4.5 showed larger performance gains than doubling tokens on earlier Sonnet versions. GPT-5.2's thinking mode similarly outperforms raw token increases. Model selection and multi-agent architecture are complementary strategies — not substitutes.

See [cost-optimization](cost-optimization.md) for strategies to manage token spend in multi-agent systems.

## Design Principles

1. **Isolate context by task boundary**, not by organizational analogy. Don't create an "HR agent" and a "Finance agent" — create agents scoped to information domains.
2. **Explicit coordination protocols**: Agents must have well-defined handoff contracts (inputs, outputs, error signals).
3. **Consensus mechanisms that avoid sycophancy**: Aggregating outputs from multiple agents requires deliberate strategies to surface disagreement rather than average it away.
4. **Failure containment**: Design so that one agent's failure degrades gracefully rather than cascading. See [agent-failure-modes](agent-failure-modes.md).

## When to Use Multi-Agent Architecture

- Single-agent context limits constrain task complexity
- Tasks decompose naturally into parallel subtasks
- Different subtasks require different tool sets or system prompts
- Building systems that must handle multiple domains simultaneously
- Scaling agent capabilities beyond single-context limits

## When NOT to Use It

- Task is simple enough to fit in a single context window
- Coordination overhead would dominate execution time
- Latency requirements are strict (multi-agent adds round-trip overhead)
- Debugging complexity is a primary concern (distributed agents are harder to trace)

## Common Failure Modes

- **Bottlenecks**: Supervisor becomes a throughput constraint
- **Divergence**: Agents operating on stale or inconsistent shared state
- **Error propagation**: Upstream agent mistakes cascade through the pipeline
- **Over-decomposition**: Too many agents for the task complexity; coordination cost exceeds benefit

See [agent-failure-modes](agent-failure-modes.md) for detailed treatment.

## Example

A research synthesis task:
1. **Orchestrator** receives query, decomposes into 4 sub-questions
2. **Search agents** (×4, parallel) each retrieve and summarize one sub-question
3. **Synthesis agent** receives all 4 summaries, writes final report
4. **Critique agent** reviews the report for gaps

No single context window ever holds all retrieved documents simultaneously.

## See Also

- [Context Management](context-management.md)
- [Agent Failure Modes](agent-failure-modes.md)
- [Agent Loops](agent-loops.md)
- [Cost Optimization](cost-optimization.md)
