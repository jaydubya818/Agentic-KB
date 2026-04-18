---
id: 01KNNVX2R9XXY9EZQCPXZAK6D9
title: "Q&A: Best Pattern for Multi-Agent Orchestration in Claude Code"
type: summary
tags: [agentic, multi-agent, orchestration, claude-code, fan-out, parallelism]
source: raw/qa/2026-04-08-what-is-the-best-pattern-for-multi-agent-orchestration-in-cl.md
source_type: qa
created: 2026-04-08
updated: 2026-04-08
related:
  - "[[concepts/multi-agent-systems]]"
  - "[[frameworks/framework-claude-code]]"
  - "[[patterns/pattern-fan-out-worker]]"
  - "[[recipes/recipe-multi-agent-crew]]"
  - "[[evaluations/eval-orchestration-frameworks]]"
confidence: high
status: stable
---

# Q&A: Best Pattern for Multi-Agent Orchestration in [[framework-claude-code]]

## Source
User Q&A synthesized from wiki articles on [[multi-agent-systems]], [[framework-claude-code]] framework, and orchestration evaluation. Not independently verified against external sources.

## Core Answer

The **[[pattern-fan-out-worker]] Orchestrator-Worker pattern using the `Agent` tool** is the best default pattern for multi-agent orchestration in [[framework-claude-code]]. Multiple `Agent` tool calls issued in a **single response turn** execute in parallel; separate turns are sequential — this is the most critical implementation detail.

## The Three Sub-Patterns

| Pattern | Best For |
|---|---|
| [[pattern-fan-out-worker]] Orchestrator-Worker | Independent parallel subtasks — default choice |
| Pipeline | Sequential ETL-style stages with clear interfaces |
| Hierarchical (root → sub-orchestrators → workers) | Large projects with natural sub-domains |

## Key Findings

### Context Isolation is the Primary Benefit
Sub-agents exist primarily to isolate context, not to anthropomorphize roles. The organizational metaphor (researcher/analyst/writer) is secondary to giving each agent a clean, focused context window.

### Native Parallelism Score
[[framework-claude-code]] scores 5/5 on parallelization — highest among compared frameworks. [[framework-langgraph]], [[framework-autogen]], and [[framework-crewai]] score 3, 2, and 2 respectively.

### Agent Tool Parameters That Matter
- `tools: string[]` — restrict sub-agent capabilities
- `isolation: "worktree"` — sandboxed git worktree for destructive operations
- `model: string` — tier models (Haiku for leaf tasks, Sonnet for orchestration)
- `effort: low|normal|high` — compute budget hint
- `background: bool` — non-blocking async execution

### Token Economics
| Architecture | Token Multiplier |
|---|---|
| Single agent chat | 1× baseline |
| Single agent with tools | ~4× baseline |
| [[multi-agent-systems]] | ~15× baseline |

Upgrading to a better model often yields larger gains than doubling token budget. Use model tiering aggressively.

### The Telephone Game Problem
Supervisor architectures can perform 50% worse when supervisors paraphrase sub-agent responses. Fix: use a `forward_message` tool so sub-agents pass results directly without supervisor re-synthesis.

## Orchestrator Prompt Rules
- Explicitly forbid the orchestrator from doing specialist work (`NEVER do X yourself`)
- Require all parallel dispatches in a single response turn
- Define explicit error recovery paths

## Failure Isolation Design
- Workers should be stateless (safe to retry)
- Use idempotent tools (safe on retry)
- Log at every agent boundary
- Wrap each specialist call in error handling with structured error propagation

## When NOT to Use Multi-Agent
- Simple tasks fitting in one context window
- When a well-structured single prompt + tool calls suffices
- When debugging failure would cost more than the speed gain

## Headline Quote
> "Sub-agents exist primarily to isolate context, not to anthropomorphize role division."
