---
id: 01KNNVX2QJ3G8SGH595ZX072HP
title: Sandboxed Execution Environments
type: concept
tags: [agentic, safety, deployment, production, isolation]
confidence: medium
sources:
  - "[[summaries/langchain-deepagents-production]]"
created: 2026-04-07
updated: 2026-04-07
related:
  - "[[concepts/guardrails]]"
  - "[[concepts/agent-failure-modes]]"
  - "[[concepts/permission-modes]]"
status: evolving
---

# Sandboxed Execution Environments

## Definition
Isolated containers or execution contexts that insulate the host system from agent-generated code, resource exhaustion, and credential leakage. A core safety primitive for agents that execute code, manage files, or call external APIs.

## Why It Matters
Agents that run arbitrary code or interact with external systems create direct risk to the host environment. Sandboxing enforces a hard boundary — containing failures, preventing resource exhaustion, and keeping secrets out of agent-visible memory.

## Sandbox Scoping Strategies

| Scope | Behavior | Best For |
|-------|----------|----------|
| **Thread-scoped** | Fresh sandbox per conversation; cleaned up on TTL expiry | Stateless tasks, high isolation, untrusted input |
| **Assistant-scoped** | Single sandbox shared across conversations; cloned repos and dependencies persist | Long-running assistants, dependency-heavy workflows |

## Key Patterns

### Secret Injection via Auth Proxy
Rather than passing raw API keys into the sandbox environment, an auth proxy intercepts outbound requests and injects credentials. The agent never holds secrets in memory or on disk.

```
Agent → Sandbox Auth Proxy → External API
                ↑
         Credentials injected here
```

### File Transfer Across Boundaries
Files move in/out of sandboxes via explicit transfer calls (`upload_files()` / `download_files()`), making data flow auditable and intentional rather than implicit.

### TTL-Based Cleanup
Thread-scoped sandboxes are automatically destroyed after a configurable TTL, preventing resource accumulation from abandoned or long-idle conversations.

## Tradeoffs
- **Thread-scoped**: Higher isolation, higher spin-up overhead per conversation
- **Assistant-scoped**: Lower overhead, state persistence, but shared failure domain across threads

## Sources
- LangChain Deep Agents production docs describe thread-scoped and assistant-scoped sandbox models with sandbox auth proxy as the preferred secret management pattern

## Related
- [[concepts/guardrails]] — rate limiting and middleware complement sandbox isolation
- [[concepts/permission-modes]] — permission layers operate above the sandbox boundary
- [[concepts/agent-failure-modes]] — sandbox escapes and resource exhaustion are production failure modes
