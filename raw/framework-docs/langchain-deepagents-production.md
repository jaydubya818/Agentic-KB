---
id: 01KNNVX2RK3BDG34Q1NWA7GWKZ
title: LangChain Deep Agents — Going to Production
type: framework-doc
source: https://docs.langchain.com/oss/python/deepagents/going-to-production
vendor: LangChain / LangSmith
date_captured: 2026-04-05
tags: [langchain, langgraph, deployment, production, memory, multi-tenancy, orchestration, agentic]
---

# LangChain Deep Agents — Going to Production

## Source

Official LangChain documentation: https://docs.langchain.com/oss/python/deepagents/going-to-production
Captured from Apple Notes bookmark on April 5, 2026.

## Core Primitives

Three building blocks for production agents:

- **Thread** — a single conversation with scoped message history and scratch files
- **User** — individual interacting with the agent; memory can be private or shared
- **Assistant** — configured agent instance with tied or shared memory and files

## Deployment: LangSmith Deployments

The recommended production deployment path. Automatically provisions:
- Assistants, threads, runs, storage, checkpointing
- Auth, webhooks, cron jobs, observability

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

- **Authorization handlers** tag resources with ownership metadata, filter user-specific access, or deny with HTTP 403.
- **Agent Auth** manages OAuth 2.0 flows — agents interrupt, present consent URLs, then resume with auto-refreshing tokens.
- **Sandbox auth proxy** injects credentials into outbound requests so sandbox code never holds raw API keys.

## Async Programming

LLM applications are I/O-bound. Use native async tools and middleware to avoid threading overhead when calling language models, databases, and external APIs.

## Durability

LangGraph checkpoints at every step. Interrupted runs resume from last recorded state without reprocessing. Enables:

- Indefinite interrupts
- Time travel / rewinding
- Safe handling of sensitive operations

## Memory

Persists across conversations. Memory scoping:

| Scope | Use Case |
|-------|----------|
| User | Per-user preferences (recommended default) |
| Assistant | Shared instructions for one assistant |
| Global | Read-only organization policies |

Uses file-based storage routed to `StoreBackend`. A `CompositeBackend` provides both ephemeral scratch space and persistent long-term memory.

**Security Warning:** Shared memory is a prompt injection vector. Enforce read-only access where appropriate.

## Execution Environment

### Filesystem Backends

- **StateBackend** — ephemeral, conversation-scoped
- **StoreBackend** — persistent across conversations
- **CompositeBackend** — mixed persistent + ephemeral routes

### Sandboxes

Isolated containers protecting the host from resource exhaustion.

- **Thread-scoped** — fresh sandbox per conversation, cleaned up on TTL expiry
- **Assistant-scoped** — conversations share one sandbox; cloned repos and dependencies persist

File transfers use `upload_files()` and `download_files()` across sandbox boundaries. Secrets injected via sandbox auth proxy (preferred) or workspace secrets.

## Guardrails

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

The `useStream` hook connects React UI to agents:

```tsx
const stream = useStream({
  apiUrl: "https://your-deployment.langsmith.dev",
  assistantId: "agent",
  reconnectOnMount: true,   // resumes in-progress runs after page refresh
  fetchStateHistory: true   // loads full history for returning users
});
```

Also supports Vue, Svelte, Angular.
