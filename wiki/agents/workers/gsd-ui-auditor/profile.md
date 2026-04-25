---
id: 01KQ2XZ3WZ5QN38RP1XSTEN888
title: GSD UI Auditor
type: entity
tags: [agents, workflow, automation, architecture]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [agents/workers/gsd-executor/profile.md, agents/orchestrators/architecture-agent/profile.md]
source: my-agents/gsd-ui-auditor.md
---

# GSD UI Auditor

A worker agent that performs retroactive 6-pillar visual and interaction audits of implemented frontend code. Spawned by the `/gsd:ui-review` orchestrator. Produces a scored `UI-REVIEW.md` as its primary output.

## Identity

| Field | Value |
|---|---|
| Name | `gsd-ui-auditor` |
| Role | Worker (spawned by orchestrator) |
| Tools | Read, Write, Bash, Grep, Glob |
| Color | `#F472B6` |
| Output | `UI-REVIEW.md` with scored findings |

## Core Responsibilities

1. **Screenshot safety** — Ensures `.planning/ui-reviews/.gitignore` exists before any screenshot capture, preventing binary assets from entering git history.
2. **Screenshot capture** — Uses Playwright via CLI to capture desktop (1440×900), mobile (375×812), and tablet (768×1024) viewports if a dev server is running at `localhost:3000`. Falls back to code-only audit if no server is detected.
3. **Spec-driven audit** — If `UI-SPEC.md` exists and is approved, audits against it specifically. Otherwise audits against abstract 6-pillar standards.
4. **Scoring** — Scores each of the 6 pillars on a 1–4 scale and identifies the top 3 priority fixes.
5. **Output** — Writes `UI-REVIEW.md` with actionable, scored findings.

## Upstream Inputs

| Input | Purpose |
|---|---|
| `UI-SPEC.md` | Design contract from `/gsd:ui-phase`. Defines expected design system, spacing, typography, color, and copywriting. |
| `SUMMARY.md` files | What was built in each plan execution |
| `PLAN.md` files | What was intended to be built |

## The 6-Pillar Audit Framework

Each pillar is scored 1–4:

1. **Design System** — Component library and token usage
2. **Spacing Scale** — Spacing value consistency
3. **Typography** — Font sizes and weights
4. **Color** — 60/30/10 split and accent usage
5. **Copywriting** — CTA labels, empty states, error states
6. **Interaction** — (assessed from code or live screenshots)

## Operational Flow

```
1. Read files in <files_to_read> block (mandatory)
2. Read ./CLAUDE.md if present
3. Check .claude/skills/ or .agents/skills/ for project skills
4. Run gitignore gate (unconditional)
5. Attempt screenshot capture via Playwright
6. Load UI-SPEC.md (or fall back to abstract standards)
7. Audit against pillars
8. Score and identify top 3 priority fixes
9. Write UI-REVIEW.md
```

## Screenshot Safety Gate

The `.gitignore` gate runs unconditionally on every audit. It creates `.planning/ui-reviews/.gitignore` with entries for all common image formats (`*.png`, `*.webp`, `*.jpg`, etc.), ensuring screenshots never reach a commit even if the user runs `git add .` before cleanup.

## See Also

- [GSD Executor](../gsd-executor/profile.md) — Sibling worker agent in the GSD system
- [Architecture Agent](../../orchestrators/architecture-agent/profile.md) — Example orchestrator pattern
- [Human-in-the-Loop](../../../concepts/human-in-the-loop.md) — Relevant for approval gates like UI-SPEC sign-off
