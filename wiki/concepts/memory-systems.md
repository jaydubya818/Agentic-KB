---
id: 01KQ2Z2SG6W05MHWXDS4XK79CT
title: "Agent Memory Systems"
type: concept
tags: [memory, agents, architecture, retrieval, knowledge-graphs]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [knowledge-graphs, context-management, multi-agent-systems, agent-loops]
---

# Agent Memory Systems

Memory provides the persistence layer that allows agents to maintain continuity across sessions and reason over accumulated knowledge. Simple agents rely entirely on the context window for memory, losing all state when sessions end. Sophisticated agents implement layered memory architectures that balance immediate context needs with long-term knowledge retention.

## Definition

Agent memory encompasses all mechanisms by which an agent stores and retrieves information beyond a single context window. The spectrum runs from volatile working memory (the context window itself) to durable archival storage (databases, knowledge graphs, files). The evolution from vector stores → knowledge graphs → temporal knowledge graphs represents increasing investment in structured memory for improved retrieval and reasoning quality.

## Why It Matters

Without persistent memory, agents cannot:
- Maintain entity consistency across conversations (a user's name, preferences, history)
- Reason over accumulated knowledge from past sessions
- Build up domain expertise over time
- Support multi-user or multi-agent scenarios with shared state

Benchmark insight: **tool complexity matters less than reliable retrieval**. Letta's filesystem agents scored 74% on LoCoMo using basic file operations, outperforming Mem0's specialised tools at 68.5%. Start simple; add structure (graphs, temporal validity) only when retrieval quality demands it.

## Memory Layers

| Layer | Persistence | Implementation | When to Use |
|-------|-------------|----------------|-------------|
| **Working** | Session only | Context window | Active reasoning, current task state |
| **Core** | Persistent, in-context | Letta core memory, system prompt injection | User profile, key facts that must always be available |
| **Semantic** | Persistent, retrievable | Vector store, embedding search | General knowledge, past conversations |
| **Episodic** | Persistent, structured | Knowledge graph nodes | Event sequences, temporal chains |
| **Archival** | Persistent, bulk | File system, database | Historical records, raw conversation logs |

## Production Framework Landscape

| Framework | Architecture | Best For | Trade-off |
|-----------|-------------|----------|-----------|
| **Mem0** | Vector store + graph memory, pluggable backends | Multi-tenant systems, broad integrations | Less specialised for multi-agent |
| **Zep / Graphiti** | Temporal knowledge graph, bi-temporal model | Enterprise requiring relationship modelling + temporal reasoning | Advanced features cloud-locked |
| **Letta** | Self-editing memory with tiered storage (in-context / core / archival) | Full agent introspection, stateful services | Complexity for simple use cases |
| **LangMem** | Memory tools for LangGraph workflows | Teams already on LangGraph | Tightly coupled to LangGraph |
| **File-system** | Plain files with naming conventions | Simple agents, prototyping | No semantic search, no relationships |

Zep's Graphiti engine builds a three-tier knowledge graph (episode, semantic entity, community subgraphs) with a bi-temporal model tracking both *when events occurred* and *when they were ingested*. Mem0 offers the fastest path to production with managed infrastructure. Letta provides the deepest agent control through its Agent Development Environment.

## Benchmark Performance

| System | DMR Accuracy | LoCoMo | Notes |
|--------|-------------|--------|-------|
| Zep (Temporal KG) | 94.8% | — | 2.58s latency; 18.5% improvement on LongMemEval, 90% latency reduction |
| MemGPT | 93.4% | — | Variable latency |
| GraphRAG | ~75–85% | — | Variable latency |
| Letta (filesystem) | — | 74.0% | Basic file ops only |
| Mem0 | — | 68.5% | Managed infrastructure |
| Vector RAG baseline | ~60–70% | — | Fast, but lower accuracy |

Key benchmarks: **LoCoMo** (long-context conversation memory), **LongMemEval** (long-term memory evaluation), **DMR** (dialogue memory retrieval).

## Example

A customer support agent using Zep:
1. First conversation — user mentions they prefer Python and use AWS. Zep ingests these as entity facts with timestamps.
2. Second conversation (weeks later) — agent retrieves user profile. Graphiti resolves temporal conflicts if preferences changed.
3. Agent answers are personalised without re-prompting the user for context.

## Framework Selection Guide

- **Start here**: File-system or Mem0 for prototypes and single-user agents.
- **Scale to**: Mem0 managed cloud for multi-tenant production.
- **Upgrade to**: Zep/Graphiti when you need temporal reasoning or enterprise relationship modelling.
- **Choose Letta**: When you need full agent introspection and self-editing memory.
- **Choose LangMem**: When your stack is already LangGraph.

## Common Pitfalls

- Over-engineering early: adding graph complexity before basic retrieval is validated
- Ignoring temporal consistency: storing facts without tracking when they were true
- Context stuffing: injecting all memory into context rather than retrieving selectively
- No memory hygiene: accumulated stale or contradictory facts degrade retrieval quality

## See Also

- [Knowledge Graphs](knowledge-graphs.md) — foundational graph structures used by Zep/Graphiti
- [Context Management](context-management.md) — working memory and context window strategies
- [Multi-Agent Systems](multi-agent-systems.md) — shared memory across agent networks
- [Agent Loops](agent-loops.md) — where memory read/write fits in the agent execution cycle
- [Benchmark Design](benchmark-design.md) — how LoCoMo, LongMemEval, and DMR are structured
