---
id: 01KNNVX2RAEREB47C8YJDFXM8N
title: LangChain Deep Agents — Going to Production
type: summary
tags: [langchain, langgraph, deployment, production, memory, multi-tenancy, orchestration, agentic, sandboxing, guardrails]
source: raw/framework-docs/langchain-deepagents-production.md
source_url: https://docs.langchain.com/oss/python/deepagents/going-to-production
vendor: LangChain / LangSmith
captured: 2026-04-05
created: 2026-04-07
updated: 2026-04-07
related:
  - [[concepts/memory-systems]]
  - [[concepts/guardrails]]
  - [[concepts/multi-agent-systems]]
  - [[concepts/human-in-the-loop]]
  - [[frameworks/framework-langgraph]]
---

# LangChain Deep Agents — Going to Production

## Source
Official LangChain documentation for Deep Agents production deployment. Captured 2026-04-05.

## One-Line Summary
LangChain's opinionated production stack for agentic systems: LangSmith Deployments handles infra (auth, storage, observability) while [[framework-langgraph]] provides durable, checkpointed execution with scoped memory, sandboxed execution environments, and middleware-based guardrails.

## Core Primitives

| Primitive | Role |
|-----------|------|
| **Thread** | Single conversation; scoped message history + scratch files |
| **User** | Individual interacting with the agent; owns private or shared memory |
| **Assistant** | Configured agent instance with tied or shared memory and files |

## Deployment
LangSmith Deployments is the recommended production path. Configured via `langgraph.json`. Auto-provisions: assistants, threads, runs, storage, checkpointing, auth, webhooks, cron jobs, and observability.

## Multi-Tenancy
Three concerns: identity verification, access control, credential management.
- **Authorization handlers** — tag resources with ownership, filter per-user, or return HTTP 403
- **Agent Auth** — OAuth 2.0 via agent-interrupted consent flows; auto-refreshing tokens
- **Sandbox auth proxy** — injects credentials into outbound requests; sandbox code never holds raw keys

## Durability
[[framework-langgraph]] checkpoints at every step. Interrupted runs resume from last state. Enables indefinite interrupts, time travel/rewinding, and safe handling of sensitive operations.

## Memory Scoping

| Scope | Use Case |
|-------|----------|
| User | Per-user preferences (recommended default) |
| Assistant | Shared instructions for one assistant instance |
| Global | Read-only organization-wide policies |

Storage: `StoreBackend` for persistence; `CompositeBackend` for mixed persistent + ephemeral. **Security note:** shared memory is a prompt injection vector — enforce read-only where possible.

## Execution / Filesystem Backends
- **StateBackend** — ephemeral, conversation-scoped
- **StoreBackend** — persistent across conversations
- **CompositeBackend** — routes to either based on path/config

### Sandboxes
- **Thread-scoped** — fresh per conversation, TTL cleanup
- **Assistant-scoped** — shared across conversations; cloned repos and deps persist

File I/O across sandbox boundaries via `upload_files()` / `download_files()`.

## Guardrails (Middleware)

```python
# Rate limiting
ModelCallLimitMiddleware(run_limit=50)
ToolCallLimitMiddleware(run_limit=200)

# PII redaction
PIIMiddleware("email", strategy="redact", apply_to_input=True)
```

- `run_limit` = per-invocation cap; `thread_limit` = conversation-wide cap
- PII strategies: `redact`, `mask`, `hash`, `block`
- Error handling tiers: transient → retry with backoff; model-recoverable → feed back to LLM; human-input errors → pause; provider failure → fallback middleware switches model

## Frontend Integration
`useStream` React hook connects UI to agents. Supports `reconnectOnMount` (resumes in-progress runs after page refresh) and `fetchStateHistory` (loads full history for returning users). Also supports Vue, Svelte, Angular.

## Key Insights
1. LangSmith Deployments abstracts nearly all infra concerns — production path is strongly opinionated and tightly integrated.
2. Memory scoping (user/assistant/global) is the primary lever for multi-tenancy data isolation.
3. Shared memory is explicitly called out as a prompt injection risk — a rare vendor-level safety callout worth noting.
4. Sandbox auth proxy pattern cleanly solves the credential-in-sandbox problem without secret sprawl.
5. Middleware-layered guardrails (rate limits, PII, fallback) are composable and applied outside agent logic.
