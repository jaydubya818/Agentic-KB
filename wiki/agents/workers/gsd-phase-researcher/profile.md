---
id: 01KQ2XNHG6QHHE7D28YNEK8A44
title: "GSD Phase Researcher"
type: entity
tags: [agents, orchestration, workflow, research, gsd]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [agents/workers/gsd-executor/profile.md, agents/leads/planning-agent/profile.md]
---

# GSD Phase Researcher

A specialised worker agent in the GSD (Get Stuff Done) pipeline. Its sole job is to answer **"What do I need to know to plan this phase well?"** and produce a `RESEARCH.md` file consumed by the downstream `gsd-planner`.

## Role

Spawned in two modes:
- **Integrated**: called by `/gsd:plan-phase` orchestrator as part of the plan-phase flow
- **Standalone**: called directly via `/gsd:research-phase`

## Tools Available

`Read`, `Write`, `Bash`, `Grep`, `Glob`, `WebSearch`, `WebFetch`, `mcp__context7__*`, `mcp__firecrawl__*`, `mcp__exa__*`

## Core Responsibilities

1. Read any files listed in a `<files_to_read>` block **before** any other action
2. Discover project context from `CLAUDE.md` and `.claude/skills/` or `.agents/skills/`
3. Investigate the phase's technical domain — treat internal knowledge as a hypothesis (training data is 6–18 months stale)
4. Identify standard stack, patterns, and pitfalls
5. Document findings with confidence levels: `HIGH`, `MEDIUM`, `LOW`
6. Write `RESEARCH.md` in the format the planner expects
7. Return a structured result to the orchestrator

## RESEARCH.md Structure

The researcher writes `RESEARCH.md` with the following sections, consumed by `gsd-planner`:

| Section | Planner Use |
|---|---|
| `## User Constraints` | **CRITICAL — planner must honour; copied verbatim from CONTEXT.md** |
| `## Standard Stack` | Libraries to use — no alternatives |
| `## Architecture Patterns` | Task structure |
| `## Don't Hand-Roll` | Problems solved by existing libraries |
| `## Common Pitfalls` | Used in verification steps |
| `## Code Examples` | Referenced in task actions |
| `## Project Constraints (from CLAUDE.md)` | Directives from project instructions |

> **`## User Constraints` MUST be the first content section** in `RESEARCH.md`. Locked decisions, discretion areas, and deferred ideas are copied verbatim from `CONTEXT.md`.

## Upstream Input: CONTEXT.md

If `CONTEXT.md` exists (produced by `/gsd:discuss-phase`), the researcher is constrained:

- `## Decisions` — locked choices; research these, not alternatives
- `## Claude's Discretion` — freedom areas; research options and recommend
- `## Deferred Ideas` — out of scope; ignore completely

## Philosophy: Training as Hypothesis

> Training data is 6–18 months stale. Treat pre-existing knowledge as hypothesis, not fact.

The researcher is expected to use live web tools (`WebSearch`, `WebFetch`, `mcp__exa__*`, etc.) to verify current best practices rather than relying solely on model weights.

## Output Style

**Prescriptive, not exploratory.** "Use X" — not "Consider X or Y."

## See Also

- [GSD Executor](../gsd-executor/profile.md)
- [Planning Agent Profile](../../leads/planning-agent/profile.md)
- [Multi-Agent Systems](../../../concepts/multi-agent-systems.md)
- [Context Management](../../../concepts/context-management.md)
