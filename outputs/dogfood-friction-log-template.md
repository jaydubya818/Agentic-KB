---
title: Rollout Friction Log — Dogfood Run
type: log-template
date: 2026-04-18
purpose: Capture every friction point during clean-room install so onboarding docs are tight before pilot
---

# Rollout Friction Log — Dogfood Run

> Run this from a fresh macOS user account or a vanilla VM. Log everything that surprises you, breaks, or takes longer than 30 seconds to figure out. **No friction is too small** — a typo in the install script costs 8 devs 5 minutes each.

## Test environment

- Machine: <Apple Silicon / Intel, macOS version>
- Account type: <fresh user / VM / existing>
- Network: <corp wifi / VPN / home>
- Date / time started: <YYYY-MM-DD HH:MM>
- Tester: Jay
- Forks under test:
  - Agentic-KB commit: `<git rev-parse HEAD>`
  - LLMwiki commit: `<git rev-parse HEAD>`

## Phase 1 — Prerequisites

| Step | Result | Friction (severity 1-3) | Notes |
|---|---|---|---|
| Install Node 20+ | | | |
| Install git | | | |
| Install Claude Desktop | | | |
| Install Obsidian (optional) | | | |
| Get Anthropic API key | | | |
| Get OpenAI / gateway URL | | | |

## Phase 2 — `team-setup.sh` execution

| Step | Time taken | Result | Friction | Notes |
|---|---|---|---|---|
| Run install one-liner | | | | |
| API key prompts | | | | |
| Path prompts | | | | |
| Obsidian vault prompt | | | | |
| Folder creation | | | | |
| Repo clones | | | | |
| `npm install` (Agentic-KB web) | | | | |
| `npm install` (LLMwiki) | | | | |
| `npm link` for `kb` | | | | |
| `npm link` for `brain` | | | | |
| MCP config write | | | | |
| Claude Desktop restart | | | | |

**Total install wall-clock:** `___ minutes` (target < 30)

## Phase 3 — First-use validation

| Action | Worked? | Latency | Friction | Notes |
|---|---|---|---|---|
| `kb query "what is the fan-out worker pattern?"` | | | | |
| `kb search "supervisor"` | | | | |
| Open `http://localhost:3002` in browser | | | | |
| `brain ask "what's on my plate?"` (after seeding) | | | | |
| `brain dashboard` opens at `:3847` | | | | |
| Claude Code sees `agentic-kb` MCP tools | | | | |
| Claude Code sees `second-brain` MCP tools | | | | |
| Same query in Claude Code returns same answer | | | | |

## Phase 4 — Egress proof

| Test | Expected | Actual | Pass/Fail |
|---|---|---|---|
| Block `api.anthropic.com` via pf, run `kb query` | works via proxy | | |
| Block `api.openai.com`, run `brain ask` | works via proxy | | |
| `tcpdump` during compile shows no public LLM traffic | zero packets | | |
| Audit log shows correct gateway URL | gateway hostname | | |

## Phase 5 — Workflow test (3 canonical flows)

For each, record: time-to-completion, did it work, screenshot path.

1. **Query shared KB from terminal** → `kb query "..."`
   - Time: ___ s · Worked: Y/N · Screenshot: `screenshots/01-kb-query.png`
2. **Ask same question in Claude Code (via MCP)**
   - Time: ___ s · Worked: Y/N · Screenshot: `screenshots/02-cc-mcp.png`
3. **Capture personal note → diff → approve loop**
   - Time: ___ s · Worked: Y/N · Screenshot: `screenshots/03-brain-diff.png`

## Severity rubric

- **1 — minor** : confusing wording, ugly output, easy workaround
- **2 — major** : requires hand-editing a file, googling, or a >5-min fix
- **3 — blocker** : new dev cannot finish without my help

## Open issues to fix before pilot

| # | Severity | What | Where it lives | Owner | Status |
|---|---|---|---|---|---|
| 1 | | | | Jay | open |
| 2 | | | | Jay | open |
| 3 | | | | Jay | open |

## Decision

- [ ] **Green** — onboarding is tight enough; proceed to internal pitch.
- [ ] **Yellow** — fix top 3 severity-2/3 items, re-run, then proceed.
- [ ] **Red** — material blockers; rework before pitching.

**Verdict:** _______
**Date:** _______
