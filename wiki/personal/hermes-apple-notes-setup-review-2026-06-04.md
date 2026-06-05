---
title: Hermes Apple Notes Setup Review — 2026-06-04
type: personal
category: system-review
confidence: medium
date: 2026-06-04
tags: [hermes, apple-notes, obsidian, second-brain, agentic, automation, bootstrap]
source: apple-notes-72h-review
---

# Hermes Apple Notes Setup Review — 2026-06-04

> Purpose: receipt for the 72-hour Apple Notes review and the Hermes / Obsidian / second-brain setup updates applied from those notes.

## Source window

- Window reviewed: Apple Notes modified in the last 72 hours as of 2026-06-04 22:52 PDT.
- Notes extracted: 14.
- Unique URLs extracted: 32.
- Links fetched through `x-cli tweet get`: 32.
- Fetch failures: 0 through `x-cli`.
- `x_search` status: unavailable due xAI/Grok spending-limit error, so `x-cli` was used as the verified fallback.
- Local artifacts:
  - `/tmp/apple-notes-hermes-obsidian-72h-20260604-225244/notes.json`
  - `/tmp/apple-notes-hermes-obsidian-72h-20260604-225244/x_fetch.json`
  - `/tmp/apple-notes-hermes-obsidian-72h-20260604-225244/urls.txt`

## Strongest signals

The strongest cluster repeated the same theme from multiple sources: Hermes + Obsidian only works as an operating system when capture, retrieval, synthesis, action, and receipts are all explicit. The useful update is not to restructure the vault; it is to tighten Jay's actual split:

- Personal Obsidian vault = durable human-readable business / strategy layer.
- Agentic-KB = engineering and system brain.
- Apple Notes / Morning Review = social capture and review-packet loop.
- Hermes = orchestrator, verifier, scheduler, workflow packager.
- Sofie = bounded business writeback bridge with preview, dedupe, contradiction gates, and receipts.

## Applied updates

1. Updated `wiki/personal/agent-bootstrap/hermes.md` with a new 72-hour Apple Notes operating delta:
   - use Kanban/MissionControl for 3+ step implementation work;
   - treat Dreaming / proposal inbox outputs as review packets, not automatic writes;
   - perform skill/tool audits before adding more automation;
   - prefer loops and workflow packaging over one-off prompting;
   - keep the second brain as a six-layer system: capture → retrieval → synthesis → action → audit → improvement.

2. Updated `wiki/personal/agent-bootstrap/universal.md` so Sofie close-task guidance matches the hardened writeback surface:
   - `memoryUpdate` is part of the payload shape;
   - `dry-run-close-task` is required for vault-affecting payloads;
   - dry-runs expose allowlist, dedupe, contradiction, review, and receipt fields.

3. Updated the personal vault resource / wiki layer:
   - created `/Users/jaywest/Documents/Obsidian Vault/08 - Resources/2026-06-04 Apple Notes Hermes Obsidian Second Brain Review.md`;
   - updated `/Users/jaywest/Documents/Obsidian Vault/Wiki/Hermes.md`;
   - updated `/Users/jaywest/Documents/Obsidian Vault/Wiki/Obsidian-Vault.md`;
   - updated `/Users/jaywest/Documents/Obsidian Vault/Wiki/Morning-Review-System.md`.

4. Updated the MissionControl plan:
   - `/Users/jaywest/hermes-harness-missioncontrol/docs/plans/2026-05-30-hermes-obsidian-operating-system-plan.md` now records the 72-hour review and x-cli fallback evidence.

## Rejected / deferred

- Do not copy “one command under $20/mo” social setup recipes into Jay's system.
- Do not broaden MCP/filesystem write access to the personal vault.
- Do not install any vault-rewriting “second brain” repo without staging, code review, path allowlists, rollback, and receipts.
- Do not adopt desktop/dashboard/Kanban/Dreaming solely because social posts hype them; use them only when they improve an active workflow.
- Do not disable tools or skills blindly from a token-cost post; audit real enabled toolsets first.

## Source highlights

- `2062644142358839341` / `2061715750356979996`: Obsidian + Hermes as personal operating system. Applied as a split-surface model, not a vault rewrite.
- `2062442536984359069`: unified research stack with Telegram capture and weekly synthesis. Applied as Morning Review + weekly/monthly workflow-mining reinforcement.
- `2062252953981812997` / `2061518744070062276`: Hermes Kanban as bus + audit log. Applied as the 3+ task durable-state rule.
- `2061973646961197248`: Hermes Dreaming as human-reviewable proposal inbox. Applied as review-packet guidance, not auto-apply.
- `2061903428482392538`: Company Brain layers. Applied as second-brain six-layer operating gate.
- `2061579802788966660` / `2061550447945531464`: skill/tool audit and token hygiene. Applied as an audit-before-enable rule.

## Verification

- Apple Notes export used JXA with HTML + plaintext capture; 14 recent notes found.
- URL extraction found 32 unique X URLs, including HTML-only Apple Notes captures.
- `x-cli tweet get` fetched all 32 URLs successfully.
- `hermes --version` verified current Hermes Agent v0.15.1 after update.
- `hermes update --check` reported already up to date.
- `hermes status --all` showed gateway running via launchd.
- Changed files were checked by direct file reads after writing.

## Related

- [[wiki/personal/agent-bootstrap/hermes]]
- [[wiki/personal/agent-bootstrap/universal]]
- [[wiki/personal/hermes-apple-notes-setup-review-2026-06-01]]
- [[wiki/personal/hermes-operating-context]]
