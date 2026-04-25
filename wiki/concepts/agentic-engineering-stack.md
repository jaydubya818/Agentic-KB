---
id: 01KQ302S1202BSS03AENRHWDC4
title: "Agentic AI Engineering Stack"
type: concept
tags: [agents, architecture, workflow, orchestration, deployment]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
source: papers/siagian-agentic-engineer-roadmap-2026.md
related: [agent-loops, context-management, memory-systems, multi-agent-systems, agent-failure-modes]
---

# Agentic AI Engineering Stack

A structured overview of the full technical stack required to build, ship, and maintain production-grade agentic AI systems. Based on Lamhot Siagian's 2026 roadmap, the stack is best learned in a deliberate order: **Python → LLM → Framework → Advanced → Memory → Tools → RAG → Agents → Production**.

---

## Definition

The agentic engineering stack is the layered set of skills, abstractions, and infrastructure needed to move from a prototype LLM integration to a reliable, observable, production agentic system. Each layer depends on the one below it; skipping foundations causes failures that are hard to debug at higher layers.

---

## Why It Matters

Most agentic failures in production are not model failures — they are engineering failures: missing retries, untyped tool inputs, unbounded loops, no observability, and entangled prompt/business logic. A stack-aware engineer can isolate problems to the correct layer and apply the right fix.

---

## Layers

### 1. Python Fundamentals
- **Project structure**: `app/ core/ agents/ tools/ rag/ eval/ infra/` — separations of concern so prompts and tools can evolve independently
- **Type hints + Pydantic schemas** throughout; reduces hallucinated tool parameters by validating inputs before the agent executes a tool
- **Async/await** for IO-heavy tool calls; **multiprocessing** for CPU-bound embedding
- **Testing**: deterministic layers (parsers, adapters) get unit tests; LLM steps get golden prompts + snapshot testing
- **Production pitfalls to avoid**: unbounded retries, missing timeouts, global state, mixed prompt/business logic, no observability, unpinned dependencies

### 2. LLM Fundamentals
- **Context budgeting**: token limits force deliberate tradeoffs over what instructions, history, and retrieved docs fit in the window (see [context management](context-management.md))
- **Prompting as interface design**: role, task, constraints, output schema, examples, tool-use policies
- **Temperature discipline**: lower for production JSON/tool calls; higher for brainstorming
- **Function calling**: model outputs a structured tool invocation → system executes → returns result; enables schema validation and sandboxing
- **Prompt injection defense**: treat retrieved text as untrusted; strict system policy; separate tool outputs from system instructions; content provenance tags
- **Hallucination mitigation**: use tools for factual queries, RAG + citations, constrained outputs, abstain rules, verification loops, second-pass critic

### 3. Framework Selection
- **LangGraph**: explicit state machines/graphs, checkpointing, retries, long-running workflows, human-in-the-loop → preferred for production
- **CrewAI**: opinionated role-based multi-agent collaboration
- **AutoGen**: flexible agent-to-agent chat patterns
- **Anti-pattern**: copy-pasting demo code and treating the framework as the architecture — frameworks amplify chaos when fundamentals are skipped
- **Vendor lock-in mitigation**: abstract LLM + embedding behind interfaces; keep prompts/schemas/evals portable; isolate framework in its own layer

### 4. Advanced Framework Concepts
- **State**: structured data flowing through steps (user input, history, retrieved docs, tool results, decisions); typed + minimal; enables reproducibility and observability
- **Router pattern**: Router (decide) → Tool Executor (act) → Verifier (check)
- **Retry/fallback**: classify failures as transient vs persistent → backoff for transient; fallback tool or clarifying question for persistent; model error paths as graph edges
- **Loop prevention**: max steps + time budgets + stop conditions; track repeated tool calls; watchdog forcing escalation; state counters + guard edges (see [agent failure modes](agent-failure-modes.md))
- **Structured output**: machine-validated JSON is the difference between a demo and a reliable system; schema validation gates tool execution
- **Multi-agent threshold**: only decompose to multi-agent when the task genuinely benefits; added coordination complexity is a real cost (see [multi-agent systems](multi-agent-systems.md))

### 5. Migration Path
`notebook` → `package + API` → `typed schemas + error handling + retries` → `evaluation harnesses` → `containerize + monitoring`

---

## Example

An agent that answers customer support questions:
1. **Python layer**: typed Pydantic schemas for every tool input; async HTTP calls to CRM
2. **LLM layer**: system prompt with strict output schema; temperature 0.1; provenance tags on retrieved KB articles
3. **Framework layer**: LangGraph graph with Router → Tool Executor → Verifier nodes; max 8 steps; error edge to repair node
4. **Production layer**: containerized, traced with LangSmith, cost-monitored, evaluated weekly against golden cases

---

## See Also

- [Agent Loops](agent-loops.md)
- [Context Management](context-management.md)
- [Agent Failure Modes](agent-failure-modes.md)
- [Multi-Agent Systems](multi-agent-systems.md)
- [Human-in-the-Loop](human-in-the-loop.md)
- [Agent Observability](agent-observability.md)
