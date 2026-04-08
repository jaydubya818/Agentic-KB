---
id: 01KNNVX2S96ZWYSGCX4471GYPD
title: "Q: What is the best pattern for multi-agent orchestration in Claude Code?"
source: qa
date: 2026-04-08T05:42:58.955Z
question: "What is the best pattern for multi-agent orchestration in Claude Code?"
sources: ["wiki/concepts/multi-agent-systems.md", "wiki/frameworks/framework-claude-code.md", "wiki/summaries/summary-multi-agent-patterns-skill.md", "wiki/recipes/recipe-multi-agent-crew.md", "wiki/evaluations/eval-orchestration-frameworks.md"]
tags: ["qa", "user-question"]
verified: false
---
# What is the best pattern for multi-agent orchestration in Claude Code?

## Question

What is the best pattern for multi-agent orchestration in Claude Code?

## Answer

# Best Pattern for Multi-Agent Orchestration in Claude Code

Based on the wiki articles, the answer is clear: **the Fan-Out Orchestrator-Worker pattern using the `Agent` tool is the best pattern for multi-agent orchestration in Claude Code**, with specific implementation choices depending on your task structure.

---

## The Core Pattern: Fan-Out Orchestrator-Worker

The fundamental model is:

```
Orchestrator (main Claude Code session)
    │
    ├── Agent call → Specialist A (parallel)
    ├── Agent call → Specialist B (parallel)
    └── Agent call → Specialist C (parallel)
                        │
                        └── all return → Orchestrator synthesizes
```

The **critical implementation detail**: multiple `Agent` tool calls made in a **single response turn** execute in parallel. Multiple response turns = sequential execution. This is the most important thing to get right. ([`wiki/frameworks/framework-claude-code.md`])

---

## Why This Pattern Wins in Claude Code

### 1. Context Isolation is the Primary Benefit

> "Sub-agents exist primarily to isolate context, not to anthropomorphize role division."
> — [`wiki/summaries/summary-multi-agent-patterns-skill.md`]

Each sub-agent gets a clean context window focused only on its subtask. The organizational metaphor (researcher, analyst, writer) is secondary. The real win is that each agent isn't burdened by accumulated context from other workstreams.

### 2. Native Parallelism is Uniquely Strong

Claude Code scores a **5/5 on parallelization** — the highest in the framework comparison — specifically because the `Agent` tool makes parallel execution trivially easy. LangGraph, AutoGen, and CrewAI all score lower (3, 2, 2 respectively) because they require explicit topology changes or simply don't support real parallelism. ([`wiki/evaluations/eval-orchestration-frameworks.md`])

### 3. The Agent Tool Primitives Are Production-Grade

The `Agent` tool supports parameters that solve real production problems ([`wiki/frameworks/framework-claude-code.md`]):

| Parameter | Purpose |
|-----------|---------|
| `tools: string[]` | Restrict what a sub-agent can do (e.g., no `Write` for a researcher) |
| `isolation: "worktree"` | Sandboxed git worktree — prevents sub-agents from corrupting main branch |
| `model: string` | Use cheaper models (Haiku) for leaf tasks, stronger models (Sonnet) for orchestration |
| `effort: low\|normal\|high` | Compute budget hint |
| `background: bool` | Non-blocking async execution |

---

## The Three Sub-Patterns

### Pattern 1: Supervisor/Orchestrator (Most Common)

Best for tasks with **clear decomposition and a need for human oversight**.

```
User → Orchestrator → [Researcher, Analyst, Writer] → Synthesized Output
```

**Critical failure mode to avoid — The Telephone Game Problem**: LangGraph benchmarks found supervisor architectures initially performed 50% worse than optimized versions because supervisors paraphrase sub-agent responses incorrectly. The fix is a `forward_message` tool that lets sub-agents pass final responses directly without supervisor re-synthesis. ([`wiki/summaries/summary-multi-agent-patterns-skill.md`])

**Implementation in Claude Code** ([`wiki/recipes/recipe-multi-agent-crew.md`]):
```
You are an orchestrator. ALWAYS:
- Spawn researcher and analyst in PARALLEL (single response turn)
- Wait for BOTH before dispatching writer
- NEVER do the research/analysis/writing yourself
```

### Pattern 2: Pipeline (Sequential Stages)

Best for **ETL-style work, document processing, code generation pipelines** with clear interfaces between stages.

```
Ingester → Analyst → Formatter → Publisher
```

Each agent is a transform function; output is validated before passing forward. ([`wiki/concepts/multi-agent-systems.md`])

### Pattern 3: Hierarchical (Large-Scale Projects)

Three layers: **Strategy → Planning → Execution**. Use when tasks have natural sub-domains where each domain needs its own planning logic.

```
Root Orchestrator
├── Sub-Orchestrator A → Workers 1, 2
└── Sub-Orchestrator B → Workers 3, 4
```

**Warning**: Failure propagation is harder to trace. A sub-orchestrator failure can corrupt a whole branch without the root knowing. ([`wiki/concepts/multi-agent-systems.md`])

---

## Practical Implementation Checklist

### Orchestrator Prompt Rules
- Explicitly forbid the orchestrator from doing specialist work (`NEVER do X yourself`)
- Require all parallel dispatches in a single response turn
- Define explicit error recovery paths (retry with more specific prompt, or pass `"I could not complete X because Y"` to the next stage)

### Sub-Agent Configuration
- **Restrict tools** per specialist — a researcher that can `Write` might create files you didn't ask for; unnecessary tools also add input token cost ([`wiki/recipes/recipe-multi-agent-crew.md`])
- **Use model tiering**: `claude-haiku` for leaf tasks (research, grep, file reads), `claude-sonnet` for orchestration and reasoning ([`wiki/frameworks/framework-claude-code.md`])
- **Use `isolation: worktree`** when sub-agents might make destructive changes (DB migrations, auth refactors)

### Failure Isolation Design
From [`wiki/concepts/multi-agent-systems.md`]:
- Workers should be **stateless** so they can be retried safely
- Use **idempotent tools** so retries don't cause double-effects
- Log at every agent boundary — every dispatch and every return
- Wrap each specialist call in error handling; on failure, either retry or propagate a structured error message

---

## Token Economics to Plan Around

Production data from [`wiki/summaries/summary-multi-agent-patterns-skill.md`]:

| Architecture | Token Multiplier |
|---|---|
| Single agent chat | 1× baseline |
| Single agent with tools | ~4× baseline |
| Multi-agent system | ~15× baseline |

**Key finding**: Upgrading to better models often provides larger performance gains than doubling token budgets. Use model tiering aggressively — don't burn Sonnet tokens on tasks Haiku can handle.

---

## When NOT to Use Multi-Agent

From [`wiki/concepts/multi-agent-systems.md`]:
- Simple tasks that fit in one context window — orchestration overhead isn't worth it
- When a well-structured single prompt + tool calls solves it
- When debugging a multi-agent failure would cost more than the speed gain

The coordination overhead is real: for 3 subtasks taking 2s each, spawning 3 agents with high setup cost can take nearly as long as sequential execution.

---

## Summary Recommendation

| Situation | Pattern |
|---|---|
| Independent parallel subtasks | Fan-out orchestrator-worker (multiple Agent calls, single turn) |
| Sequential dependent stages | Pipeline |
| Large projects with sub-domains | Hierarchical (root → sub-orchestrators → workers) |
| Need risky changes safely | Add `isolation: worktree` to any pattern |
| Need cheap leaf execution | Add `model: claude-haiku` to worker Agent calls |
| Headless/scripted pipeline | Use `bypassPermissions` mode to prevent confirmation prompts blocking async flows |

The fan-out orchestrator-worker pattern is the default choice because it gives you the most parallelism, the cleanest failure isolation, and maps directly to the `Agent` tool's native semantics in Claude Code.


## Sources Read

- [[wiki/concepts/multi-agent-systems]]
- [[wiki/frameworks/framework-claude-code]]
- [[wiki/summaries/summary-multi-agent-patterns-skill]]
- [[wiki/recipes/recipe-multi-agent-crew]]
- [[wiki/evaluations/eval-orchestration-frameworks]]
