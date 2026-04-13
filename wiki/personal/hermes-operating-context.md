---
title: Hermes Operating Context
type: personal
category: pattern
confidence: high
date: 2026-04-12
tags: [orchestration, agentic, personal, hermes, portfolio]
---

# Hermes Operating Context

> This file is read by the Hermes agent on every session start. It provides portfolio state, active priorities, recurring rhythms, and durable routing lessons. Update it whenever the portfolio state changes meaningfully. Append — never overwrite history.

---

## Active Portfolio Domains (as of 2026-04-12)

| Domain | Priority | Status |
|--------|----------|--------|
| SellerFi | High | Active — fintech, primary business |
| Agentic-KB / LLM Wiki | High | Active — this system |
| MissionControl / Hermes harness | High | Active — agent infrastructure |
| Twinz / LifeOS | Medium | Active — personal systems |
| AI_CEO / Agentic-Pi-Harness | Medium | Active — digital workforce |
| comicogs / collector-media | Medium | Active |
| AssuranceAgents | Low-Medium | Experimental |
| OpenClaw-related systems | Medium | Active |

---

## Current Priority Stack

> Update this section at the start of each week or whenever priorities shift.

1. **[UPDATE ME]** — highest-leverage active objective
2. **[UPDATE ME]** — second priority
3. **[UPDATE ME]** — third priority

---

## Jay's Agent Infrastructure (as of 2026-04-12)

- **34 agents** across orchestrator / lead / worker tiers
- **29+ skills** in `~/.claude/skills/`
- **Primary frameworks**: GSD (TypeScript, extensive), Superpowers (TypeScript, extensive), BMAD (extensive)
- **Runtimes**: Claude Code (primary), Cowork (secondary)
- **KB**: `/Users/jaywest/Agentic-KB/` — markdown wiki, GitHub: jaydubya818/Agentic-KB
- **Agent definitions**: `~/.claude/agents/`
- **Main Obsidian vault**: `/Users/jaywest/Documents/Obsidian Vault/`

---

## Routing Defaults (validated patterns)

These have been consistently correct — use as defaults unless context overrides:

- **Agentic-KB questions** → Knowledge Ingestion lane, not Orchestration
- **GSD framework questions** → Engineering Execution, Jay has extensive experience, don't over-research
- **SellerFi product questions** → Product Strategy first, then Engineering
- **"What should I work on"** → Founder Ops, check this file's Priority Stack first
- **Agent system design** → Orchestration Architecture, reference `wiki/evaluations/eval-orchestration-frameworks.md`
- **Multi-agent implementation** → GSD or Raw Claude Code (eval verdict), not LangGraph unless Python is required

---

## Recurring Rhythms

> Fill in as cadences are established.

| Rhythm | Frequency | Description |
|--------|-----------|-------------|
| KB lint | Monthly | Run lint workflow, output to wiki/syntheses/lint-YYYY-MM-DD.md |
| KB ingest | As-needed | When new sources arrive — follow INGEST workflow in CLAUDE.md |
| [UPDATE ME] | | |

---

## Decision Patterns (durable)

Lessons from past decisions that should influence future routing and recommendations:

- **Framework selection**: Jay uses GSD + Superpowers + BMAD. Don't recommend new frameworks unless there's a clear gap none of these cover. Jay's familiarity weight is the dominant factor in framework ROI.
- **TypeScript first**: Jay's stack is TypeScript-first. Python solutions get a productivity penalty unless Python is the only option.
- **Agentic-KB is the source of truth** for knowledge questions — always check the wiki before web-searching.
- **Per-claim confidence matters**: On high-stakes recommendations, be explicit about what is verified vs. assumed. See `wiki/patterns/pattern-per-claim-confidence.md`.
- **Delegation contract**: When spawning subagents or routing to specialists, always pass objective + expected artifact + constraints. Raw handoffs produce noise.

---

## Key Stakeholders

> Fill in as relevant.

| Person / Entity | Role | Context |
|----------------|------|---------|
| Jay West | Owner | Full portfolio |
| [UPDATE ME] | | |

---

## Open Blockers / Known Constraints

> Append new entries. Never delete old ones — they're the audit trail.

- [2026-04-12] RLM Stages 1–3 not yet implemented. Recipe at `wiki/recipes/recipe-hybrid-search-llm-wiki.md`. P1 priority.
- [2026-04-12] `agentmemory` primary source (LLM Wiki v2) not publicly available. summary-llm-wiki-v2.md stays at medium confidence.
- [2026-04-12] `wiki/mocs/repos.md` not yet created. Repo canonical docs not 2-click reachable from home.md.

---

## Durable Lessons (append-only)

> Add entries when a routing or execution decision reveals a pattern worth remembering.

- [2026-04-12] Hermes agent formalized. Session-start reads this file + wiki/hot.md. Update this file when portfolio state changes — don't leave Hermes routing blind.
- [2026-04-12] Writing style guide and 2-click rule added to KB CLAUDE.md. All new wiki pages must follow these.
- [2026-04-12] Wikiwise ingest reveals: stream large docs to disk before loading into context. Never load document body directly. Pipe via `jq -r '.content' > file`.
