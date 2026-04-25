---
id: 01KQ2XK18ZAF7QCNWZY2GPXQR0
title: Integration Verification
type: concept
tags: [agents, workflow, automation, architecture, patterns]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [agent-failure-modes, multi-agent-systems, agent-observability]
---

# Integration Verification

## Definition

Integration verification is the practice of confirming that independently built components — phases, modules, or services — are correctly wired together as a functioning system. It is distinct from unit or phase-level testing, which only confirms that individual pieces exist and work in isolation.

The core principle: **Existence ≠ Integration.**

A component can be built and functional on its own while being completely disconnected from the rest of the system. Integration verification checks the *connections*, not the components themselves.

## Why It Matters

In multi-phase builds — especially those driven by AI agents working phase-by-phase — each phase may pass its own checks while the cross-phase wiring silently fails. Common failure modes include:

- A function is exported but never imported by consuming phases
- An API route exists but no frontend ever calls it
- A form submits to the correct endpoint, but the response is never rendered
- A database stores data that the UI never retrieves

These failures are invisible to per-phase audits. Only an integration pass catches them.

## The Four Connection Types

| Connection | What to Check |
|---|---|
| **Exports → Imports** | Phase A exports `getCurrentUser`; Phase B imports and calls it |
| **APIs → Consumers** | `/api/users` route exists; something fetches from it |
| **Forms → Handlers** | Form submits to API; API processes; result displays |
| **Data → Display** | Database has data; UI renders it |

## Verification Process

### 1. Build an Export/Import Map

For each phase, extract what it *provides* and what it *consumes*. Example:

```
Phase 1 (Auth):
  provides: getCurrentUser, AuthProvider, useAuth, /api/auth/*
  consumes: nothing (foundation)

Phase 2 (API):
  provides: /api/users/*, /api/data/*, UserType, DataType
  consumes: getCurrentUser (for protected routes)

Phase 3 (Dashboard):
  provides: Dashboard, UserCard, DataList
  consumes: /api/users/*, /api/data/*, useAuth
```

### 2. Verify Export Usage

For each export, check:
- Is it imported anywhere outside the source phase?
- Is it actually *used* (not just imported)?

An export that is imported but never called (`IMPORTED_NOT_USED`) is a soft failure. An export with zero imports (`ORPHANED`) is a hard integration failure.

### 3. Verify API Coverage

For each API route, confirm at least one consumer exists — a `fetch`, `axios` call, or equivalent — in a different phase or module.

### 4. Trace E2E User Flows

For each primary user workflow, trace the full path: UI interaction → API call → data processing → response rendering. A break at any step is a broken product, even if all individual steps exist.

### 5. Map Findings to Requirements

Every integration gap should be mapped to the affected requirement IDs. Requirements with no cross-phase wiring should be explicitly flagged — they may represent isolated features or missed connections.

## Example

In a Next.js project with auth (Phase 1), API layer (Phase 2), and dashboard (Phase 3):

- ✅ `useAuth` is exported from Phase 1 and imported in Phase 3's `<ProtectedRoute>` — **connected**
- ❌ `/api/data/export` exists in Phase 2 but no component ever calls it — **orphaned API**
- ⚠️ `UserType` is imported in Phase 3 but only used as a type annotation, not at runtime — **soft gap**

## Common Pitfalls

- Grepping for a symbol's name is not enough — confirm it's used at runtime, not just in comments or type-only imports
- Test files importing a symbol don't count as integration consumers
- Middleware that wraps routes can obscure real API consumers — trace carefully

## See Also

- [Agent Failure Modes](../concepts/agent-failure-modes.md) — integration gaps as a class of agent-produced failure
- [Multi-Agent Systems](../concepts/multi-agent-systems.md) — phase-based builds as an orchestration pattern
- [Agent Observability](../concepts/agent-observability.md) — surfacing integration failures at runtime
