---
id: 01KNNVX2R6JM53CM38W6YGT58C
title: Jay's Agentic Stack Overview
type: personal
category: pattern
confidence: high
date: 2026-04-04
tags: [personal, claude-code, gsd, superpowers, bmad, setup]
---

## Identity

Jay West. Expert AI builder, multi-agent architect, agentic-native developer. Thinks in systems. Skeptical of hype, deeply interested in infrastructure and reliability. Builds at the intersection of LLM capability and production engineering.

---

## Primary Tool: Claude Code CLI

**Model defaults**:
- `claude-sonnet-4-6` — default for most work (best cost/quality ratio)
- `claude-haiku-4-5` — file reads, grep tasks, simple Q&A, boilerplate generation
- `claude-opus-4-6` — complex architecture, research synthesis, security audits

**Working style**: Direct CLI interaction. Not a GUI user. Comfort with long sessions, autonomous modes, multi-agent delegation.

---

## Framework Selection

Three frameworks installed. Selection is task-driven, not habitual.

| Task Type | Framework |
|-----------|-----------|
| Experimental MVP, requirements will shift | **GSD** |
| Known spec, enterprise/client build, locked requirements | **BMAD** |
| Auth, payments, agentic systems — edge cases costly | **Superpowers** |
| Refactor or simple feature (< 3 files) | **Direct Claude** |

**Hybrid pattern for large apps**: GSD for working MVP → Superpowers for stability layer → BMAD for future spec-locked modules.

---

## GSD (Get Shit Done) v1.28.0

**Location**: `~/.claude/skills/gsd/`

**Standard feature funnel**:
```
/gsd:new-project       → scope, research, roadmap approval
/gsd:discuss-phase N   → clarify before planning (optional)
/gsd:plan-phase N      → adversarial plan verification (auto)
/gsd:execute-phase N   → wave-based sub-agent execution
/gsd:verify-work       → Playwright + verifier agent
/gsd:session-report    → log, commit message, PROGRESS.md
```

**Key commands**: `gsd:quick`, `gsd:fast`, `gsd:do`, `gsd:debug`, `gsd:autonomous`, `gsd:pr-branch`, `gsd:ui-phase`, `gsd:workstreams`

---

## Superpowers v5.0.6

**Location**: `~/.claude/skills/superpowers/`

**Iron laws**:
- No production code without a failing test first
- No fixes without root cause investigation
- No completion claims without fresh verification evidence
- If a skill might apply (even 1%), invoke it

**Workflow**: Brainstorm → Design Doc → Plan → Subagent-Driven-Dev → Verification → Finish Branch

**Skills available**: TDD, systematic-debugging, brainstorming, writing-plans, subagent-driven-development, dispatching-parallel-agents, verification-before-completion, finishing-a-development-branch, using-git-worktrees, requesting-code-review, receiving-code-review

---

## BMAD Method

**Location**: `~/.claude/skills/bmad/`

**Workflow**: bmad-init → product-brief → create-prd → validate-prd → shard tasks → implement (wave by wave)

**12+ agent personas**: PM, Architect, UX, Dev, Analyst, Security, DB, Performance, and more

**Party mode**: When multiple BMAD personas should debate a decision simultaneously (architecture choices, PRD reviews)

---

## Custom Agents

**Location**: `~/.claude/agents/` — 34 custom agents

| Agent | Purpose |
|-------|---------|
| `architect` | System design, ADRs |
| `code-reviewer` | Code quality review |
| `security-reviewer` | Vulnerability assessment |
| `db-reviewer` | Query optimization, schema |
| `perf-analyzer` | Profiling, bottlenecks |
| `superpowers-code-reviewer` | Superpowers-aware review |
| `gsd-planner` | GSD planning |
| `gsd-executor` | GSD execution |
| `gsd-verifier` | GSD verification |
| `gsd-debugger` | GSD debugging |
| `gsd-advisor-researcher` | Research with advisory output |
| `gsd-assumptions-analyzer` | Surface hidden assumptions |
| `gsd-ui-auditor` | UI/UX audit |
| `gsd-ui-researcher` | UI research |
| `gsd-user-profiler` | User persona profiling |
| *(+ additional gsd-* agents)* | |

---

## Skills Installed

**Location**: `~/.claude/skills/` — 29+ skills

Organized by framework:
- `skills/gsd/` — GSD workflow skills
- `skills/superpowers/` — Superpowers skills (listed above)
- `skills/bmad/` — BMAD method skills (listed above)

---

## Rules

**Location**: `~/.claude/rules/`

Path-specific rule files that activate based on what's being worked on:
- `rules/react.md` — React component files
- `rules/typescript.md` — `.ts`/`.tsx` files
- `rules/api.md` — API route files
- `rules/database.md` — DB/migration files
- `rules/security.md` — Auth, middleware, sensitive logic

---

## Obsidian Vault

**Location**: `/Users/jaywest/Documents/Obsidian Vault/`

**Contains**: 34 canonical concept definitions, autolinker configured, personal knowledge management system

This Agentic KB (`/Users/jaywest/Agentic-KB/`) is a companion to the Obsidian vault — more structured, agent-readable format.

---

## Tech Stack

**Frontend**: TypeScript + React + Next.js 14 (App Router)

**Backend**: Various — Express, Prisma + PostgreSQL common patterns

**Auth pattern**: JWT + refresh tokens via httpOnly cookies; server-side sessions for admin contexts

**Package manager**: pnpm (preferred); detected per-project from lockfile

**Testing**: Co-located tests (`Component.test.tsx`); Playwright for E2E

**Conventions**: Kebab-case files, camelCase functions, PascalCase classes, SCREAMING_SNAKE_CASE constants

---

## Code Standards (Global)

- Strict TypeScript — no `any` without justification
- Explicit return types on all functions
- Named error classes extending Error
- Parameterized queries only (never string interpolation in SQL)
- httpOnly cookies for auth tokens
- Zod/Joi at API boundaries
- Generic error messages to users, detailed server-side logs
- `npm audit` before every PR

---

## Permission Mode Philosophy

- **Default mode** — normal interactive development
- **acceptEdits** — when reviewing a planned refactor
- **bypassPermissions** — CI/CD or autonomous tasks ONLY, always in git worktree (see [[patterns/pattern-worktree-isolation]])
- **dontAsk** — batch processing with fully-specified instructions only

---

## Performance SLOs

- API P95 < 200ms
- API P99 < 500ms
- DB queries P95 < 50ms

---

## Commit Convention

Conventional Commits: `<type>(<scope>): <description>` (max 65 chars)

Types: `feat` `fix` `docs` `test` `refactor` `perf` `chore` `ci` `security`

---

## This KB

**Location**: `/Users/jaywest/Agentic-KB/`

**Structure**:
```
wiki/
  concepts/    ← 20 concept pages (core agentic concepts)
  patterns/    ← 15 pattern pages (implementation patterns)
  personal/    ← this file and personal setup notes
  frameworks/  ← GSD, Superpowers, BMAD documentation
  entities/    ← tools, models, platforms
  evaluations/ ← evaluation results and benchmark data
  recipes/     ← step-by-step implementation guides
  syntheses/   ← cross-cutting analysis
  summaries/   ← distilled overviews
  log.md       ← session log
```

**Related**: [[concepts/multi-agent-systems]], [[concepts/agent-loops]], [[concepts/memory-systems]], [[patterns/pattern-plan-execute-verify]]
