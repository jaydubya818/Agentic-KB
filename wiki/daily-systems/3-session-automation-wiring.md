---
title: 3-Session Daily Automation — Wiring Guide
type: recipe
category: daily-systems
date: 2026-05-16
status: ready-to-wire
reviewed: false
reviewed_date: ""
tags: [automation, daily-review, scheduling, claude-cowork]
---

# 3-Session Daily Automation — Wiring Guide

SKILL.md drafts are complete at `/Users/jaywest/morning-review/scheduled-tasks/`. This doc is the wiring checklist to activate them.

## Sessions

| Session | Skill file | Recommended time | Status |
|---------|-----------|-----------------|--------|
| Morning | `morning-review-daily/` (already active) | 06:00–08:00 | ✅ Live |
| Midday checkpoint | `midday-checkpoint/SKILL.md` | 13:30 | ⬜ Not wired |
| EOD wrap-up | `eod-wrap-up/SKILL.md` | 18:00 | ⬜ Not wired |

## Option A — Wire via `/schedule` skill (recommended)

Run inside a Claude Code session:

```
/schedule
```

When prompted, create two tasks:

**Task 1: Midday checkpoint**
- Schedule: `30 13 * * 1-5` (weekdays 13:30)
- Prompt: `Run the midday checkpoint per /Users/jaywest/morning-review/scheduled-tasks/midday-checkpoint/SKILL.md`
- Working dir: `/Users/jaywest/Agentic-KB`

**Task 2: EOD wrap-up**
- Schedule: `0 18 * * 1-5` (weekdays 18:00)
- Prompt: `Run the EOD wrap-up per /Users/jaywest/morning-review/scheduled-tasks/eod-wrap-up/SKILL.md`
- Working dir: `/Users/jaywest/Agentic-KB`

## Option B — Wire via Cowork scheduled tasks

If running Cowork with persistent sessions:
1. Open Cowork settings → Scheduled Tasks
2. Add midday: cron `30 13 * * 1-5`, prompt as above
3. Add EOD: cron `0 18 * * 1-5`, prompt as above

## What each session does (brief)

**Midday checkpoint** (< 2 min):
- Stages any Apple Notes / Snipd captures since morning
- Runs morning-review with `--skip-obsidian --skip-github --skip-memory`
- Appends `## ☀️ Midday Checkpoint` section to today's daily note
- No wiki writes, no link crawling

**EOD wrap-up** (3–5 min):
- Pulls today's git commits across active repos
- Pulls merged PRs via `gh`
- Pulls open findings from registry
- Synthesizes via LLM (uses no-sycophancy system prompt)
- Appends `## 🌙 EOD Wrap-up` section to daily note
- Writes tomorrow's priority to `MorningReview/sandbox/YYYY-MM-DD-priority.md`

## Pre-flight checklist

Before wiring, verify:

- [ ] `morning-review/.env` has all required keys (ANTHROPIC_API_KEY, etc.)
- [ ] `morning-review/prompts/no_sycophancy_expert_system.md` exists
- [ ] `~/MorningReview/registry/open_findings.json` exists (created by morning run)
- [ ] `gh` CLI is authenticated (`gh auth status`)
- [ ] Today's daily note path resolves: `~/Documents/Obsidian Vault/Daily Notes/$(date +%Y-%m-%d).md`

## Refuse list (both sessions inherit these)

- No wiki/ writes
- No orchestrator calls
- No auto-commit or auto-push
- No closing/deferring open findings
