---
id: 01KNNVX2QS8GZH58NF0C66W6HD
title: Eval — Orchestration Frameworks Comparison
type: evaluation
tags: [evaluation, orchestration, multi-agent, gsd, langgraph, autogen, crewai, claude-code]
created: 2026-04-04
updated: 2026-04-12
claims:
  - text: "GSD scores highest overall (31/35) for Jay's use case"
    confidence: high
    sources: ["[[summaries/summary-gsd-framework-skills]]"]
    last_verified: 2026-04-04
    contradictions: []
  - text: "Raw Claude Code is second-best (29/35) — no framework overhead, maximum flexibility"
    confidence: high
    sources: []
    last_verified: 2026-04-04
    contradictions: []
  - text: "LangGraph scores 5/5 for state management — best in group"
    confidence: medium
    sources: ["[[summaries/langchain-deepagents-production]]"]
    last_verified: 2026-04-04
    contradictions: ["Based on documentation + community reports, not direct Jay experience. LangGraph v0.2.x — may change."]
  - text: "AutoGen and CrewAI score lowest (17/35 and 18/35) primarily due to Jay's zero familiarity"
    confidence: high
    sources: []
    last_verified: 2026-04-04
    contradictions: ["Scores heavily penalized by Jay's familiarity weight. Objective capability scores may be higher."]
  - text: "Jay's familiarity is weighted 'Very High' — highest weight in the scoring model"
    confidence: high
    sources: []
    last_verified: 2026-04-04
    contradictions: []
---

## What's Being Compared

Five approaches to multi-agent orchestration, evaluated from Jay's perspective as a TypeScript-first agentic AI engineer:

1. **GSD** — Jay's custom framework on [[framework-claude-code]] (v1.28.0)
2. **[[framework-langgraph]]** — Graph-based orchestration from LangChain (Python)
3. **[[framework-autogen]]** — Conversational multi-agent from Microsoft (Python)
4. **[[framework-crewai]]** — Role-based crew orchestration (Python)
5. **Raw [[framework-claude-code]] Agents** — Using [[framework-claude-code]]'s Agent tool directly without a framework

---

## Evaluation Criteria

| Criterion | Definition | Weight |
|-----------|------------|--------|
| **Learning curve** | Time to first working [[multi-agent-systems]] | Medium |
| **Multi-agent support** | Quality of native multi-agent primitives | High |
| **State management** | How well it handles state across agent turns | High |
| **Parallelization** | Native support for parallel agent execution | High |
| **Observability** | Visibility into what agents are doing | Medium |
| **Production-readiness** | Can you ship this to real users? | High |
| **Jay's familiarity** | How well Jay knows it (determines actual productivity) | Very High |

---

## Methodology

Scores (1-5) are based on:
- Direct experience (where Jay has it)
- Documentation quality and community reports (for frameworks Jay hasn't used)
- First-principles analysis of the architecture

Scores are relative to the comparison set, not absolute. A 5 means "best in this group for this criterion", not "perfect".

---

## Scorecard

| Criterion | GSD | [[framework-langgraph]] | [[framework-autogen]] | [[framework-crewai]] | Raw [[framework-claude-code]] |
|-----------|-----|-----------|---------|--------|-----------------|
| Learning curve | 4 | 3 | 3 | 4 | 5 |
| Multi-agent support | 5 | 4 | 3 | 3 | 4 |
| State management | 4 | 5 | 2 | 3 | 3 |
| Parallelization | 5 | 3 | 2 | 2 | 5 |
| Observability | 4 | 5 | 3 | 2 | 3 |
| Production-readiness | 4 | 4 | 3 | 3 | 4 |
| Jay's familiarity | 5 | 2 | 1 | 1 | 5 |
| **TOTAL** | **31** | **26** | **17** | **18** | **29** |

---

## Criterion-by-Criterion Analysis

### Learning Curve

**Raw [[framework-claude-code]] (5)**: Zero setup. Open the CLI, write a prompt, make Agent tool calls. No new framework to learn.

**GSD (4)** and **[[framework-crewai]] (4)**: Both have a clear structure (GSD phases, [[framework-crewai]] roles/tasks) that guides rather than confuses. GSD requires understanding Jay's specific workflow; [[framework-crewai]] requires understanding the crew metaphor.

**[[framework-langgraph]] (3)** and **[[framework-autogen]] (3)**: Both require learning domain-specific abstractions before you can do anything useful. [[framework-langgraph]]'s StateGraph, TypedDict reducers, and conditional edge patterns take 1-2 days to internalize. [[framework-autogen]]'s 0.4.x API is poorly documented (breaking changes from 0.2.x).

### Multi-Agent Support

**GSD (5)**: 18+ specialized agents, all tuned for specific roles. The agent ecosystem is the framework's primary value — not generic "run an LLM", but purpose-built agents like gsd-nyquist-auditor, gsd-assumptions-analyzer.

**[[framework-langgraph]] (4)**: Native supervisor pattern, swarm pattern, subgraph composition. The graph model is the right abstraction for multi-agent coordination. Loses a point for being Python-first (Jay's stack is TypeScript).

**Raw [[framework-claude-code]] (4)**: The Agent tool is a genuine multi-agent primitive with worktree isolation, tool restriction, and parallel execution. Loses a point for requiring all orchestration logic in prompts — no programmatic structure.

**[[framework-crewai]] (3)**: Role/task/crew is intuitive for simple pipelines. Loses points for limited control flow (no cycles, weak conditionals) and no TypeScript.

**[[framework-autogen]] (3)**: GroupChat is flexible but the manager LLM for speaker selection is unreliable. Code execution is strong. No TypeScript.

### State Management

**[[framework-langgraph]] (5)**: TypedDict state with reducers, checkpointing, resume from failure. Nothing else in this group matches this. The checkpoint story alone is worth the learning curve for long-running tasks.

**GSD (4)**: Phase structure provides implicit state; MEMORY.md persists across sessions; hooks enforce state transitions. Not as programmatic as [[framework-langgraph]] but sufficient for most cases.

**[[framework-crewai]] (3)**: Task output chaining is automatic; multi-layer memory (short/long-term). Memory is better than [[framework-langgraph]]'s (no built-in memory in [[framework-langgraph]]), but no checkpointing for resumable state.

**Raw [[framework-claude-code]] (3)**: No built-in state management; state lives in prompts and the messages array. MEMORY.md provides session persistence but is a manual pattern.

**[[framework-autogen]] (2)**: Conversation history is state, but it's untyped and hard to query programmatically. No built-in persistence.

### Parallelization

**GSD (5)** and **Raw [[framework-claude-code]] (5)**: Making multiple Agent tool calls in a single response = genuine parallelism. Wave-based execution in GSD is this pattern at scale. No other framework in this list offers real parallelism this easily.

**[[framework-langgraph]] (3)**: The `Send` API enables parallel node execution but requires explicit graph topology changes. Not as simple as "make N calls in one response."

**[[framework-autogen]] (2)** and **[[framework-crewai]] (2)**: Neither offers native parallel agent execution. [[framework-autogen]]'s GroupChat is sequential turn-taking. [[framework-crewai]]'s parallel process exists but is limited.

### Observability

**[[framework-langgraph]] (5)**: LangSmith integration gives automatic tracing of every node, LLM call, tool use, with timeline visualization. Best observability story in the group.

**GSD (4)**: Jay's Multi-Agent-Observability hooks capture all [[framework-claude-code]] events. Not as visual as LangSmith but complete.

**Raw [[framework-claude-code]] (3)**: Only what your hooks capture. Needs explicit instrumentation.

**[[framework-autogen]] (3)**: Verbose console logging built in; no visual dashboard without custom setup.

**[[framework-crewai]] (2)**: Verbose=True mode gives logs but no structured observability. No production telemetry built in.

### Production-Readiness

**GSD (4)** and **[[framework-langgraph]] (4)**: Both have been used in production systems; both have explicit error handling patterns; both have some form of state management for recovery.

**Raw [[framework-claude-code]] (4)**: [[framework-claude-code]] itself is production-grade. The patterns (worktree isolation, bypassPermissions for headless) are production-ready. Needs more manual instrumentation.

**[[framework-autogen]] (3)** and **[[framework-crewai]] (3)**: Both have been used in production but have documented reliability issues (manager LLM routing, task orchestration failures). More suited for research and internal tools than customer-facing production.

### Jay's Familiarity

**GSD (5)** and **Raw [[framework-claude-code]] (5)**: Extensive daily use. Maximum productivity.

**[[framework-langgraph]] (2)**: Limited — Jay has evaluated it but not shipped with it. Would take 2-5 days to get productive.

**[[framework-autogen]] (1)** and **[[framework-crewai]] (1)**: No direct experience. Starting from zero.

---

## Summary Verdict

**For Jay's stack: GSD first, Raw [[framework-claude-code]] second, [[framework-langgraph]] if Python is required.**

GSD wins overall because it is tuned for Jay's exact workflow and gives both parallelism and a rich specialist agent ecosystem. For tasks that genuinely need it, Raw [[framework-claude-code]] Agents (no framework) is nearly as capable and has zero overhead. These two are not separate choices — GSD is built on [[framework-claude-code]]'s Agent tool.

[[framework-langgraph]] is the strongest framework if Jay moves to Python-native orchestration or if resumable state (checkpoint) becomes a hard requirement. Its observability (LangSmith) and state management are genuinely best-in-class. The learning curve and Python requirement are the primary barriers.

[[framework-autogen]] and [[framework-crewai]] are not recommended for Jay's use cases. [[framework-autogen]]'s strength (code execution loop) is not Jay's primary need; [[framework-crewai]]'s role/task model is a subset of what GSD already provides with more specialization.

**The real question**: if you've already invested heavily in [[framework-claude-code]] + GSD (Jay has), the switching cost to [[framework-langgraph]] is significant. The features you gain (checkpointing, LangSmith) need to be weighed against lost familiarity, Python requirement, and losing the native Agent tool parallelism.

---

## When to Re-evaluate

Re-evaluate this comparison when:
- A major [[framework-langgraph]] version ships with TypeScript parity (current JS version lags Python)
- A production use case emerges that strictly requires resumable state ([[framework-langgraph]] checkpointing)
- Jay evaluates [[framework-autogen]]/[[framework-crewai]] for a project and has direct experience to add
- A new framework emerges with native TypeScript + parallelism + observability (no current candidate)
- [[framework-claude-code]] adds built-in observability that replaces the Multi-Agent-Observability hooks

Target re-evaluation date: Q4 2026 (6 months).

---

## Sources

- [[frameworks/framework-gsd]]
- [[frameworks/framework-langgraph]]
- [[frameworks/framework-autogen]]
- [[frameworks/framework-crewai]]
- [[frameworks/framework-claude-code]]
- [[entities/jay-west-agent-stack]]
- [[entities/langchain-ecosystem]]
