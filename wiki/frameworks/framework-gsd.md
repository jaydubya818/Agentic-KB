---
id: 01KNNVX2QTWCWBWJ8VNSNC2BHP
title: GSD Framework
type: framework
tags: [agents, workflow, automation, orchestration, patterns]
created: 2025-01-01
updated: 2026-04-07
visibility: public
confidence: high
related: [pattern-architecture-first, concepts/task-decomposition, concepts/agent-observability]
---

# GSD Framework

The GSD (Get Stuff Done) framework is a structured [[multi-agent-systems]] for milestone-driven software development. Agents specialise in discrete roles — planning, execution, auditing, and integration checking — and are composed into a pipeline that verifies work at each phase boundary.

## What It Does

GSD coordinates a set of named agents across the software development lifecycle:

- **Planners** decompose requirements into phased milestones
- **Executors** implement phase work within guardrails
- **Auditors** verify phase completion against requirements
- **Integration Checkers** verify cross-phase wiring and end-to-end flows

## Key Concepts

### gsd-integration-checker

The `gsd-integration-checker` agent is responsible for verifying that phases work together as a system, not just individually. Its core principle:

> **Existence ≠ Integration**

A component can exist without being imported. An API can exist without being called. A form can exist without a handler. The checker explicitly tests *connections*, not *presence*.

**Verification steps it performs:**

1. **Export/Import Map** — Builds a provides/consumes map from phase SUMMARYs. Each phase declares what it exports (e.g. `getCurrentUser`, `/api/users/*`) and what it consumes from prior phases.

2. **Export Usage Check** — For each exported symbol, verifies it is both imported and actively used downstream (not merely imported and abandoned).
   - `CONNECTED` — imported and used
   - `IMPORTED_NOT_USED` — imported but never called
   - `ORPHANED` — never imported at all

3. **API Coverage Check** — Discovers all API routes (Next.js App Router and Pages Router patterns) and verifies each route has at least one `fetch` or `axios` caller. Routes with no consumers are flagged `ORPHANED`.

4. **Auth Protection Check** — Identifies pages/components in protected areas (dashboard, settings, profile) and verifies they use auth hooks (`useAuth`, `useSession`, `getCurrentUser`) or redirect unauthenticated users.

5. **Requirements Integration Map** — Maps every integration finding back to its requirement ID. Requirements with no cross-phase wiring are explicitly flagged.

### Provides/Consumes Pattern

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

This map is the canonical source of truth for what *should* be connected — the checker then verifies reality matches.

## When to Use It

- After each development phase completes, before declaring the milestone done
- When a phase audit passes but the integrated system is suspected to be broken
- As a final gate before shipping a milestone to QA or staging

## Limitations

- Static grep-based analysis may miss dynamic imports, programmatic `fetch` calls with computed URLs, or non-standard HTTP client usage
- Requires well-structured SUMMARYs from each phase to build the provides/consumes map
- Auth protection checks rely on naming conventions for protected areas; unconventionally named routes may be missed
- The document source is truncated — the auth protection check function appears incomplete

## See Also

- [Task Decomposition](../concepts/task-decomposition.md)
- [Agent Observability](../concepts/agent-observability.md)
- [Trajectory Evaluation](../concepts/trajectory-evaluation.md)
- [Pattern: Architecture First](../patterns/pattern-architecture-first.md)
- [Multi-Agent Systems](../concepts/multi-agent-systems.md)
