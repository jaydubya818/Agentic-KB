---
id: 01M0D2HJ04RY1PN0C8JKS9XSJG
title: "Managed Deep Agents (LangChain)"
type: framework
tags: [frameworks, agents, deployment, orchestration, mcp]
created: 2026-08-19
updated: 2026-08-31
visibility: public
confidence: high
source: [[summaries/docs-langchain-com-langsmith-python-managed-deep-agents-overview]]
related: [deep-agents-harness, agent-loops, agent-layer-architecture]
---

# Managed Deep Agents (LangChain)

## What It Does
Managed Deep Agents (MDA) is a LangChain product that lets developers build production agents as a plain directory of files — model config, instructions, skills, tools, middleware, and MCP connectors — while LangSmith's Agent Server runs the harness, runtime, and infrastructure. The pitch is explicit division of labor:

> "You focus on what your agent does. MDA runs it. There are no servers to run and no infrastructure to wire together."

Developers write the agent's intelligence; MDA supplies the [Deep Agents harness](deep-agents-harness.md) (the agent loop — planning, tool calls, filesystem, subagent delegation) plus a managed runtime (LangSmith Deployment's Agent Server) that hosts the agent and keeps sessions alive across restarts.

## Key Concepts
- **Project-as-agent**: an agent is defined declaratively as a folder, not a running service.
  - `agent.py` — defines the agent via `define_deep_agent()`: name, model, tools, middleware.
  - `instructions.md` — the system prompt / persona.
  - `skills/<name>/SKILL.md` — named, reusable procedures with YAML frontmatter (`name`, `description`) and numbered steps, invoked by the agent when relevant (a form of structured prompting/procedural memory).
  - `tools/*.py` — plain `@tool`-decorated Python functions.
  - `middleware/*.py` — hooks like `wrap_tool_call` for cross-cutting concerns (e.g., audit logging around every tool call).
  - `connectors/mcp.py` — declares MCP servers to attach (transport, url, allowed tools) via `managed_deepagents.connectors.mcp`.
- **Deployment model**: the whole folder is uploaded via the `mda` CLI and runs automatically on managed LangSmith infrastructure — no manual server/infra wiring.
- **Separation of concerns**: business logic (what the agent does) vs. harness + runtime (how it runs), mirrors the split described in [agent-layer-architecture](../concepts/agent-layer-architecture.md).

## When to Use It
- Teams that want to ship production LangChain/LangGraph-style agents without owning deployment, session persistence, or restart handling.
- Agents that need filesystem-based planning, subagent delegation, and MCP tool integration out of the box.
- Projects already in the LangSmith/LangChain ecosystem that want a fast path from local agent definition to hosted, restart-resilient runtime.

## Refinery Notes (2026-08-31)
[[summaries/x-twitter-2085780032031760694]] adds Harrison Chase's founder-level thesis for why Managed Deep Agents exists: builders should bring business logic, while managed products bundle the harness plus infrastructure. That source also positions MDA alongside Fleet, Claude Managed Agents, and Vercel Eve, and names LangSmith Deployments, Agent Server/Channels, Sandboxes, Context Hub, Harbor evals, memory, and AuthN as the managed infrastructure layer.

## Limitations
- Tied to LangSmith's managed infrastructure — less control than self-hosting the harness.
- Documentation excerpt is introductory; deeper operational details (scaling limits, pricing, sandboxing specifics) are not covered in this source and should be verified against the full docs before relying on them.
- No information in this source on how skills are selected/ranked at runtime, or how subagent delegation is scoped — flagged as open questions for a future source.

## See Also
- [[summaries/x-twitter-2085780032031760694]]
- [[summaries/docs-langchain-com-langsmith-python-managed-deep-agents-overview]]
- [Deep Agents Harness](../concepts/deep-agents-harness.md)
- [Agent Loops](../concepts/agent-loops.md)
- [Agent Layer Architecture](../concepts/agent-layer-architecture.md)
