---
id: 01KNNVX2QAPZC7A0FQXF5YM9CE
title: Agent Sandboxing
type: concept
tags: [agentic, safety, tools, execution, infrastructure]
confidence: medium
sources:
  - [[summaries/19-oss-agent-repos-curated]]
created: 2026-04-07
updated: 2026-04-07
related:
  - [[concepts/permission-modes]]
  - [[concepts/guardrails]]
  - [[concepts/agent-failure-modes]]
status: evolving
---

# Agent Sandboxing

## Definition
Agent sandboxing is the practice of executing agent-generated code or tool calls inside isolated, ephemeral environments that cannot affect the host system or external resources without explicit authorization. It is a primary safety mechanism for autonomous coding agents and any agent that executes arbitrary code.

## Why It Matters
Autonomous agents frequently generate and run code as part of task execution. Without sandboxing:
- Malicious or hallucinated code runs with full host permissions.
- Side effects (file deletion, network calls, process spawning) are uncontrollable.
- Costs and blast radius of agent errors are unbounded.

Sandboxing enforces a hard boundary: the agent can do anything inside the sandbox, but the sandbox is disposable and isolated.

## Approaches

### Container-Based Sandboxes
- Spin up a fresh container per agent task or session.
- **E2B** is the canonical OSS example: provides on-demand, secure microVMs for agent code execution with a simple SDK.
- Each sandbox has its own filesystem, network policy, and resource limits.

### Browser Isolation
- For web-browsing agents, each session runs in a sandboxed browser context.
- **Skyvern** uses LLM + computer vision to interact with web UIs without brittle CSS selectors, inside isolated browser instances.

### Permission-Scoped Execution
- Related to [[concepts/permission-modes]]: agents are granted only the permissions needed for a specific task.
- Sandboxes enforce this at the OS/container level rather than relying on prompt-level instructions.

## Key Properties of a Good Sandbox
1. **Ephemeral**: Destroyed after task completion; no persistent state leaks between runs.
2. **Network-controlled**: Outbound calls are logged or blocked by default.
3. **Resource-limited**: CPU, memory, and time caps prevent runaway agents.
4. **Observable**: Execution logs are captured for debugging and audit (pairs with AgentOps-style observability).

## OSS Ecosystem
| Tool | Sandbox Type | Notes |
|------|-------------|-------|
| E2B | microVM / container | SDK for Python/JS; purpose-built for AI agents |
| Skyvern | Browser isolation | LLM + CV browser automation |

## Relationship to Other Concepts
- Complements [[concepts/permission-modes]]: permission modes define *what* an agent may do; sandboxing enforces *where* it can do it.
- Reduces severity of [[concepts/agent-failure-modes]]: even if an agent goes wrong, damage is contained.
- A prerequisite for safe deployment of autonomous coding agents at production scale.
