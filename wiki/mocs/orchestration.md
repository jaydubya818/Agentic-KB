---
title: Orchestration MoC
type: moc
tags: [orchestration, multi-agent, agentic, moc]
created: 2026-04-10
updated: 2026-04-10
---

# Orchestration — Map of Content
> Navigation hub for all orchestration-related pages. Update whenever a new orchestration concept, pattern, framework, or recipe is added.

---

## Core Concepts

- [[concepts/multi-agent-systems]] — Coordinating multiple LLM agents; [[pattern-supervisor-worker]], pipeline, [[pattern-fan-out-worker]] topologies
- [[concepts/task-decomposition]] — Breaking complex tasks into agent-executable steps; dependency graphs, atomic subtasks
- [[concepts/agent-loops]] — Looping and iteration patterns in agent execution; ReAct, OODA, [[pattern-plan-execute-verify]]
- [[concepts/human-in-the-loop]] — When and how humans intervene; approval gates, ambiguity resolution
- [[concepts/context-management]] — Managing finite context across orchestration steps; tiered loading, budget allocation
- [[concepts/agent-failure-modes]] — Common orchestration failure modes: Telephone Game, runaway loops, context collapse

---

## Patterns

- [[patterns/pattern-two-step-ingest]] — Split orchestration into analysis + generation calls; 60/20/5/15 budget formula
- [[patterns/pattern-episodic-judgment-log]] — Storing human judgment as first-class orchestration context
- [[patterns/pattern-compounding-loop]] — raw → wiki → query → save loop with compounding knowledge gain

---

## Frameworks

- [[frameworks/framework-gsd]] — Jay's primary orchestration framework; [[pattern-plan-execute-verify]] wave execution
- [[frameworks/framework-claude-code]] — [[framework-claude-code]] agent orchestration; Agent tool, subagents, hooks
- [[frameworks/framework-langgraph]] — [[framework-langgraph]]: stateful graph-based orchestration; Python-first
- [[frameworks/framework-autogen]] — [[framework-autogen]]: Microsoft multi-agent conversation framework
- [[frameworks/framework-crewai]] — [[framework-crewai]]: role-based agent crews with task assignment
- [[frameworks/framework-bmad]] — [[framework-bmad]]: Jay's document-driven multi-agent planning framework
- [[frameworks/framework-rowboat]] — [[framework-rowboat]]: TypeScript, Qdrant-backed, [[mcp-ecosystem]]-native orchestration
- [[frameworks/framework-mcp]] — [[mcp-ecosystem]]: protocol layer for tool exposure across orchestrators

---

## Recipes

- [[recipes/recipe-multi-agent-crew]] — Wire orchestrator + 3 specialist sub-agents end-to-end
- [[recipes/recipe-parallel-subagents]] — [[pattern-fan-out-worker]] pattern: spawn N agents in parallel, handle failures
- [[recipes/recipe-build-tool-agent]] — Build a single Claude agent with custom tools from scratch

---

## Evaluations

- [[evaluations/eval-orchestration-frameworks]] — GSD vs [[framework-langgraph]] vs [[framework-autogen]] vs [[framework-crewai]] vs raw [[framework-claude-code]]

---

## Syntheses

- [[syntheses/oss-agent-ecosystem-map]] — Ecosystem map of 19 OSS agent repos
- [[summaries/2026-04-08-what-is-the-best-pattern-for-multi-agent-orchestration-in-cl]] — [[pattern-fan-out-worker]] Orchestrator-Worker as default; token multiplier; failure modes

---

## Key Summaries

- [[summaries/siagian-agentic-engineer-roadmap-2026]] — ReAct pattern, supervisor design, agent protocol format, multi-agent RAG+report pattern, production safety

## Jay's Perspective

- [[personal/personal-jays-framework-philosophy]] — Three-framework selection system with decision tree
- [[personal/personal-agent-design-observations]] — 10 observed patterns across 32 agent definitions
