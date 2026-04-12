---
title: Layered Injection Hierarchy
type: pattern
category: memory
problem: Not all memory should be injected at the same frequency — always-present context inflates every prompt, while on-demand context is forgotten between sessions.
solution: Organize memory into layers ranked by injection frequency and size, from micro always-present facts to massive searchable archives.
tradeoffs:
  - pro: Context budget preserved — expensive memory only loaded when needed
  - pro: Critical facts never forgotten — sticky note layer always present
  - pro: Large memory stores remain available without token cost until queried
  - con: Requires disciplined write cadence to keep vault layer fresh
  - con: Layer 3 freshness depends on agent following checkpoint discipline
tags: [memory, context-management, agentic, multi-agent, compaction]
confidence: medium
sources:
  - [[summaries/summary-layered-agent-memory-obsidian]]
created: 2026-04-12
updated: 2026-04-12
related:
  - [[patterns/pattern-tiered-agent-memory]]
  - [[patterns/pattern-hot-cache]]
  - [[concepts/memory-systems]]
  - [[concepts/context-management]]
---

# Pattern: Layered Injection Hierarchy

## Problem
Agent memory has a tension: the most important context should always be present, but injecting everything into every prompt wastes tokens and dilutes focus. A flat memory store forces a binary choice — inject or don't.

The compound failure: compaction events wipe in-context state, and without a structured recovery mechanism the agent "gets stupid" mid-session.

## Solution
Organize memory into **four layers** ranked by injection frequency (always → on-demand → search-only) and size (tiny → medium → large → massive):

| Layer | Role | Injection | Max Size | Content |
|-------|------|-----------|----------|---------|
| **1 — Sticky Notes** | Critical micro-facts | Every prompt | ~2,000 chars | Names, paths, SSH commands, vault location |
| **2 — Rules/Personality** | Operating instructions | Every prompt | Medium | Hard rules, style, how-to-behave |
| **3 — Vault** | Working memory + history | Session start + on-demand | Unlimited | Daily logs, project state, working context, mistakes |
| **4 — Archive** | Cross-session recall | Query only (last resort) | Massive | Full conversation history, searchable |

Layers 1–2 are injected unconditionally. Layer 3 is read at session start and pulled selectively when needed (e.g., "that project from 3 days ago"). Layer 4 is only queried when the agent lacks context and needs cross-session recall.

## Implementation Sketch

```
# Layer 1 (built-in memory / CLAUDE.md header)
AGENT_NAME=Hermes
VAULT_PATH=/Users/jay/Obsidian/AgentVault
SSH_DGX="ssh spark@dgx.local"

# Layer 2 (CLAUDE.md body / agents.md)
- Always read vault on session start
- Checkpoint to vault every 3-5 tool calls
- Log mistakes immediately when corrections received

# Layer 3 (Vault reads — session start)
read: Agent-Shared/user-profile.md
read: Agent-Shared/project-state.md
read: Agent-{Self}/working-context.md
read: Agent-{Self}/daily/{today}.md

# Layer 4 (Archive — on explicit need)
search: "what did we do about X last week?"
→ query session archive
→ inject relevant excerpt into context
```

## Write Cadence (Layer 3 Discipline)
The vault only stays useful if agents write to it consistently:
- **Task start** — update `working-context.md` with current task
- **Every 3–5 tool calls** — checkpoint progress to daily log
- **Task completion** — append summary to daily log, update project state
- **Correction received** — immediately log to `mistakes.md`
- **Session end** — flush everything to daily log
- **After compaction** — re-read vault to restore continuity

## Compaction Recovery
When context is compacted (context window truncated), the agent reads Layer 3 immediately after — restoring the working context that was lost. This makes compactions transparent to the user.

```
Compaction event detected
→ read Agent-{Self}/working-context.md
→ read Agent-{Self}/daily/{today}.md (recent entries)
→ resume with restored context
```

## Tradeoffs

| | Pros | Cons |
|--|------|------|
| **Token budget** | Layers 1–2 tiny; vault only loaded when needed | Layer 3 reads cost tokens at session start |
| **Reliability** | Critical facts always present; compaction-resilient | Layer 3 freshness requires write discipline |
| **Flexibility** | Vault can hold unlimited history | Layer 4 (archive) search adds latency |
| **Cross-agent** | Vault shared layer enables multi-agent coordination | Shared writes need conflict awareness |

## When To Use
- Multi-session agentic workflows where context continuity matters
- Agents that suffer from compaction-induced amnesia
- Any setup with ≥2 agents that need to share context
- Long-running projects where "what were we doing 3 days ago?" is a real query

## When NOT To Use
- Single-turn or short-session agents where compaction doesn't occur
- Stateless query agents that don't need cross-session persistence
- Contexts where filesystem writes are unavailable

## Relationship to Related Patterns
This pattern adds a **horizontal axis** (injection frequency) to the **vertical axis** (agent tier hierarchy) established in [[patterns/pattern-tiered-agent-memory]]. They compose: a multi-tier system can implement the layered injection hierarchy within each tier.

The Layer 1 sticky note layer is the same concept as [[patterns/pattern-hot-cache]] but injected unconditionally rather than on demand.

## Real Examples
- Jay's `wiki/hot.md` serves as Layer 1 for this KB (always-loaded, ≤500 words)
- `CLAUDE.md` serves as Layer 2 (operating rules, always injected)
- `wiki/` directory serves as Layer 3 (on-demand, queried per session)
- This KB's session history (external) serves as Layer 4

## Related Patterns
- [[patterns/pattern-tiered-agent-memory]] — Vertical memory hierarchy by agent role
- [[patterns/pattern-hot-cache]] — Fast-access ≤500-word always-loaded cache
- [[patterns/pattern-shared-agent-workspace]] — Layer 3 shared directory for cross-agent coordination
- [[patterns/pattern-mistake-log]] — Dedicated Layer 3 file for error self-correction
- [[patterns/pattern-compounding-loop]] — Memory flywheel this pattern supports
