---
title: "Nous Research Hermes vs Jay's Hermes Orchestrator"
type: evaluation
tags: [hermes, orchestration, agentic, mobile, open-source]
created: 2026-05-16
updated: 2026-05-16
reviewed: false
reviewed_date: ""
---

# Nous Research Hermes vs Jay's Hermes Orchestrator

## What's Being Compared

**Candidate A — Nous Research Hermes:** Open-source agent framework (MIT, ~140K GitHub stars). Always-on agent with five pillars: Memory, Skills, Soul, Crons, Self-Improving Loop. Interfaces: Telegram, Discord. Built by Nous Research (known for open-weight LLMs). Nate Herk breakdown: full setup, API key handling, cron scheduling, dashboard, scaling rules.

**Candidate B — Jay's Hermes (`~/.claude/agents/hermes.md`):** Claude-based orchestrator agent. Routes work across 10 portfolio work lanes. Reads portfolio context from Agentic-KB on session start. Delegates to specialists (gsd-*, security-reviewer, etc.). Produces decision-ready artifacts. Runs inside Claude Code sessions — not always-on.

## Evaluation Criteria

| Dimension | Weight | Why |
|-----------|--------|-----|
| Orchestration capability | High | Core routing function |
| Always-on / async operation | Medium | Cron tasks, background work |
| Mobile / Telegram interface | Medium | Capture on-the-go |
| Portfolio-awareness | High | Jay's primary need |
| Maintenance burden | Medium | Open source vs. managed |
| Self-improvement loop | Low | Nice-to-have |

## Scorecard

| Dimension | Nous Hermes | Jay's Hermes |
|-----------|-------------|--------------|
| Orchestration capability | 🟡 Generic routing | 🟢 Portfolio-specific, 10 lanes |
| Always-on / async | 🟢 Native crons, persistent | 🔴 Session-scoped only |
| Mobile / Telegram | 🟢 Built-in | 🔴 None |
| Portfolio-awareness | 🔴 Requires full setup | 🟢 Native (reads Agentic-KB) |
| Maintenance burden | 🟡 Self-host required | 🟢 Zero (runs in Claude Code) |
| Self-improvement loop | 🟢 Built-in | 🔴 Manual |

## Summary Verdict

These are not the same category of tool. **Nous Research Hermes is an always-on mobile-first personal agent platform. Jay's Hermes is a session-scoped orchestration pattern inside Claude Code.** They solve different problems and are additive, not competitive.

The most valuable features Nous Hermes offers that Jay's stack lacks:

1. **Telegram capture interface** — Lets you send ideas, links, and tasks from your phone directly into the agent pipeline. Right now, Apple Notes KB Inbox is the closest analog, but it's an extra step. Telegram → Hermes → Agentic-KB would be a tighter loop.
2. **Cron scheduling** — Persistent scheduled tasks without needing Claude Code open. The midday-checkpoint and EOD wrap-up SKILL.md drafts in morning-review/ are currently manual triggers; Nous Hermes would run them automatically.
3. **Self-improving loop** — Hermes can update its own skills after each session. Jay's stack has this manually (memory system, skill graduation) but not automated.

**What Nous Hermes does NOT offer:** Portfolio-aware routing across Jay's specific repos and work lanes. That stays in Jay's Hermes.

## Recommendation

**Do not replace Jay's Hermes.** Evaluate Nous Hermes as a **mobile capture and cron layer** sitting in front of the existing stack:

```
Phone → Telegram → Nous Hermes → [capture to Agentic-KB raw/clippings/] → morning-review pipeline
```

Specific features worth adopting:
- Telegram bot → KB Inbox replacement (tighter than Apple Notes)
- Cron runner for midday-checkpoint + EOD wrap-up (instead of manual `/schedule`)
- Memory pillars pattern (Soul = persona, Memory = context, Skills = actions) as a framework for cleaning up Jay's Hermes agent definition

**Risk:** Self-hosting adds ops burden. Assess after the morning-review Phase 2 (orchestrator) is stable — don't add infrastructure while the pipeline is still being hardened.

## When to Re-evaluate

- After morning-review Phase 2 (orchestrator) is live and stable
- If Apple Notes KB Inbox capture becomes unreliable
- If Telegram usage increases naturally (if you're already using it for other things, adding Hermes is nearly free)

## Sources

- `[[wiki/summaries/summary-nate-herk-llm-wiki]]` — Nate Herk breakdown of Nous Hermes
- `[[wiki/personal/hermes-operating-context]]` — Jay's Hermes current state
- Daily note 2026-05-11 — original pipeline finding that surfaced this eval
