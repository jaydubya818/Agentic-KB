---
title: Foundry × Agentic-KB Integration Plan
type: plan
date: 2026-04-18
status: draft
tags: [foundry, agentic-kb, integration, slash-commands]
source: https://github.com/jameesy/foundry-vault
---

# Foundry × Agentic-KB Integration Plan

## Recommendation in one sentence

**Layer Foundry's slash-command UX on top of Agentic-KB's existing substrate. Don't fork a second vault.**

## Why not a parallel vault

Foundry's three folders (`inbox/sources/wiki/`) are a strict subset of Agentic-KB's `raw/wiki/` model — same Karpathy compile pattern, less infrastructure. Running both side-by-side would:
- Split your knowledge across two places (where do meeting notes go?).
- Duplicate compile logic and tag taxonomies.
- Break the existing Hermes session-start workflow that already reads `wiki/personal/hermes-operating-context.md` and `wiki/hot.md`.
- Force you to maintain two mental models for the same problem.

## What's worth stealing from Foundry

| Foundry feature | Agentic-KB has it? | Action |
|---|---|---|
| Slash-command triggers (`/foundry-*`) | No — `kb` CLI only | **Steal** — add as `.claude/commands/` |
| 3-folder simplicity (`inbox/sources/wiki/`) | Different (13 raw/ subdirs + auto-routing `clippings/`) | **Keep Agentic-KB's** — already richer; just expose `raw/clippings/` as the inbox |
| 2-source rule for concept compile | No — single-source compile happens | **Steal** — add as compile gate + lint check |
| One-way rule (agent reads personal, never writes) | Implicit | **Codify** — add to CLAUDE.md as Rule 13 |
| `#area/` tag taxonomy | Has its own taxonomy | **Skip** — yours is already richer |
| Obsidian config + theme | Has own `.obsidian/` | **Skip** — already configured |
| Two example sources + concept page | N/A | **Skip** — you have 282 wiki pages |
| Candidate-tracking (`wiki/_meta/index.md`) | No | **Steal** — add as `wiki/candidates.md` |
| Karpathy-cited concept template | Has 7 page-type templates | **Skip** — yours is more disciplined |

## What gets installed where

```
~/Agentic-KB/
├── .claude/
│   └── commands/                ← NEW — Foundry-style slash commands
│       ├── foundry-ingest.md    ← shells to: kb ingest-clippings && kb compile
│       ├── foundry-compile.md   ← shells to: kb compile --enforce-2-source
│       ├── foundry-ask.md       ← shells to: kb query "$ARGS"
│       └── foundry-lint.md      ← shells to: kb lint --include-candidates
├── raw/
│   └── clippings/               ← EXISTING — already the inbox per CLAUDE.md
├── wiki/
│   ├── candidates.md            ← NEW — single-source themes waiting for #2
│   ├── _meta/                   ← NEW — meta tracking dir (Foundry style)
│   │   └── compile-log.md       ← per-compile decision log
│   └── ...                      ← existing wiki structure
├── scripts/
│   └── compile-2source-gate.mjs ← NEW — pre-compile filter for 2-source rule
└── CLAUDE.md                    ← UPDATE — add Rule 13 (one-way rule), candidate workflow
```

**Personal vault** (`~/Documents/Obsidian Vault/`) stays untouched. Agent reads it via existing `sofie-watch-obsidian.mjs`; agent never writes back. That's the one-way rule.

## The four `/foundry-*` slash commands

Each is a thin Markdown command file in `.claude/commands/` that documents what Claude does, with a small shell-out to your existing `kb` CLI. This means devs get the simple Foundry verbs; under the hood, all the Agentic-KB machinery (two-step compile, autolink, audit log, RBAC) still runs.

### `/foundry-ingest`
- Read everything in `raw/clippings/` (already the auto-routing inbox).
- For each item: detect type (article, transcript, paper, conversation), route to correct `raw/` subdir per existing CLAUDE.md INGEST step 0.
- For each routed file: run `kb ingest-file <path>`.
- Append to `wiki/log.md` with what was ingested.
- Output: same compact summary Foundry shows ("Ingested 5: …").

### `/foundry-compile`
- Run `kb compile` with the existing two-step Analysis→Generation pipeline.
- **Add the 2-source gate**: before promoting a theme to a concept page, check whether `wiki/summaries/` contains ≥ 2 summaries that touch the theme's key concepts. If only 1, append the theme to `wiki/candidates.md` instead and skip page creation.
- Output: which pages were created, which themes are now candidates, which candidates graduated to pages this run.

### `/foundry-ask`
- Run `kb query "$ARGS"` — already does graph-search + temporal decay + hotness ranking + token-budget packing.
- **Add citation enforcement**: if the synthesized answer cites < 2 sources, prepend a warning. Foundry's bar is "every claim cites its source" — make that visible in the response, not silent.
- Output: streamed answer with citations, plus `[citation_count: N]` footer.

### `/foundry-lint`
- Run `kb lint` (already covers orphans, stale pages, contradictions, low-confidence claims, missing review, drift).
- **Add candidate health**: list candidates in `wiki/candidates.md` that now have ≥ 2 supporting summaries (i.e., ready to compile next run).
- **Add keyword drift**: track tag frequency over the last 30 days vs. the last 90; flag tags whose use dropped > 70% (Foundry's drift signal).
- Output: existing lint report + 2 new sections.

## Enhancements I'd add over vanilla Foundry

1. **Idempotent ingest with hash-based skip** — Foundry re-ingests the same file if you re-drop it. Add a `raw/.ingest-hashes.json` so re-runs are cheap and safe. (Agentic-KB's `raw/.compiled-log.json` already does this for compile; add the symmetric thing for ingest.)
2. **Candidate-graduation auto-prompt** — when `/foundry-lint` finds a candidate with ≥ 2 sources, surface it in the next session's opening status (alongside the meeting-note pending count you already surface). Frictionless graduation.
3. **One-way rule as a hard guardrail** — add a pre-commit hook in `~/Documents/Obsidian Vault/` that **blocks commits with the agent as author**. Belt + braces.
4. **Slash-command discoverability** — write a one-line `wiki/home.md` block listing the four `/foundry-*` commands. New devs see them on session start.
5. **Foundry-style "Prompts for 2026" section** in concept pages — your concept-page template doesn't have one. Add as an optional 8th required section: "Prompts for `<personal-vault>`" — essay-shaped questions where this concept intersects with the user's own work. Real value-add for personal thinking.
6. **Inbox count in session opening** — your CLAUDE.md already surfaces meeting-note pending counts; add the `raw/clippings/` count too. "5 items in inbox, 3 candidates ready to compile."

## What I would NOT do

- Don't import Foundry's example files (`Two-layer knowledge systems.md`, `Andrej Karpathy.md`). You already have wiki content; their examples will confuse the entity map.
- Don't replace your CLAUDE.md with Foundry's. Yours is far more developed (workflows for INGEST, QUERY, LINT, BACKFILL, EXPLORE, BRIEF — Foundry has none of those).
- Don't adopt Foundry's `#area/` taxonomy unless you want to migrate every existing tag.
- Don't install `.obsidian/` from Foundry — would clobber your config.

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| Slash commands collide with existing `/` commands | Namespace as `/foundry-*` (already done by Jamees); list yours via `.claude/commands/` README |
| 2-source gate blocks legitimate single-source compiles | Add `--force` flag to bypass; log every bypass to `wiki/log.md` |
| Devs use `/foundry-*` but ignore deeper `kb` features | Document the relationship in TEAM-SETUP.md: "Foundry verbs are the easy mode; `kb` CLI is the power mode" |
| Personal vault accidentally written to | Pre-commit hook blocks agent-authored commits; CLAUDE.md Rule 13 codifies the boundary |

## Build order (estimated 2–3 hours)

1. **Add Rule 13 to CLAUDE.md** — one-way rule, candidate workflow, slash-command index. (15 min)
2. **Create `wiki/candidates.md`** with empty schema. (5 min)
3. **Write `scripts/compile-2source-gate.mjs`** — wraps existing compile call, checks summary count per theme. (45 min)
4. **Write the four `.claude/commands/foundry-*.md`** files — Markdown command definitions that shell to `kb`. (30 min)
5. **Wire candidate-graduation + inbox-count into session-start opening status.** (20 min)
6. **Add hash-based ingest dedup** in `raw/.ingest-hashes.json`. (30 min)
7. **Add pre-commit hook** in personal vault blocking agent-authored commits. (10 min)
8. **Test end-to-end**: drop 3 fake clippings, run `/foundry-ingest` → `/foundry-compile` → `/foundry-ask` → `/foundry-lint`. Confirm 2-source gate behaves correctly (1 source → candidate; 2nd source dropped → graduation in next compile). (30 min)

## How this slots into the Workday pilot

Net effect for pilot devs:

- They see four obvious slash commands instead of a CLI manpage.
- The 2-source gate is a quality signal — concept pages aren't fabricated from a single Slack thread.
- The one-way rule means their personal Xpresso notes stay theirs; the team KB never silently rewrites them.
- Power users (you, Hermes) still get all the `kb` and MCP machinery underneath.

Which means: build this **before** the pilot. It makes the pitch demo crisper (one slash command per workflow beat) and lowers the cognitive load on first-day onboarding.

## Sources
- Foundry repo: https://github.com/jameesy/foundry-vault
- Foundry author article (provided in conversation)
- Existing `~/Agentic-KB/CLAUDE.md` — workflows, raw structure, schema
- Existing `~/Agentic-KB/cli/kb.js` — CLI verbs to wrap
