---
id: 01KQ2X70W8JERRZP7RQKHH5XKV
title: "Agent Vault"
type: concept
tags: [agents, memory, architecture, jay-stack, orchestration]
created: 2026-04-08
updated: 2026-04-25
visibility: private
confidence: high
related: [memory-systems, multi-agent-systems, llm-wiki, ingest-pipeline]
source: framework-docs/vault-3tier-architecture.md
---

# Agent Vault

## Definition

The **Agent Vault** (`~/.claude/vault/`) is a structured, persistent memory and knowledge system built for Jay's 3-tier agentic stack. It solves a fundamental limitation of stock Claude agents: each session starts with zero memory — no record of what worked, what failed, what was decided, or what standards changed.

The vault gives every agent:
- A **scoped, versioned, tier-appropriate context** loaded at task start
- A **defined set of write targets** committed at task end

Knowledge compounds across every task automatically, without human curation.

## Why It Matters

Without persistent memory, agents repeat mistakes, re-derive known solutions, and lose institutional context between sessions. The vault closes this loop by making memory a first-class architectural concern — structured by tier, scoped by role, and promoted through a deliberate discovery pipeline.

The vault is **distinct from the Agentic-KB**:

| System | Purpose | Contents |
|---|---|---|
| **Agent Vault** | Working memory | Task logs, sprint state, live gotchas, in-flight standards |
| **Agentic-KB** | Canonical knowledge | Curated concepts, frameworks, validated patterns |

The pipeline flows: `vault → discovery → KB promotion`. Raw findings live in the vault; validated, synthesized knowledge gets promoted to the KB.

## Example

A backend lead agent starts a sprint task by reading:
- `leads/backend-lead/hot.md` — current priorities and context
- `leads/backend-lead/memory/sprint-state.md` — active task assignments
- `leads/backend-lead/domain/standards.md` — domain rules
- `bus/standards/` — orchestrator decisions propagated down

At task end, it writes outcomes to `sprint-state.md`, logs worker assignments to `worker-log.md`, and publishes notable findings to `bus/discovery/` for potential KB promotion.

## The 3-Tier Architecture

The vault is organized around three tiers of agents:

```
Jay
 └── Orchestrator agents     (strategic decomposition, architectural rulings)
      └── Lead agents        (domain coordination, quality ownership)
           └── Worker agents (task execution — code, test, research, security)
```

### Tier 1: Orchestrators

**Agents**: `01-architecture-agent`, `02-plan-review-agent`, `architect`

**Scope**: Strategic. Receives goals from Jay, decomposes into domain assignments, delegates to leads, makes architectural rulings, writes retrospectives. Never writes production code.

**Reads**: `orchestrator/hot.md`, `orchestrator/domain/project-registry.md`, `orchestrator/domain/team-capabilities.md`, `orchestrator/process/delegation-rules.md`

**Writes**: project state ADRs, retrospectives, standards propagated to leads via `bus/standards/`

**Memory lifetime**: **Permanent** — orchestrator memory is never deleted. It is the long-term institutional record.

---

### Tier 2: Leads

**Domains**: `frontend-lead`, `backend-lead`, `qa-lead`, `arch-lead`

**Scope**: Coordination. Receives task briefs from orchestrators (via `sprint-state.md`), decomposes into worker assignments, reviews output, synthesizes patterns, reports up.

**Reads**: domain `hot.md`, `sprint-state.md`, `standards.md`, `worker-capabilities.md`, `bus/standards/`

**Writes**: sprint state, worker logs, `known-patterns.md` (synthesized at phase end), discovery bus entries, API contracts for other leads

**Memory lifetime**: Sprint/phase-scoped. Summarized into `domain/known-patterns.md` at phase end; worker logs archived at project close.

---

### Tier 3: Workers

**Scope**: Execution. Implements code, runs tests, conducts research, performs security review. Reads minimal context; writes task output and discovered gotchas.

**Reads**: `workers/[agent]/hot.md`, `workers/[agent]/active-task.md`

**Writes**: task results, `gotchas.md`, `task-log.md`

**Memory lifetime**: Task-scoped. Gotchas and notable findings bubble up to leads via the discovery bus.

## Common Pitfalls

- **Skipping end-of-task writes**: the compounding benefit only works if agents commit their outputs. Treat vault writes as mandatory, not optional.
- **Bypassing the bus**: discoveries that never reach `bus/discovery/` never get promoted to the KB. Leads must synthesize, not just store.
- **Over-writing to the wrong tier**: workers should not write to orchestrator memory; tier boundaries enforce appropriate scope.

## See Also

- [Memory Systems](memory-systems.md) — general taxonomy of agent memory types
- [Multi-Agent Systems](multi-agent-systems.md) — broader context for orchestrator/lead/worker patterns
- [LLM-Owned Wiki](llm-wiki.md) — how the Agentic-KB relates to vault-discovered knowledge
- [Ingest Pipeline](ingest-pipeline.md) — the vault → KB promotion workflow
