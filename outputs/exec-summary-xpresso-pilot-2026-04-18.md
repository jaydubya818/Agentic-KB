---
title: Xpresso AI Knowledge Base Pilot — Executive Summary
type: exec-brief
audience: executive sponsor
date: 2026-04-18
length: 1 page
status: draft
---

# Xpresso AI Knowledge Base Pilot
**Sponsor brief — 1 page · April 18, 2026**

## The ask
Approve an **8-week pilot** with **5–8 Xpresso developers** to deploy a two-layer AI knowledge system: a shared Xpresso team KB plus a personal "second brain" for each developer, both integrated into Claude Code via MCP.

## Why now
Xpresso is proprietary, evolving, and tribal. Onboarding takes weeks, expert time is the bottleneck, and answers live in scattered Confluence pages, Slack threads, and senior engineers' heads. LLMs alone hallucinate Xpresso syntax. **A compiled, auditable, internal-only KB lets every dev query Xpresso patterns at expert speed without leaking code outside Workday.**

## What we're piloting
- **Shared team KB** (forked from `Agentic-KB`) — Xpresso spec, idioms, ADRs, recipes, anti-patterns. Compiled by Claude into a cross-referenced wiki, queryable via CLI, web UI, and Claude Code.
- **Personal brain** (forked from `LLMwiki`) — local-only, git-reviewed second brain per developer for task-scoped context. Zero cloud, zero egress by default.
- **MCP integration** so both surfaces are available inside every Claude Code session.

## What success looks like (4-week measurement window)
- ≥ 3 KB queries per developer per week.
- ≥ 70% of answers rated "usable as-is or with edits."
- ≥ 2 merged contributions to the shared KB per developer.
- Median time-to-usable-answer < 30 seconds.
- Zero security findings.

## Risk posture
All LLM calls routed through Workday's approved internal gateway. Public LLM endpoints firewall-blocked at corp egress. Personal brain ships local-only with `.gitignore` template preventing accidental push. SSO replaces the open-source default PIN auth on the shared KB. InfoSec sign-off is gating before Phase 1.

## Cost
- **Eng:** ~3 weeks of one engineer to harden both forks + containerize.
- **Content:** ~1 week from a tech writer + SME to seed the initial corpus (target: ≥ 150 compiled wiki pages).
- **Pilot devs:** ~10% time over 4 weeks.
- **LLM gateway usage:** ~$50–$150 per dev per month at current token rates.

## Decision gates
- **Phase 0 → 1:** InfoSec approval, internal fork created, LLM gateway issued.
- **Pilot → wider rollout:** success metrics hit for 2 consecutive weeks, no P0 issues, ≥ 99% hosting uptime.

## What I need from you
1. Sponsor signoff to proceed to Phase 0.
2. Intro to the InfoSec reviewer and the internal LLM gateway owner.
3. Air cover to ask 5–8 Xpresso devs to commit ~10% of their time for 4 weeks.

## Detail
Full phased plan: [`outputs/pilot-xpresso-rollout-2026-04-18.md`](pilot-xpresso-rollout-2026-04-18.md)
