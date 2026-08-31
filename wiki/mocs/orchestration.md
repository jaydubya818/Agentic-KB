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
- [[concepts/bdi-architecture]] — Belief–Desire–Intention agent model

---

## Patterns

- [[patterns/pattern-two-step-ingest]] — Split orchestration into analysis + generation calls; 60/20/5/15 budget formula
- [[patterns/pattern-episodic-judgment-log]] — Storing human judgment as first-class orchestration context
- [[patterns/pattern-compounding-loop]] — raw → wiki → query → save loop with compounding knowledge gain
- [[patterns/pattern-goal-backward-planning]] — Plan backward from verifiable goal state
- [[patterns/pattern-hosted-agent-infrastructure]] — Hosted agent infra: long-running runtime, queues, observability
- [[patterns/pattern-staged-llm-pipeline]] — Multi-stage LLM pipeline with explicit handoffs
- [[patterns/pattern-agent-proof-of-work-loop]] — Verification + receipts + exception review loop for agent work before completion claims
- [[patterns/pattern-navigator-driver-agentic-coding]] — Human/orchestrator as navigator; agents as artifact-producing drivers
- [[patterns/pattern-agent-as-ui-system-of-record-backend]] — Agent as cross-system UI while GitHub/tasks/docs/vaults remain authoritative backends
- [[patterns/pattern-outcome-metrics-for-agent-adoption]] — Separate adoption telemetry from artifact, quality, flow, and business outcome movement

> **Scope note — "graduation" is an org-layer idea, not a runtime-layer one.** (Logged 2026-08-16 as contradiction (D); resolved here rather than by editing either page.)
>
> [[patterns/pattern-embedded-graduation-model]] argues that central expertise should dissolve itself: experts embed with a team, build capability, then graduate the team to independence. [[patterns/pattern-supervisor-worker]] and [[patterns/pattern-plan-execute-verify]] assume the opposite — a supervisor/planner/verifier that is a permanent architectural fixture.
>
> These do not conflict, because they govern different layers. Graduation applies to **humans depending on a central platform team**; the supervisor applies to **a running system's control flow**. A team can graduate to full independence and still run a supervisor-worker topology forever — the supervisor is part of the thing they now own, not the dependency they were freed from.
>
> The reading to avoid: extending "graduate to independence" into "remove the orchestrator agent." Dissolving a supervisor because the team matured is a category error — it removes runtime error-handling and retry semantics to solve an organizational problem that was never runtime-shaped.

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
- [[concepts/gstack]] — Jay's GSD agent stack: workers, leads, orchestrators

---

## Recipes

- [[recipes/recipe-multi-agent-crew]] — Wire orchestrator + 3 specialist sub-agents end-to-end
- [[recipes/recipe-parallel-subagents]] — [[pattern-fan-out-worker]] pattern: spawn N agents in parallel, handle failures
- [[recipes/recipe-build-tool-agent]] — Build a single Claude agent with custom tools from scratch

---

## Evaluations

- [[evaluations/eval-orchestration-frameworks]] — GSD vs [[framework-langgraph]] vs [[framework-autogen]] vs [[framework-crewai]] vs raw [[framework-claude-code]]

---

## Harness Layer

- [[concepts/meta-harness]] — A harness that builds or configures other harnesses
- [[concepts/self-improving-harness]] — A harness that edits its own scaffolding from its own run history
- [[frameworks/super-simple-software-factory]] — Disler's minimal software-factory harness
- [[patterns/pattern-code-owns-control-plane]] — Keep orchestration in code; let the model own judgement, not control flow
- [[frameworks/blume-codes]] — macOS sidecar that observes Claude Code / Cursor / Codex side by side and proposes rule, skill and hook changes from observed friction

---

## Syntheses

- [[syntheses/harness-vs-meta-harness-vs-self-improving-harness]] — Distinguishes the three layers and what each buys you
- [[syntheses/oss-agent-ecosystem-map]] — Ecosystem map of 19 OSS agent repos
- [[syntheses/synthesis-agentic-engineering-operating-model]] — Operating model for one visible orchestrator, backend agent lanes, artifact-native completion, system-of-record backends, and outcome metrics
- [[summaries/2026-04-08-what-is-the-best-pattern-for-multi-agent-orchestration-in-cl]] — [[pattern-fan-out-worker]] Orchestrator-Worker as default; token multiplier; failure modes
- [[syntheses/synthesis-telephone-game-per-claim-confidence]] — Reframes the Telephone Game Problem as synthesis-layer fidelity loss and proposes borrowing the memory stack's per-claim confidence machinery to detect it, not just bypass it
- [[syntheses/synthesis-harness-self-improvement-as-memory-promotion]] — Maps the [[concepts/self-improving-harness|self-improving harness]] loop onto the Memory MoC's promotion and freshness policies; identifies contradiction blocking, audit trail, and decay as the three gates harness self-improvement is missing
- [[syntheses/synthesis-worker-tool-scope-ownership]] — Argues the worker's tool set is owned by the permission layer, not the orchestration topology; bridges [[patterns/pattern-supervisor-worker]] to [[mocs/tool-use|Tool Use]] and flags that the "workers have restricted sets" rule lives only in [[wiki/hot]]

---

## Key Summaries

- [[summaries/siagian-agentic-engineer-roadmap-2026]] — ReAct pattern, supervisor design, agent protocol format, multi-agent RAG+report pattern, production safety

## Jay's Perspective

- [[personal/personal-jays-framework-philosophy]] — Three-framework selection system with decision tree
- [[personal/personal-agent-design-observations]] — 10 observed patterns across 32 agent definitions
