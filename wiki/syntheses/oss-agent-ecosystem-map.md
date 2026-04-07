---
title: "Open-Source Agent Ecosystem Map"
type: synthesis
tags: [agents, orchestration, memory, tools, frameworks, open-source]
created: 2026-04-05
updated: 2026-04-05
visibility: public
confidence: high
source: "19 Open-Source GitHub Repos for AI Agents (LinkedIn post, April 2026)"
related: [concepts/multi-agent-systems.md, concepts/memory-systems.md, concepts/sandboxed-execution.md, concepts/agent-observability.md, evaluations/eval-orchestration-frameworks.md]
---

# Open-Source Agent Ecosystem Map

A curated map of the open-source agentic stack, organized by layer. All listed projects are free/open-source.

---

## Multi-Agent Orchestration

| Project | Description |
|---|---|
| **Camel-AI** ([github](https://github.com/camel-ai/camel)) | Role-playing agents with structured conversations and task delegation. One of the most established multi-agent frameworks. |
| **MetaGPT** ([github](https://github.com/geekan/MetaGPT)) | Multi-agent meta-programming framework assigning specialized roles (PM, Engineer, QA) to LLMs. Well-established and academically grounded. |
| **Atomic Agents** | Modular agent components for composing complex pipelines from small, testable units. |
| **GPTSwarm** | Graph-based multi-agent framework for optimizable agent networks. |
| **Burr** | State-machine-based agent framework for building reliable, inspectable agentic workflows. |

See also: [multi-agent systems](../concepts/multi-agent-systems.md), [orchestration framework evaluations](../evaluations/eval-orchestration-frameworks.md).

---

## Autonomous Builders (Coding Agents)

| Project | Description |
|---|---|
| **SWE-agent** (Princeton) | Autonomous software engineering agent for solving GitHub issues. |
| **OpenHands** | Open-source Devin alternative; autonomous coding and task execution. |
| **Agent-Zero** | Minimal general-purpose autonomous agent. |
| **Devika** | AI software engineer that plans, codes, and executes. |
| **Plandex** | Terminal-based AI coding agent for large, multi-file tasks. |

These agents span the range from minimal/hackable (Agent-Zero) to full software-engineering pipelines (SWE-agent, OpenHands). They typically combine [tool use](../concepts/tool-use.md), [sandboxed execution](../concepts/sandboxed-execution.md), and [task decomposition](../concepts/task-decomposition.md).

---

## Memory & Reasoning

| Project | Description |
|---|---|
| **DSPy** (Stanford) | Framework for programming (not prompting) language models; self-optimizing pipelines. Academically rigorous. |
| **mem0** ([github](https://github.com/mem0ai/mem0)) | Persistent memory layer for AI agents; stores and retrieves cross-session context. |
| **MemGPT / Letta** ([github](https://github.com/cpacker/MemGPT)) | OS-inspired memory management for LLMs; hierarchical memory with self-managed paging. |
| **Storm** (Stanford) | Research synthesis agent for generating Wikipedia-style long-form articles. |

See: [memory systems](../concepts/memory-systems.md), [state persistence](../concepts/state-persistence.md), [eval: memory approaches](../evaluations/eval-memory-approaches.md).

> **Note on Storm**: Its Wikipedia-style synthesis output is conceptually related to the [LLM-wiki pattern](../patterns/pattern-llm-wiki.md).

---

## Tools & Observability

| Project | Description |
|---|---|
| **Skyvern** | Browser automation for agents using LLMs + computer vision; replaces Playwright/Selenium scripts. |
| **E2B** ([github](https://github.com/e2b-dev/E2B)) | Secure code sandboxes for agent-generated code; production-ready execution infrastructure. |
| **AgentOps** | Agent observability and monitoring; session replays, cost tracking, error debugging. |
| **Composio** | Integration platform with 100+ pre-built tool connectors (GitHub, Notion, Salesforce, etc.). |

See: [agent observability](../concepts/agent-observability.md), [sandboxed execution](../concepts/sandboxed-execution.md), [cost optimization](../concepts/cost-optimization.md).

---

## Ecosystem Coverage

Taken together, these projects cover the full agentic stack:

- **Orchestration**: Camel-AI, MetaGPT, GPTSwarm, Atomic Agents, Burr
- **Autonomous execution**: SWE-agent, OpenHands, Devika, Plandex, Agent-Zero
- **Memory management**: mem0, MemGPT/Letta, DSPy
- **Production tooling**: E2B, AgentOps, Composio, Skyvern

The most established projects at time of capture: **Camel-AI**, **MetaGPT** (orchestration); **DSPy** (reasoning/optimization); **E2B**, **AgentOps** (infrastructure).

---

## See Also

- [Multi-Agent Systems](../concepts/multi-agent-systems.md)
- [Memory Systems](../concepts/memory-systems.md)
- [Sandboxed Execution](../concepts/sandboxed-execution.md)
- [Agent Observability](../concepts/agent-observability.md)
- [Eval: Orchestration Frameworks](../evaluations/eval-orchestration-frameworks.md)
- [Eval: Memory Approaches](../evaluations/eval-memory-approaches.md)
