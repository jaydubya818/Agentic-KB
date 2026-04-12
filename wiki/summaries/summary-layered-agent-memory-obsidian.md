---
title: "Layered Agent Memory: Obsidian-Backed 4-Layer System"
type: summary
source_file: raw/transcripts/layered-agent-memory-obsidian.md
source_url: https://www.youtube.com/watch?v= (unlisted transcript)
author: Alex Finn (OpenClaw / Hermes creator)
date_published: 2026-04
date_ingested: 2026-04-12
tags: [memory, context-management, multi-agent, agentic, obsidian, compaction]
key_concepts:
  - layered-injection-hierarchy
  - shared-agent-workspace
  - mistake-log
  - write-cadence
  - compaction-recovery
confidence: medium
---

# Summary: Layered Agent Memory — Obsidian-Backed 4-Layer System

## Source
Video transcript demonstrating an Obsidian-based memory architecture for AI agents. Demonstrated with OpenClaw/Hermes; the underlying architecture patterns are framework-agnostic.

> **Note:** Patterns extracted here are generalized. No OpenClaw-specific implementation details are applied to this KB.

---

## Core Idea
Agent memory is organized into **four layers ranked by injection frequency and size**, trading comprehensiveness for context budget:

| Layer | Content | Injection | Size |
|-------|---------|-----------|------|
| 1 — Sticky Notes | Critical facts (name, paths, SSH commands) | Every prompt | ~2,200 chars |
| 2 — Rules/Personality | Operating instructions, hard rules, style | Every prompt | Medium |
| 3 — Vault (Obsidian) | Full project state, daily logs, working context | On-demand (session start + explicit read) | Large/unlimited |
| 4 — Session Archive | Every past conversation, searchable | Query only (last resort) | Massive |

Layers 1–2 are always-present. Layer 3 is read on session start and during work as needed. Layer 4 is queried when the agent needs cross-session recall ("what did we do about X last week?").

---

## Key Mechanisms

### Vault Structure (Layer 3)
```
Agent-Shared/           ← all agents read/write
  user-profile.md       ← who the user is, preferences, corrections
  project-state.md      ← all projects and status
  decisions-log.md      ← shared decision history

Agent-{Name}/           ← each agent's private workspace
  working-context.md    ← what it's actively doing right now
  mistakes.md           ← errors it's made, corrections received
  daily/                ← one log file per day
```

### Write Triggers
Agents write to the vault at predictable, disciplined intervals:
- Task start
- Every 3–5 tool calls (checkpointing)
- Task completion
- When a correction is received
- On session end (full flush to daily log)

### Compaction Recovery
When a context compaction occurs, the agent reads its vault immediately after to restore continuity. Author reports zero noticeable compaction events after implementing this.

### Mistake Logging
A dedicated `mistakes.md` file receives entries any time the user flags an error or provides a correction. The agent reads this at session start, reducing repeat errors across sessions.

---

## Novel Patterns Identified
- [[patterns/pattern-layered-injection-hierarchy]] — Separate memory by injection frequency, not just content type
- [[patterns/pattern-shared-agent-workspace]] — Filesystem directory shared across all agents for cross-agent context
- [[patterns/pattern-mistake-log]] — Dedicated error log for agent self-correction across sessions

---

## Key Claims
- "I haven't noticed a single compaction since putting in this system" [UNVERIFIED — subjective, single source]
- Write cadence of every 3–5 tool calls prevents context loss without overloading the vault
- Shared workspace enables seamless handoff between agents (e.g., Hermes drafts a script → OpenClaw resumes it)

---

## Applicability to This KB
The principles map directly to this KB's architecture:
- Layer 1 ≈ `wiki/hot.md` (always-loaded fast cache)
- Layer 2 ≈ `CLAUDE.md` (operating rules)
- Layer 3 ≈ `wiki/` directory (on-demand query)
- Layer 4 ≈ session search / conversation archive

The shared agent workspace concept extends the existing [[patterns/pattern-tiered-agent-memory]] — adding a lateral sharing dimension (peer-to-peer) vs the existing vertical promotion pipeline.

---

## Sources
- Video transcript (Alex Finn, April 2026)
- Related: [[summaries/summary-karpathy-llm-wiki-video]], [[concepts/memory-systems]]
