---
id: 01KQ2YKKASYWVNDXDXMTN5RWWA
title: Context Management
type: concept
tags: [context, memory, agents, llm, architecture]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [memory-systems, cost-optimization, agent-loops]
---

# Context Management

## Definition

Context management encompasses the strategies and techniques used to make optimal use of a language model's finite context window. Because context windows are bounded, effective management determines what information is present, how it is represented, and when it is refreshed or discarded. The goal is to preserve signal while eliminating noise, extending the *effective* capacity of a context without requiring a larger model or a longer native window.

> "Effective optimization can double or triple effective context capacity without requiring larger models or longer contexts."

## Why It Matters

- **Cost**: Tokens in = tokens billed. Reducing unnecessary content directly lowers inference costs.
- **Latency**: Shorter contexts are processed faster, reducing round-trip times in production systems.
- **Quality**: Cluttered context degrades model reasoning. Compact, high-signal context improves output quality.
- **Scale**: Long-running agents and multi-turn workflows quickly exhaust raw context windows without active management.

## Core Strategies

### 1. Compaction

When a context approaches its limit, compaction summarizes the existing window and reinitialises a fresh context with the summary. This distils conversation history, tool outputs, and retrieved documents into a compact form that preserves essential information.

**Compression priority:**
- Tool outputs → replace with key findings, metrics, conclusions
- Old turns → summarise early conversation, preserve decisions and commitments
- Retrieved documents → summarise if fresh versions are accessible
- **Never compress the system prompt**

Compaction is typically the first lever to reach for when context pressure builds.

### 2. Observation Masking

Tool outputs can account for 80%+ of token usage in agent trajectories. Observation masking replaces verbose tool outputs with compact references once their immediate purpose has been served. The raw data remains retrievable if needed but does not consume context continuously.

**Masking heuristics:**
- **Never mask**: outputs critical to the current task, outputs from the most recent turn, outputs actively used in reasoning
- **Consider masking**: outputs from 3+ turns ago, verbose outputs whose key points can be extracted
- **Always mask**: repeated outputs, boilerplate headers/footers, outputs already summarised elsewhere

### 3. KV-Cache Optimization

The KV-cache stores Key and Value tensors computed during a forward pass so they can be reused across subsequent calls. Structuring prompts to place stable content (system prompt, persistent instructions) at the front maximises cache hits and reduces both latency and compute cost.

Key practices:
- Keep the system prompt stable and at the top of the context
- Append new turns rather than reconstructing the full prompt
- Avoid unnecessary shuffling of context blocks between calls

### 4. Context Partitioning

For complex tasks, splitting work across isolated context windows (sub-agents or parallel calls) prevents any single context from becoming overloaded. Each partition focuses on a narrow slice of the problem, and results are aggregated by an orchestrator.

This is especially effective for:
- Document-level analysis where each document is processed independently
- Parallel tool calls that do not require shared state
- Long-running agent pipelines with distinct phases

## Example

An agent processing a 200-page document corpus:
1. **Partition**: route each document to a sub-agent with its own context
2. **Summarise**: each sub-agent returns a compact findings summary
3. **Mask**: after the orchestrator has incorporated a sub-agent's findings, mask the full output and retain only the summary reference
4. **Compact**: if the orchestrator's own context fills up, run compaction before continuing

## When to Apply

| Signal | Recommended Technique |
|---|---|
| Context nearing limit mid-task | Compaction |
| High token costs from tool outputs | Observation masking |
| Repeated prompt prefixes across calls | KV-cache optimisation |
| Task too large for one context | Context partitioning |

## Common Pitfalls

- **Over-compressing too early**: losing detail before it has been used
- **Masking active observations**: masking outputs still needed for ongoing reasoning
- **Unstable system prompts**: minor edits invalidate the KV-cache, negating its benefits
- **Ignoring the system prompt**: it is always worth compressing other content before touching the system prompt

## See Also

- [Memory Systems](memory-systems.md) — longer-term persistence beyond the context window
- [Cost Optimization](cost-optimization.md) — broader cost reduction strategies including batching and model selection
- [Agent Loops](agent-loops.md) — how context management integrates with the agent execution loop
- [Multi-Agent Systems](multi-agent-systems.md) — context partitioning via sub-agent delegation
