---
title: Tiered Agent Memory
type: pattern
tags: [agentic, multi-agent, memory, orchestration, context-management]
confidence: high
sources:
  - [[summaries/vault-3tier-architecture]]
created: 2026-04-09
updated: 2026-04-09
related:
  - [[concepts/multi-agent-systems]]
  - [[concepts/memory-systems]]
  - [[concepts/context-management]]
  - [[concepts/task-decomposition]]
status: stable
---

# Pattern: Tiered Agent Memory

## Intent
Assign each tier of a multi-agent hierarchy a different memory scope, lifetime, and write target set — so that context injected at task start is always appropriate to the agent's decision type, and memory accumulates at the right granularity without ballooning indefinitely.

## Problem
In a multi-tier agent system (orchestrator → lead → worker), a single flat memory store creates two failure modes:
1. **Under-loading** — agents lack the context they need and make uninformed decisions.
2. **Over-loading** — agents receive irrelevant context, burning token budget and diluting focus.

Additionally, different tiers have fundamentally different memory needs: strategic decisions should persist permanently, while worker task logs should be ephemeral.

## Solution
Define three memory tiers aligned to decision scope:

| Tier | Decision Scope | Memory Lifetime | Load Budget |
|------|---------------|-----------------|-------------|
| Orchestrator | Strategic | Permanent | ~5 files |
| Lead | Domain coordination | Sprint/phase-scoped | ~4 files |
| Worker | Task execution | Ephemeral (task-scoped) | ~3 files |

Each agent's context block specifies:
- **LOAD:** exact files to read at task start, in priority order, before any tool use.
- **WRITE:** exact conditional write targets at task end.

Agents never choose where to write — the context block makes targets explicit.

## Memory Lifetime by Tier
- **Orchestrator:** Never deleted. Permanent institutional record (ADRs, retrospectives, project state).
- **Lead:** Summarized to `domain/known-patterns.md` at phase end. Worker logs archived at project close.
- **Worker:** Cleared after phase end via summarize-up. Gotchas and patterns promoted upward before clearing.

## Async Promotion Pipeline
Knowledge flows upward through an inter-tier message bus:
```
Worker discovery → bus/discovery/ → Lead review → known-patterns.md
                                               → bus/discovery/ (promote_to_kb: true)
                                                    → Orchestrator → canonical KB
```
This decouples tiers: workers don't block waiting for leads; knowledge compounds asynchronously.

## Known Uses
- Jay West's Agent Vault (`~/.claude/vault/`) — 32 agents across 3 tiers, all wired with vault context blocks. See [[summaries/vault-3tier-architecture]].

## Consequences
**Benefits:**
- Context budget is preserved — each agent loads only what it needs.
- Memory lifetime matches decision permanence — no ephemeral noise in permanent records.
- Knowledge compounds automatically without human curation.
- Explicit write targets eliminate agent guesswork about where findings go.

**Costs/Risks:**
- Requires upfront design of the load/write spec for every agent.
- Bus channels require a processing step (leads must run phase-end summarize-up).
- If an agent skips its WRITE step, knowledge is lost — no automatic enforcement.
