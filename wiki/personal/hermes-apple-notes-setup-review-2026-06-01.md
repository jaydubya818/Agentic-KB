---
title: Hermes Apple Notes Setup Review — 2026-06-01
type: personal
category: system-review
confidence: medium
date: 2026-06-01
tags: [hermes, apple-notes, obsidian, agentic, automation, bootstrap]
source: apple-notes-24h-review
---

# Hermes Apple Notes Setup Review — 2026-06-01

> Purpose: receipt for the latest 24-hour Apple Notes review and the Hermes / Obsidian updates applied from those notes.

## Source window

- Window reviewed: Apple Notes modified in the last 24 hours as of 2026-06-01 21:42 PDT.
- Notes extracted: 6.
- Unique URLs extracted: 8.
- Links fetched: 8.
- Fetch failures: 0.
- Local artifact: `/tmp/hermes_apple_notes_24h_20260601/review.md`.

## Strongest signal

The highest-signal source was a long-form CyrilXBT article: “How to Connect Obsidian + Hermes Agent Into One System That Thinks, Remembers, and Runs Your Life.” The durable idea is useful; several concrete setup commands in the article do not match Jay's installed Hermes Agent and should not be copied verbatim.

## What was applied

1. Added vault-aware operating routines to `wiki/personal/agent-bootstrap/hermes.md`:
   - morning brief
   - inbox processor
   - project health
   - connection finder
   - weekly synthesis
   - research converter
   - thinking partner

2. Reinforced the safety distinction:
   - personal Obsidian vault = durable business/strategy layer, writes require explicit path allow-listing, rollback, and receipts
   - Agentic-KB = engineering/system brain
   - Morning Review = Apple Notes / social intake and receipt loop
   - Hermes = orchestration, synthesis, verification, and packaging of repeated workflows

3. Created a personal-vault resource note:
   - `/Users/jaywest/Documents/Obsidian Vault/08 - Resources/2026-06-01 Apple Notes Hermes Obsidian System Review.md`

4. Updated personal-vault wiki notes:
   - `/Users/jaywest/Documents/Obsidian Vault/Wiki/Hermes.md`
   - `/Users/jaywest/Documents/Obsidian Vault/Wiki/Obsidian-Vault.md`

5. Updated canonical Hermes MissionControl plan:
   - `/Users/jaywest/hermes-harness-missioncontrol/docs/plans/2026-05-30-hermes-obsidian-operating-system-plan.md`

## What was rejected / deferred

- Do not point Filesystem MCP directly at Jay's personal vault as a blanket write surface from a social-post recipe.
- Do not restructure the personal vault into the article's generic folder scheme.
- Do not install `obsidian-second-brain` or any vault-rewriting repo without security/code review.
- Do not adopt personality-prompt material; Jay prefers concise, direct, operator-grade Hermes.

## Verification

- Morning Review extraction/fetch path successfully found 6 notes, 8 URLs, and 0 fetch errors.
- New personal-vault resource note has frontmatter and backlinks.
- Hermes bootstrap contains the new `Vault-aware operating routines` section.
- Targeted Morning Review tests passed after the related extractor fix.
- `hermes config check` passed.

## Related

- [[wiki/personal/agent-bootstrap/hermes]]
- [[wiki/personal/hermes-apple-notes-setup-review-2026-05-31]]
- [[wiki/personal/hermes-operating-context]]
