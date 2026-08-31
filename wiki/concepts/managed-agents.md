---
id: 01M0BQZGE9MW6CGS8KQZ241V2A
title: "Managed Agents"
type: concept
tags: [agents, orchestration, architecture, deployment, infrastructure]
created: 2026-08-19
updated: 2026-08-31
visibility: public
confidence: medium
related: [agent-layer-architecture, agent-loops, agent-memory-runtime, agent-observability]
source: [[summaries/x-twitter-2085780032031760694]]
---

# Managed Agents

## Definition
Managed agents are agent harnesses (e.g. Claude Code, Deep Agents, Pi) that run on managed infrastructure, where builders drive behavior using emerging standards (AGENTS.md, [[mcp]], skills) rather than building runtime infrastructure themselves. The term comes from Harrison Chase's (LangChain) framing of agent building as splitting into three distinct layers:

1. **Business logic** — the context, tools, and instructions a builder supplies (always custom)
2. **The harness** — the agent loop pattern (LLM running in a loop calling tools), e.g. Deep Agents, Claude Code, Pi
3. **The infrastructure** — durable execution, sandboxing, streaming, auth, memory, and eval needed to run the harness reliably in production

> ⚠️ Speculative synthesis: this framing is presented by the source as the author's own thesis, not an industry consensus — flagged as `confidence: medium`.

## Why It Matters
The post argues agent building has moved through distinct eras: early frameworks/apps (LangChain, ChatGPT, AutoGPT — late 2022/2023), more mature control frameworks (LangGraph, Google ADK, Vercel AI SDK — 2024–2025), and then true "agents" once models got good enough to reliably run in a loop calling tools (early-mid 2025). Agent harnesses (Claude Code, Pi, Deep Agents) emerged once that loop was a stable foundation, adding the right tools/environments around it.

Two parallel developments then enabled the managed-agent era:
- **Infrastructure primitives became known**: durable execution to back the agent loop, and sandboxes for untrusted code execution — described as "separating the brain and hands."
- **Standards emerged for driving harnesses**: AGENTS.md (base instructions), [[mcp]] (plugging into external systems), and skills (progressive disclosure of context).

Together, these let harnesses run on managed infrastructure while builders focus purely on business logic — lowering the barrier to shipping production agents.

## Example
A builder using a managed Deep Agents offering supplies tools, instructions, and context (business logic), relies on Deep Agents as the harness (the loop + environment), and the platform handles durable runtime, resumability after failure, event streaming to a UI, sandboxing, auth, memory, and evaluation — the infrastructure layer they'd otherwise have to build themselves.

## See Also
- [[summaries/x-twitter-2085780032031760694]]
- [Agent Layer Architecture](agent-layer-architecture.md)
- [Agent Loops](agent-loops.md)
- [Agent Memory & Runtime](agent-memory-runtime.md)
- [Agent Observability](agent-observability.md)
