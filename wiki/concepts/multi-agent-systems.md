---
id: 01KNNVX2QG3PQTXKP36Y47BWBF
title: Multi-Agent Systems
type: concept
tags: [agentic, orchestration, multi-agent, topology, architecture]
confidence: high
sources:
  - "Anthropic: Building Effective Agents (2024)"
  - "OpenAI: Practices for Governing Agentic AI Systems (2025)"
  - "LangGraph documentation"
created: 2026-04-04
updated: 2026-04-04
related:
  - "[[concepts/agent-loops]]"
  - "[[concepts/task-decomposition]]"
  - "[[concepts/human-in-the-loop]]"
  - "[[patterns/pattern-fan-out-worker]]"
  - "[[patterns/pattern-supervisor-worker]]"
  - "[[patterns/pattern-pipeline]]"
status: stable
---

## TL;DR

Multi-agent systems distribute work across multiple LLM instances that each own a focused context. The topology you choose — orchestrator-worker, peer-to-peer, hierarchical, or pipeline — determines your failure modes, parallelism ceiling, and debug complexity. Pick topology based on task structure, not preference.

---

## Definition

A multi-agent system is a networked collection of LLM-backed agents where each agent has its own context window, tool set, and role. Agents coordinate to complete tasks that exceed what a single agent context can handle efficiently, either due to length, specialization, or parallelism requirements.

---

## How It Works

### Communication Channels

Agents exchange information through one of three mechanisms:

**Shared State** — A single mutable artifact (file, database row, in-memory dict) that all agents read from and write to. Simple but requires coordination to prevent race conditions. Best for sequential pipelines.

**Message Passing** — Agents send structured messages to each other via a queue or direct call. Decouples agents temporally. Each agent processes its inbox and emits to an outbox. More complex but enables async execution.

**Tool Calls** — One agent invokes another as a tool. The callee runs, returns output, and the caller continues. This is the Claude Code native model — the Agent tool is literally one agent calling another. Clean separation, synchronous by default.

### Topologies

**Orchestrator-Worker**
The most common pattern. A single orchestrator maintains the high-level plan and delegates atomic subtasks to worker agents. Workers are stateless across tasks; orchestrator owns all state.

```
Orchestrator → Worker A (subtask 1)
             → Worker B (subtask 2)
             → Worker C (subtask 3)
             ← collects results → synthesizes
```

Use when: tasks decompose cleanly into independent units, you need a clear chain of custody, debugging must trace back to one decision point.

**Peer-to-Peer**
Agents communicate directly without a central coordinator. Any agent can initiate contact with any other. Requires a shared addressing scheme and usually a shared message bus.

Use when: agents have complementary capabilities that need to negotiate (e.g., planner debates with critic), no single agent has enough context to orchestrate.

Avoid when: you need deterministic task ordering or clear audit trails.

**Hierarchical**
Multi-level orchestration. A root orchestrator delegates to sub-orchestrators, which themselves delegate to workers. Mirrors organizational structures.

```
Root Orchestrator
├── Sub-Orchestrator A → Workers 1, 2
└── Sub-Orchestrator B → Workers 3, 4
```

Use when: tasks have natural sub-domains, each domain needs its own planning logic, single orchestrator would get too complex.

Risk: failure propagation is harder to trace. A sub-orchestrator failure can corrupt a whole branch without the root knowing.

**Pipeline**
Linear chain where output of stage N is input to stage N+1. Each agent is a transform function. Output is validated before passing forward.

```
Ingester → Analyst → Formatter → Publisher
```

Use when: task has sequential, dependent stages with clear interfaces between them. Strong fit for ETL-style work, document processing, code generation pipelines.

---

## Key Variants

- **Swarm** — Large number of homogeneous workers with lightweight coordination. No persistent orchestrator; agents hand off work peer-to-peer via shared state. Useful for embarrassingly parallel workloads.
- **Debate** — Two agents argue opposing positions; a judge agent picks the winner or synthesizes. Forces adversarial coverage.
- **Mixture of Experts** — A routing agent selects the specialized agent best suited for each input, similar to ML MoE architecture.

---

## Emergent Coordination

In peer-to-peer and swarm topologies, coordination behaviors can emerge from local rules without central direction. Agents following simple heuristics (claim a task, mark it done, pick the next unclaimed task) can collectively complete complex workflows. The risk is emergent failure modes that aren't visible until they happen at scale.

---

## Failure Isolation

The key advantage of multi-agent over single-agent: **blast radius containment**. When a worker fails, the orchestrator can catch the error, retry with a different worker, or escalate without losing the entire task context. Design for this explicitly:

- Workers should be stateless so they can be retried safely.
- Orchestrators should have explicit error handling for each worker call.
- Use idempotent tools so retries don't cause double-effects.
- Log at agent boundaries — every dispatch and every return.

---

## When To Use

- Task exceeds one model's context window even with aggressive compression
- Task has parallel subtasks that can run simultaneously
- Subtasks require genuinely different capabilities or system prompts
- You need fault isolation — a subtask failure shouldn't kill everything
- You want independent auditability of subtask outputs

## When NOT To Use

- Simple 3-step task that fits in one context — the orchestration overhead isn't worth it
- When you can solve it with a well-structured single prompt + tool calls
- When debugging a multi-agent failure would cost more than the speed gain

---

## Risks & Pitfalls

- **Context corruption across agents**: If agents share mutable state without locking, one agent can overwrite another's work.
- **Cascading failures**: Orchestrator blindly trusts worker output, worker hallucinated, orchestrator acts on bad data.
- **Coordination overhead**: For 3 subtasks taking 2s each, spawning 3 agents takes nearly as long as running them sequentially if setup cost is high.
- **Silent failures**: Worker returns a result that looks valid but is wrong. Orchestrator has no way to verify. Requires verification agents.
- **Prompt injection via tool output**: One agent's output becomes another agent's input — a hostile string in that output can hijack the downstream agent.

---

## Related Concepts

- [[concepts/task-decomposition]] — how to break tasks before distributing them
- [[concepts/agent-loops]] — what happens inside each agent
- [[concepts/human-in-the-loop]] — when to insert humans into multi-agent flows
- [[concepts/observability]] — tracing requests across agent boundaries
- [[concepts/guardrails]] — preventing cascading failures

---

## Sources

- Anthropic "Building Effective Agents" (Dec 2024)
- LangGraph multi-agent architecture docs
- OpenAI "Practices for Governing Agentic AI Systems" (2025)
