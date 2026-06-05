---
title: Hermes Apple Notes Setup Review — 2026-05-31
type: personal
category: system-review
confidence: medium
date: 2026-05-31
tags: [hermes, apple-notes, agentic, bootstrap, skills, orchestration]
source: apple-notes-24h-review
---

# Hermes Apple Notes Setup Review — 2026-05-31

> Purpose: receipt for the 24-hour Apple Notes review and the reversible Hermes setup updates applied from those notes.

## Source window

- Window reviewed: Apple Notes modified in the last 24 hours as of 2026-05-31 18:07 PDT.
- Notes reviewed: 6.
- URLs extracted: 7.
- X fetch result: 7 fetched, 0 fetch failures via Morning Review's `x_fetcher` path.

## Signals found

### 1. Claude/Hermes as a layered operating system

Source note: `Most developers think Claude Code is an AI coding assistant.`

Extracted setup model:
1. Memory/context layer.
2. Skills layer.
3. Deterministic hooks/reliability layer.
4. Subagents/delegation layer.
5. Plugins/packaged workflows layer.

Applied update:
- Added a `Hermes OS layer gate` to `wiki/personal/agent-bootstrap/hermes.md`.
- The gate makes Hermes decide when to use memory, skills, deterministic verification, subagents, and packaging.

### 2. Research stack: Claude Code + NotebookLM + Obsidian

Source URL: https://x.com/monokern/status/2061044198418031017?s=12&t=fcXBCVH-nfzVNcuNbbXiSw

Extracted setup model:
- Claude Code / Hermes as execution engine.
- Skills as reusable customization layer.
- NotebookLM as optional high-volume research analysis engine.
- Obsidian / Agentic-KB as durable markdown memory.

Applied update:
- Added an `Apple Notes / research capture lane` to Hermes bootstrap: saved posts are weak signals, links must be fetched, classified, applied only if reversible, and recorded with receipts.

Deferred recommendation:
- Build a separate `NotebookLM research bridge` only after a security/auth review. NotebookLM automation requires Google auth and should not be silently wired into Hermes.

### 3. Skill ecosystem as operating leverage

Source URL: https://x.com/polydao/status/2060715587387400424?s=12&t=fcXBCVH-nfzVNcuNbbXiSw

Extracted setup model:
- Skills are not prompts; they are reusable operating workflows.
- Useful ecosystems include official Anthropic skills, curated skill registries, and workflow-heavy repos.

Applied update:
- Added packaging guidance to the Hermes OS gate: recurring workflows should become skills, cron jobs, hooks, or documented recipes.

Deferred recommendation:
- Add a monthly skill-radar job that scans trusted skill sources, summarizes candidates, and requires review before install. Do not auto-install skills from social links.

### 4. Hermes-specific memory + skills + scheduler signal

Source URL: https://x.com/neil_xbt/status/2060907868182966479?s=12&t=fcXBCVH-nfzVNcuNbbXiSw

Extracted setup model:
- Persistent memory.
- Reusable skills.
- Scheduler / autonomous recurrence.

Applied update:
- The Hermes OS layer gate now explicitly routes repeated workflows to skills or cron jobs instead of leaving them as one-off chat instructions.

### 5. Implementation loop: goal → phases → test → code → review → simplify → run

Source URL: https://x.com/voxyz_ai/status/2061037162166944245?s=12&t=fcXBCVH-nfzVNcuNbbXiSw

Applied update:
- Added an `Execution-quality loop` to `wiki/personal/agent-bootstrap/hermes.md`.

### 6. Agentic orchestration layer

Source URL: https://x.com/mckinsey/status/2060451366917505221?s=12&t=fcXBCVH-nfzVNcuNbbXiSw

Extracted setup model:
- Hermes should operate as an orchestration layer across agents, systems, and data connections — not as a passive assistant.

Applied update:
- Reinforced Hermes as the synthesis owner: subagents can execute lanes, but Hermes owns final decision-ready artifacts.

### 7. Vault/MCP safety correction

Source: Jay's clarification during this session.

Applied update:
- Corrected `wiki/personal/agent-bootstrap/universal.md` so it no longer claims `mcp__obsidian__*` points at the personal Obsidian vault.
- Documented the current safe default:
  - `mcp__obsidian__*` writes Agentic-KB.
  - `/Users/jaywest/Documents/Obsidian Vault/` is read-only to agents via file/search tools unless Jay explicitly overrides.

## Files changed

- `wiki/personal/agent-bootstrap/hermes.md`
- `wiki/personal/agent-bootstrap/universal.md`
- `wiki/personal/hermes-apple-notes-setup-review-2026-05-31.md`

## Verification performed

- Apple Notes 24h extraction preserved short/social notes with href-only URLs.
- X content fetch path returned 7 fetched links and 0 fetch failures for the current 24h note set.
- Bootstrap files were re-read after patching to verify the new sections exist.

## Additional recommendations

1. Add a `Hermes weekly skill radar` cron job.
   - Input: trusted skill repos + Hermes skills hub.
   - Output: candidates, risks, usefulness, install recommendation.
   - Guardrail: no auto-install.

2. Add a `saved-social-post receipt` artifact to Morning Review.
   - For every Apple Notes link: source note, URL, fetch status, classification, action taken, deferred reason.
   - This prevents silent `0 links` regressions.

3. Add a deterministic hook/check for Hermes setup edits.
   - Before any bootstrap/config edit is considered complete, verify: file exists, expected section present, no personal vault write path introduced, and at least one test/receipt exists.

4. Consider a NotebookLM bridge as a separate reviewed project.
   - Useful for high-volume research synthesis.
   - Do not wire until auth, privacy, and export behavior are explicit.

5. Package this review workflow as a Hermes skill if it recurs.
   - Trigger: “review my Apple Notes and apply useful setup updates.”
   - Steps: manifest → selective body export → link fetch → classify → reversible edits → verification receipt.

## Related

- [[wiki/personal/agent-bootstrap/hermes]]
- [[wiki/personal/agent-bootstrap/universal]]
- [[wiki/personal/hermes-operating-context]]
- [[recipes/recipe-local-research-engine]]
