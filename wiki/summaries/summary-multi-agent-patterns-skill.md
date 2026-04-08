---
id: 01KNNVX2REJX9ZCQAZ4PXG6W7Q
title: Multi-Agent Patterns Skill
type: summary
source_file: raw/my-skills/multi-agent-patterns-skill.md
author: Jay West
date_ingested: 2026-04-04
tags: [agentic, claude-code, skill, multi-agent, orchestration, context-isolation, patterns]
key_concepts: [supervisor-worker, peer-to-peer-swarm, hierarchical, context-isolation, telephone-game-problem, consensus-mechanisms, token-economics, forward-message-tool]
confidence: high
---

# Multi-Agent Patterns Skill

## Key Purpose

Guides implementation of multi-agent architectures. Covers when to use each pattern, failure modes, and production evidence. Activate when: single-agent context limits constrain the task, tasks decompose naturally into parallel subtasks, or different subtasks need different tool sets.

## Core Insight

"Sub-agents exist primarily to isolate context, not to anthropomorphize role division."

The primary benefit of multi-agent architecture is **context isolation** — each agent operates in a clean window focused on its subtask, without carrying accumulated context from other subtasks. The organizational metaphor (researcher, analyst, writer) is secondary.

## Three Architectural Patterns

### Pattern 1: Supervisor/Orchestrator

```
User → Supervisor → [Specialist A, B, C] → Aggregation → Output
```

Central agent maintains global state, routes to specialists, synthesizes results.

**Use when:** Complex tasks with clear decomposition, human oversight required.

**Critical failure mode: The Telephone Game Problem**

[[framework-langgraph]] benchmarks found supervisor architectures initially performed 50% worse than optimized versions because supervisors paraphrase sub-agent responses incorrectly, losing fidelity. The fix: a `forward_message` tool that allows sub-agents to pass responses directly to the user without supervisor synthesis when the response is final and complete.

### Pattern 2: Peer-to-Peer/Swarm

Agents communicate directly via explicit handoff mechanisms. Any agent can transfer control to any other. Control passes via function return rather than central routing.

**Use when:** Flexible exploration, emergent requirements, rigid planning counterproductive.

**Note:** With the `forward_message` fix, swarm architectures slightly outperform supervisors because sub-agents respond directly to users, eliminating translation errors.

### Pattern 3: Hierarchical

Three layers: Strategy (goal definition) → Planning (task decomposition) → Execution (atomic tasks).

**Use when:** Large-scale projects with clear hierarchy, enterprise workflows, tasks requiring both high-level planning and detailed execution.

## Token Economics

Production data on token multipliers:

| Architecture | Token Multiplier | Use Case |
|--------------|-----------------|----------|
| Single agent chat | 1× baseline | Simple queries |
| Single agent with tools | ~4× baseline | Tool-using tasks |
| [[multi-agent-systems]] | ~15× baseline | Complex research |

BrowseComp evaluation: three factors explain 95% of performance variance — token usage (80%), number of tool calls, model choice. This validates distributing work across agents for parallel reasoning.

**Key finding:** Upgrading to better models often provides larger performance gains than doubling token budgets. Model selection and multi-agent architecture are complementary strategies.

## Context Isolation Mechanisms

Three mechanisms with different trade-offs:

| Mechanism | When | Trade-off |
|-----------|------|-----------|
| Full context delegation | Complex subtask needing complete understanding | Defeats the purpose of sub-agents |
| Instruction passing | Simple, well-defined subtask | Maintains isolation but limits flexibility |
| File system memory | Shared state across agents | Enables sharing without context bloat, but adds latency |

## Consensus Mechanisms

Simple majority voting treats hallucinations from weak models equally to reasoning from strong models. Three better approaches:
1. **Weighted voting** — weight by confidence or domain expertise
2. **Debate protocols** — require agents to critique each other; adversarial critique often yields higher accuracy than collaborative consensus
3. **Trigger-based intervention** — monitor for stall triggers (no progress) and sycophancy triggers (agents mimicking each other without unique reasoning)

## Failure Modes and Mitigations

| Failure | Mitigation |
|---------|-----------|
| Supervisor bottleneck (context saturation) | Output schema constraints; checkpointing |
| Coordination overhead negate parallelization | Batch results; minimize communication; async patterns |
| Agent divergence from shared goal | TTL limits; convergence checks |
| Error propagation between agents | Validate outputs before passing; circuit breakers; idempotent operations |

## Related Concepts

- [[wiki/summaries/summary-memory-systems-skill]] (shared state across agents)
- [[wiki/summaries/summary-graphify-skill]] (parallel subagent extraction)
- [[wiki/summaries/summary-gsd-framework-skills]] (GSD uses supervisor pattern)

## Sources

- `raw/my-skills/multi-agent-patterns-skill.md`
