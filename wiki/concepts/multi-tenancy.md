---
id: 01KNNVX2QH75VGD93KJFZY3B9Y
title: Multi-Tenancy in Agentic Systems
type: concept
tags: [agentic, multi-tenancy, security, memory, orchestration, production]
confidence: medium
sources:
  - [[summaries/langchain-deepagents-production]]
created: 2026-04-07
updated: 2026-04-07
related:
  - [[concepts/memory-systems]]
  - [[concepts/guardrails]]
  - [[concepts/permission-modes]]
  - [[patterns/pattern-sandbox-auth-proxy]]
status: evolving
---

# Multi-Tenancy in Agentic Systems

## Definition
The capability of a single deployed agent system to safely serve multiple distinct users or organizations, isolating their data, credentials, and execution contexts from one another.

## Why It's Hard for Agents
Unlike stateless APIs, agents maintain memory, files, and long-running execution state. Isolation must be enforced across: conversation history, persistent memory, file storage, sandbox environments, and external credential access — all of which can leak cross-tenant if misconfigured.

## Three Core Requirements

### 1. Identity Verification
Ensure the caller is who they claim to be before granting access to any tenant-scoped resource. Typically handled by an authorization layer (e.g., JWT validation, OAuth token introspection) before requests reach agent logic.

### 2. Access Control
Tag all resources (threads, memory, files) with ownership metadata. Filter reads/writes to the authenticated tenant. Return 403 for cross-tenant access attempts.

### 3. Credential Management
Each tenant may have distinct API keys or OAuth tokens for downstream services. Use patterns like the [[patterns/pattern-sandbox-auth-proxy]] to inject credentials without exposing them in agent code or sandbox memory.

## Memory Scoping Strategy

| Scope | Isolation Level | Use Case |
|-------|----------------|----------|
| User | Per-user | Personal preferences, private history |
| Assistant | Per-assistant instance | Shared instructions for a team or product |
| Global | Organization-wide (read-only) | Policies, brand guidelines |

**Security Note:** Any shared memory scope (assistant, global) is a potential prompt injection vector. Treat shared memory as untrusted input; prefer read-only access enforcement.

## Sandbox Isolation
- **Thread-scoped sandboxes** provide the strongest isolation — fresh environment per conversation, cleaned up on TTL expiry
- **Assistant-scoped sandboxes** trade isolation for efficiency — conversations share one container; appropriate when tenants share the same assistant configuration

## Relevant Frameworks
- **LangSmith Deployments / LangGraph** — native support for user/assistant/global memory scoping and authorization handlers

## Open Questions
- How to handle tenant-specific fine-tuned models within a shared deployment?
- What auditability guarantees are needed for regulated industries (HIPAA, SOC2) using shared memory scopes?
