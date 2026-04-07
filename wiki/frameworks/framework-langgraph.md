---
title: LangGraph
type: framework
tags: [langchain, orchestration, agents, workflow, deployment, memory]
created: 2026-01-01
updated: 2026-04-05
visibility: public
confidence: high
related: [framework-crewai.md, framework-autogen.md, concepts/state-persistence.md, concepts/multi-tenancy-agents.md]
source: https://docs.langchain.com/oss/python/deepagents/going-to-production
---

# LangGraph

LangGraph is LangChain's graph-based agent orchestration framework. It models agent execution as a stateful directed graph, enabling complex multi-step, multi-agent workflows with built-in durability and checkpointing.

## What It Does

- Defines agent workflows as nodes and edges in a directed graph
- Checkpoints state at every step, enabling resumable and rewindable runs
- Supports multi-agent coordination, tool use, and human-in-the-loop interrupts
- Integrates natively with LangSmith for production deployment and observability

## Key Concepts

### Core Primitives (Production)

| Primitive | Description |
|---|---|
| **Thread** | A single conversation with scoped message history and scratch files |
| **User** | Individual interacting with the agent; memory can be private or shared |
| **Assistant** | Configured agent instance with tied or shared memory and files |

### Durability

LangGraph checkpoints at every step. Interrupted runs resume from the last recorded state without reprocessing. This enables:
- Indefinite interrupts and human-in-the-loop pauses
- Time travel / rewinding to earlier states
- Safe handling of sensitive or destructive operations

### Memory Scoping

| Scope | Use Case |
|---|---|
| User | Per-user preferences (recommended default) |
| Assistant | Shared instructions for one assistant |
| Global | Read-only organization policies |

Memory uses file-based storage routed to a `StoreBackend`. A `CompositeBackend` provides both ephemeral scratch space and persistent long-term memory.

> ⚠️ **Security**: Shared memory is a prompt injection vector. Enforce read-only access where appropriate.

### Execution / Sandbox Backends

- **StateBackend** — ephemeral, conversation-scoped
- **StoreBackend** — persistent across conversations
- **CompositeBackend** — mixed persistent + ephemeral routing
- **Thread-scoped sandbox** — fresh isolated container per conversation, cleaned up on TTL expiry
- **Assistant-scoped sandbox** — conversations share one sandbox; cloned repos and dependencies persist

Secrets are injected via a sandbox auth proxy rather than being held directly in sandbox code.

## Production Deployment (LangSmith)

LangSmith Deployments is the recommended production path. It automatically provisions assistants, threads, runs, storage, checkpointing, auth, webhooks, cron jobs, and observability.

Configuration via `langgraph.json`:

```json
{
  "dependencies": ["."],
  "graphs": { "agent": "./agent.py:agent" },
  "env": ".env"
}
```

## Multi-Tenancy

Three requirements for user identity: verification, access control, and credential management.

- **Authorization handlers** tag resources with ownership metadata, filter user-specific access, or deny with HTTP 403
- **Agent Auth** manages OAuth 2.0 flows — agents interrupt, present consent URLs, then resume with auto-refreshing tokens
- **Sandbox auth proxy** injects credentials into outbound requests so sandbox code never holds raw API keys

See also: [Multi-Tenancy Agents](../concepts/multi-tenancy-agents.md)

## Guardrails & Middleware

### Rate Limiting

```python
ModelCallLimitMiddleware(run_limit=50)
ToolCallLimitMiddleware(run_limit=200)
```

Use `run_limit` for per-invocation caps, `thread_limit` for conversation-wide caps.

### Error Handling

- Transient failures: automatic retry with exponential backoff
- Model-recoverable errors: feed back to the LLM
- Human-input errors: pause execution
- Fallback middleware: switches to an alternative model if the primary provider fails

### Data Privacy

```python
PIIMiddleware("email", strategy="redact", apply_to_input=True)
```

Strategies: `redact`, `mask`, `hash`, or `block`.

## Frontend Integration

The `useStream` hook connects React (and Vue, Svelte, Angular) UIs to agents:

```tsx
const stream = useStream({
  apiUrl: "https://your-deployment.langsmith.dev",
  assistantId: "agent",
  reconnectOnMount: true,   // resumes in-progress runs after page refresh
  fetchStateHistory: true   // loads full history for returning users
});
```

## When to Use It

- You need stateful, multi-step agent workflows with durability guarantees
- Your agent requires human-in-the-loop interrupts or approval steps
- You want time-travel debugging or the ability to rewind agent state
- You are deploying to production with multi-tenancy, auth, and observability requirements
- You are already in the LangChain ecosystem

## Limitations

- Graph-based model adds conceptual overhead vs. simpler linear frameworks
- Tight coupling with LangSmith for production features (observability, deployment)
- Shared memory scope is a prompt injection risk requiring explicit access controls
- Async discipline required throughout — I/O-bound LLM calls demand native async tools

## See Also

- [LangChain Ecosystem](../entities/langchain-ecosystem.md)
- [State Persistence](../concepts/state-persistence.md)
- [Multi-Tenancy Agents](../concepts/multi-tenancy-agents.md)
- [Sandboxed Execution](../concepts/sandboxed-execution.md)
- [Guardrails](../concepts/guardrails.md)
- [Human-in-the-Loop](../concepts/human-in-the-loop.md)
