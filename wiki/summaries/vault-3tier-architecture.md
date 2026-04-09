---
title: "Agent Vault — 3-Tier Architecture"
type: summary
tags: [agentic, multi-agent, orchestration, memory, context-management, personal]
source: raw/framework-docs/vault-3tier-architecture.md
author: Jay West
source_date: 2026-04-08
confidence: high
created: 2026-04-09
updated: 2026-04-09
related:
  - [[concepts/multi-agent-systems]]
  - [[concepts/memory-systems]]
  - [[concepts/context-management]]
  - [[concepts/task-decomposition]]
  - [[concepts/human-in-the-loop]]
status: stable
---

# Agent Vault — 3-Tier Architecture

## Source
Framework doc authored by Jay West (2026-04-08). Describes the production design of Jay's `~/.claude/vault/` memory system wired to all 32 agents in his 3-tier agentic stack.

## Core Problem Solved
Stock Claude agents start each session with zero memory — no knowledge of what worked, what failed, what was decided, or what standards changed. The vault gives every agent scoped, versioned, tier-appropriate context at task start, and explicit write targets at task end. Knowledge compounds automatically across every task without human curation.

## Relationship to Agentic-KB
The vault and this KB are complementary but distinct:
- **Vault** = working memory: task logs, sprint state, gotchas-as-discovered, standards-as-decided.
- **Agentic-KB** = canonical knowledge: curated concepts, frameworks, entities after validation.
- Pipeline: `vault → discovery → KB promotion`.

## The 3-Tier Stack

```
Jay
 └── Orchestrator agents   (strategic: decompose goals, delegate, architectural rulings)
      └── Lead agents      (coordination: domain quality, worker assignments, synthesis)
           └── Worker agents (execution: code, test, research, security, db)
```

### Tier 1 — Orchestrator
- **Agents:** `01-architecture-agent`, `02-plan-review-agent`, `architect`
- **Reads:** `orchestrator/hot.md`, project registry, team capabilities, delegation rules, relevant KB pages.
- **Writes:** project state ADRs, retrospectives, standards propagated to leads via `bus/standards/`.
- **Memory lifetime:** Permanent — the long-term institutional record. Never deleted.

### Tier 2 — Leads (4 domains: frontend, backend, qa, arch)
- **Agents (9):** `gsd-planner`, `03-planning-agent`, `04-task-breakdown-agent`, `gsd-roadmapper`, `gsd-plan-checker`, `gsd-assumptions-analyzer`, `gsd-nyquist-auditor`, `gsd-integration-checker`, `gsd-ui-auditor`
- **Reads:** domain hot.md, sprint-state, domain standards, worker capabilities, `bus/standards/` (orchestrator decisions).
- **Writes:** sprint-state updates, worker-log, known-patterns (phase end synthesis), `bus/discovery/`, `bus/standards/` (API contracts).
- **Memory lifetime:** Sprint/phase-scoped. Summarized to `domain/known-patterns.md` at phase end; worker-log archived at project close.

### Tier 3 — Workers (5 types: coder, tester, researcher, security, db)
- **Agents (20):** executors, debuggers, code-gen, reviewers, verifiers, researchers, security-reviewer, db-reviewer, and more.
- **Reads:** execution standards, `gotchas.md` (fast scan before every task), task-relevant patterns, lead domain standards.
- **Writes:** task-logs (ephemeral), gotchas (append immediately on discovery), new patterns, `bus/discovery/`, `bus/escalation/` (blocked >30 min or security finding).
- **Memory lifetime:** Ephemeral — cleared/summarized after phase end via summarize-up. Never accumulates indefinitely.

## Vault Context Blocks
Every agent `.md` file has a vault context block inserted after YAML frontmatter. Two formats:
- `<vault_context>` XML section — GSD agents using XML-section formatting.
- `## Vault Context` markdown section — plain-markdown agents.

All 32 agents are wired (3 orchestrator, 8 lead across 4 domains, 20 worker across 5 types). Backups at `~/.claude/agents/.vault-backup-2026-04-08/`.

### Block Structure
- **LOAD:** 3-5 prioritized files to read before any tool use or planning. Scoped to tier/domain — no agent loads the full vault or full KB.
- **WRITE:** Explicit conditional write targets — agents don't decide where things go, the block tells them.

### Why Tier-Appropriate Scoping
Context injection matches decision scope. A coder worker needs ~3 files (~150 lines): execution standards, known gotchas, lead domain standards. Loading 100+ KB pages would burn context budget and dilute task focus. Each tier gets exactly the context appropriate to its decision type.

## The Inter-Tier Message Bus (`bus/`)
Async communication layer between tiers. Three channels:

### `bus/discovery/` — Upward
- Workers write raw findings during/after task. Format: `[worker-type]-YYYY-MM-DD-[slug].md`.
- Fields: `promote_to_kb: true/false`, `status: unprocessed`.
- Leads process at phase end: promote to known-patterns, update gotchas, or discard. Mark processed. Delete after.
- Orchestrator promotes `promote_to_kb: true` entries to Agentic-KB at project close.

### `bus/standards/` — Downward
- Orchestrator writes architectural decisions/rulings for leads to consume.
- Leads write API contracts for peer leads.

### `bus/escalation/` — Upward (urgent)
- Workers write when blocked >30 min or when a security finding requires immediate lead attention.

## Key Design Principles
1. **Scoped context, not global context** — each tier loads only what its decision type requires.
2. **Explicit write targets** — agents are told exactly where to write; no guessing.
3. **Memory lifetime matches tier** — permanent (orchestrator), sprint-scoped (leads), ephemeral (workers).
4. **Async by default** — bus channels decouple tiers; no synchronous cross-tier blocking.
5. **Compound automatically** — gotchas, patterns, and decisions accumulate without human curation.
6. **Vault → KB pipeline** — working discoveries are promoted to canonical KB only after validation.
