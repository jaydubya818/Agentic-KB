---
id: 01KNRCKHSEP775XQ98XGPK6DN1
type: qa
status: active
title: "Q: what is the best pattern for multi agent orchestration"
source: qa
date: 2026-04-09T05:49:25.166Z
created: 2026-04-09
updated: 2026-04-09
question: "what is the best pattern for multi agent orchestration"
sources: ["wiki/summaries/2026-04-08-what-is-the-best-pattern-for-multi-agent-orchestration-in-cl.md", "wiki/concepts/multi-agent-systems.md", "wiki/summaries/summary-multi-agent-patterns-skill.md", "wiki/recipes/recipe-multi-agent-crew.md", "wiki/recipes/recipe-parallel-subagents.md"]
related: ["[[summaries/2026-04-08-what-is-the-best-pattern-for-multi-agent-orchestration-in-cl]]", "[[concepts/multi-agent-systems]]", "[[summaries/summary-multi-agent-patterns-skill]]", "[[recipes/recipe-multi-agent-crew]]", "[[recipes/recipe-parallel-subagents]]"]
tags: ["qa", "user-question"]
verified: false
---
# what is the best pattern for multi agent orchestration

## Question

what is the best pattern for multi agent orchestration

## Answer

# Best Pattern for Multi-Agent Orchestration

Based on the wiki articles, here is a comprehensive answer covering the recommended pattern, implementation details, and key tradeoffs.

---

## The Short Answer

The **Fan-Out Orchestrator-Worker pattern** is the best default pattern for multi-agent orchestration. The single most critical implementation detail: **multiple agent calls issued in a single response turn execute in parallel; separate turns are sequential**.

> "Sub-agents exist primarily to isolate context, not to anthropomorphize role division."
> — [wiki/summaries/summary-multi-agent-patterns-skill.md](wiki/summaries/summary-multi-agent-patterns-skill.md)

---

## The Three Core Patterns

| Pattern | Best For | Risk |
|---|---|---|
| **Fan-Out Orchestrator-Worker** | Independent parallel subtasks | Token cost multiplies rapidly |
| **Pipeline** | Sequential ETL-style stages with clear interfaces | Single slow stage blocks everything |
| **Hierarchical** | Large projects with natural sub-domains | Failure propagation is hard to trace |

([wiki/summaries/2026-04-08-what-is-the-best-pattern-for-multi-agent-orchestration-in-cl.md](wiki/summaries/2026-04-08-what-is-the-best-pattern-for-multi-agent-orchestration-in-cl.md))

---

## Pattern 1: Fan-Out Orchestrator-Worker (Default Choice)

### How It Works

A central orchestrator maintains the high-level plan and dispatches atomic, independent subtasks to stateless workers — all in a **single response turn** to achieve true parallelism.

```
Orchestrator → Worker A (subtask 1) ─┐
             → Worker B (subtask 2) ─┼─ parallel execution
             → Worker C (subtask 3) ─┘
             ← collects all results
             → synthesizes final output
```

### The Parallelism Rule (Critical)

```
# WRONG — sequential, slow:
Turn 1: Agent call #1 → wait → result
Turn 2: Agent call #2 → wait → result
Turn 3: Agent call #3 → wait → result

# RIGHT — parallel, fast:
Turn 1: Agent calls #1, #2, #3 simultaneously → wait → all results
```

Your orchestrator prompt **must explicitly instruct** the agent to make all parallel calls in a single response. ([wiki/recipes/recipe-parallel-subagents.md](wiki/recipes/recipe-parallel-subagents.md))

### Orchestrator Prompt Rules

From [wiki/recipes/recipe-multi-agent-crew.md](wiki/recipes/recipe-multi-agent-crew.md), these rules are essential:

- Explicitly forbid the orchestrator from doing specialist work (`NEVER do X yourself`)
- Require all parallel dispatches in a **single response turn**
- Define explicit error recovery paths
- Workers should be scoped to specific tools (restrict capabilities)

---

## Pattern 2: Pipeline

Best for sequential, dependent stages where the output of stage N feeds stage N+1:

```
Ingester → Analyst → Formatter → Publisher
```

Use this for ETL-style workflows, document processing, or code generation pipelines where each stage has a clean interface. Validate output before passing forward. ([wiki/concepts/multi-agent-systems.md](wiki/concepts/multi-agent-systems.md))

---

## Pattern 3: Hierarchical

For large projects with natural sub-domains:

```
Root Orchestrator
├── Sub-Orchestrator A → Workers 1, 2
└── Sub-Orchestrator B → Workers 3, 4
```

**Risk**: A sub-orchestrator failure can corrupt a whole branch without the root knowing. Failure propagation is significantly harder to trace than in flat fan-out. ([wiki/concepts/multi-agent-systems.md](wiki/concepts/multi-agent-systems.md))

---

## Key Design Principles

### 1. Context Isolation Is the Primary Benefit

The reason to use sub-agents is not to mimic an org chart. It's to give each agent a **clean, focused context window** without the accumulated noise of other subtasks. The "researcher/analyst/writer" framing is a useful mental model, but the underlying value is context hygiene. ([wiki/summaries/summary-multi-agent-patterns-skill.md](wiki/summaries/summary-multi-agent-patterns-skill.md))

### 2. The Telephone Game Problem

Supervisor architectures can perform **50% worse** when supervisors paraphrase sub-agent responses. The fix: use a `forward_message` tool so sub-agents pass results directly without supervisor re-synthesis. This is why swarm architectures with direct user responses can outperform supervisor patterns. ([wiki/summaries/summary-multi-agent-patterns-skill.md](wiki/summaries/summary-multi-agent-patterns-skill.md))

### 3. Token Economics — Budget Carefully

| Architecture | Token Multiplier |
|---|---|
| Single agent chat | 1× baseline |
| Single agent with tools | ~4× baseline |
| Multi-agent system | ~15× baseline |

**Key finding**: Upgrading to a better model often yields larger performance gains than doubling token budget. This points to an aggressive **model tiering strategy**:

- Leaf/worker tasks → Haiku (cheap, fast)
- Orchestration and reasoning → Sonnet
- Complex synthesis → Opus when needed

([wiki/summaries/2026-04-08-what-is-the-best-pattern-for-multi-agent-orchestration-in-cl.md](wiki/summaries/2026-04-08-what-is-the-best-pattern-for-multi-agent-orchestration-in-cl.md))

### 4. Failure Isolation Design

Multi-agent's key advantage over single-agent is **blast radius containment**. Design for it explicitly:

- Workers must be **stateless** (safe to retry without side effects)
- Use **idempotent tools** (retries don't cause double-effects)
- **Log at every agent boundary** — every dispatch and every return
- Wrap each specialist call in error handling with structured error propagation
- Never let one agent failure block synthesis — partial results beat no results

([wiki/concepts/multi-agent-systems.md](wiki/concepts/multi-agent-systems.md), [wiki/recipes/recipe-parallel-subagents.md](wiki/recipes/recipe-parallel-subagents.md))

### 5. Tool Restriction Per Agent

Restricting tools per sub-agent provides three benefits:
- Prevents specialists from going off-script
- Reduces cost (fewer tools = shorter tool list = fewer input tokens)
- Improves focus

```typescript
// Researcher: only web access
Agent call: { tools: ["WebFetch", "WebSearch", "Read", "Glob"] }

// Analyst: pure reasoning, no external calls
Agent call: { tools: [] }
```

([wiki/recipes/recipe-multi-agent-crew.md](wiki/recipes/recipe-multi-agent-crew.md))

---

## Consensus Mechanisms (When Agents Must Agree)

Simple majority voting is naïve — it weights hallucinations from weak models equally to careful reasoning from strong models. Better approaches:

1. **Weighted voting** — weight by confidence or domain expertise
2. **Debate protocols** — require agents to critique each other; adversarial critique often yields higher accuracy than collaborative consensus
3. **Trigger-based intervention** — monitor for stall triggers (no progress) and sycophancy triggers (agents mimicking each other without unique reasoning)

([wiki/summaries/summary-multi-agent-patterns-skill.md](wiki/summaries/summary-multi-agent-patterns-skill.md))

---

## When NOT to Use Multi-Agent

Multi-agent is not always the right answer. Avoid it when:

- The task fits cleanly in one context window
- A well-structured single prompt + tool calls would suffice
- Debugging a multi-agent failure would cost more than the speed gain
- The task has fewer than 3 steps and no natural parallelism

([wiki/summaries/2026-04-08-what-is-the-best-pattern-for-multi-agent-orchestration-in-cl.md](wiki/summaries/2026-04-08-what-is-the-best-pattern-for-multi-agent-orchestration-in-cl.md))

---

## Common Failure Modes and Fixes

| Failure | Cause | Fix |
|---|---|---|
| Orchestrator does specialist work itself | Weak orchestrator prompt | Add explicit `NEVER


## Sources Read

- [[wiki/summaries/2026-04-08-what-is-the-best-pattern-for-multi-agent-orchestration-in-cl]]
- [[wiki/concepts/multi-agent-systems]]
- [[wiki/summaries/summary-multi-agent-patterns-skill]]
- [[wiki/recipes/recipe-multi-agent-crew]]
- [[wiki/recipes/recipe-parallel-subagents]]
