---
id: 01KNNVX2QHDRZTMZPEFGCVTMFK
title: Multi-Tenancy in Agent Systems
type: concept
tags: [agents, enterprise, deployment, orchestration, safety]
created: 2026-01-01
updated: 2026-04-05
visibility: public
confidence: high
related: [concepts/sandboxed-execution.md, concepts/guardrails.md, concepts/permission-modes.md, concepts/memory-systems.md]
source: https://docs.langchain.com/oss/python/deepagents/going-to-production
---

# Multi-Tenancy in Agent Systems

## Definition

Multi-tenancy in agent systems is the ability to serve multiple users or organizations from a shared agent infrastructure while maintaining strict isolation of identity, data, credentials, and permissions. It is a prerequisite for any production deployment serving more than one user.

## Why It Matters

Agents that act on behalf of users — accessing APIs, reading files, writing to databases — must be scoped to the correct user's context. Without multi-tenancy controls, one user's agent could read or modify another's data, credentials could leak across sessions, and audit trails become meaningless.

## Three Core Requirements

### 1. Identity Verification
Confirm that the user is who they claim to be before scoping any resources. This typically involves integrating with an external auth provider (OAuth 2.0, OIDC).

### 2. Access Control
Tag resources with ownership metadata and filter access accordingly. In practice:
- **Authorization handlers** attach ownership tags to threads, files, and memory
- Requests for another user's resources are denied with HTTP 403
- Middleware enforces these rules at the infrastructure level, not the LLM level

### 3. Credential Management
Users often grant agents access to third-party services (Gmail, GitHub, Slack). Safe patterns:
- **OAuth 2.0 agent flows** — agent interrupts execution, presents a consent URL, then resumes with auto-refreshing tokens
- **Sandbox auth proxy** — credentials are injected into outbound requests at the infrastructure layer; sandbox code never holds raw API keys

## Memory Scoping

Memory must be scoped appropriately to enforce user isolation:

| Scope | Use Case | Risk |
|---|---|---|
| User | Per-user preferences (recommended default) | Low |
| Assistant | Shared instructions for one assistant | Medium |
| Global | Read-only organization policies | High if writable |

> ⚠️ **Prompt Injection Risk**: Shared or global memory is a prompt injection vector. Enforce read-only access at the storage layer where possible.

## Example ([[framework-langgraph]])

[[framework-langgraph]]'s production deployment model illustrates these patterns concretely:
- **Threads** are user-scoped conversations with isolated message history
- **Authorization handlers** filter resource access per user
- **Agent Auth** manages OAuth flows with interrupts and token refresh
- **Sandbox auth proxy** injects secrets without exposing them to agent code

See [LangGraph](../frameworks/framework-langgraph.md) for implementation details.

## Common Pitfalls

- Relying on the LLM to enforce access control — always enforce at the infrastructure layer
- Storing credentials in agent memory or context where they can be exfiltrated via prompt injection
- Using a single shared sandbox for all users without TTL cleanup
- Allowing writable global memory that any user's agent can modify

## See Also

- [Sandboxed Execution](../concepts/sandboxed-execution.md)
- [Guardrails](../concepts/guardrails.md)
- [Permission Modes](../concepts/permission-modes.md)
- [Memory Systems](../concepts/memory-systems.md)
- [LangGraph](../frameworks/framework-langgraph.md)
