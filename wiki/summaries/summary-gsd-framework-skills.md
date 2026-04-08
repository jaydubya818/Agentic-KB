---
id: 01KNNVX2RDA8ADVTRS2QY25W7N
title: GSD Framework Skills (Combined)
type: summary
source_file: raw/my-agents/gsd-planner.md, raw/my-agents/gsd-executor.md, raw/my-agents/gsd-verifier.md, raw/my-agents/gsd-debugger.md, raw/my-agents/gsd-codebase-mapper.md
author: Jay West
date_ingested: 2026-04-04
tags: [agentic, claude-code, gsd, framework, orchestration, plan-execute-verify]
key_concepts: [plan-execute-verify, wave-execution, checkpoint-protocol, autonomous-deviation, goal-backward, context-budget, state-management]
confidence: high
---

# GSD Framework Skills (Combined)

## Framework Overview

GSD (Get Shit Done) is Jay's primary development framework for experimental MVPs and evolving-requirements projects. It is a multi-agent orchestration system built on Claude Code's Agent tool, organized around a repeating cycle:

```
/gsd:discuss-phase → /gsd:plan-phase → /gsd:execute-phase → /gsd:verify-work
```

Each step spawns specialized sub-agents. The orchestrator commands are skills; the workers are agents.

## Core Commands and Their Agents

| Command | Agent(s) Spawned | Purpose |
|---------|-----------------|---------|
| `/gsd:discuss-phase` | `gsd-advisor-researcher`, `gsd-assumptions-analyzer` | Clarify requirements, surface gray areas |
| `/gsd:plan-phase` | `gsd-planner`, `gsd-plan-checker` | Create PLAN.md files, verify plans before execution |
| `/gsd:execute-phase` | `gsd-executor` (one per plan wave) | Execute tasks with atomic commits |
| `/gsd:verify-work` | `gsd-verifier` | Goal-backward verification of phase outcomes |
| `/gsd:debug` | `gsd-debugger` | Scientific-method bug investigation |
| `/gsd:map-codebase` | `gsd-codebase-mapper` (4 parallel) | Build codebase analysis documents |

## Architectural Patterns

### Plan-Execute-Verify Triad

The three-agent core:
- **Planner:** Creates context-budget-aware PLAN.md files (2–3 tasks each, complete within 50% context)
- **Executor:** Executes tasks atomically with per-task commits, handles deviations via rules (Rules 1–4)
- **Verifier:** Goal-backward verification — trusts code, not SUMMARY claims

Separation enables specialization: the planner can optimize for research; the executor for implementation; the verifier for skeptical analysis. No single agent does all three.

### Wave-Based Parallel Execution

Plans within a phase are assigned to execution waves. Same-wave plans run in parallel (multiple executor instances); different-wave plans run sequentially. Dependencies are explicit in plan frontmatter (`depends_on`). This enables 2–4x speedup on phases with parallelizable work.

### State Machine Architecture

The GSD project state lives in `.planning/STATE.md`, managed by `gsd-tools.cjs`. State tracks: current phase/plan position, progress bar, decisions made, blockers found, performance metrics, session info. All agents update STATE.md through the shared tool — no agent tracks state in memory.

### Checkpoint Protocol

Three checkpoint types with different behaviors:
- `checkpoint:human-verify` (90% of cases) — Show user what was built, ask to verify
- `checkpoint:decision` (9%) — Present options table, wait for user selection
- `checkpoint:human-action` (1%) — Truly manual step (2FA code, email link)

In auto-mode (`workflow.auto_advance = true`): human-verify and decision checkpoints are skipped automatically; only human-action always stops.

### Deviation Autonomy

The executor handles unexpected findings without user permission for Rules 1–3 (bugs, missing critical functionality, blocking issues). Only Rule 4 (architectural changes) pauses for human input. This enables long autonomous runs without constant interruption while still escalating structural decisions.

## Key State Files

| File | Purpose | Owner |
|------|---------|-------|
| `.planning/ROADMAP.md` | Phase goals, success criteria, requirements | Planner reads |
| `.planning/STATE.md` | Current position, decisions, metrics | All agents update |
| `.planning/phases/XX/CONTEXT.md` | User decisions from discuss-phase | Planner enforces |
| `.planning/phases/XX/PLAN.md` | Task list with verification criteria | Executor consumes |
| `.planning/phases/XX/SUMMARY.md` | Execution record with commits | Verifier reads skeptically |
| `.planning/phases/XX/VERIFICATION.md` | Goal-backward verification report | Planner gap-closure input |
| `.planning/codebase/*.md` | Codebase analysis documents | Planner/executor reference |

## Philosophy

- **Ship Fast:** Plan → Execute → Ship → Learn → Repeat
- **Context Budget First:** Plans sized to complete within 50% context; quality degrades above 70%
- **Solo Developer Model:** No team, no ceremonies, estimate in Claude execution time
- **Autonomous by Default:** Rules 1–3 auto-fix; Rule 4 asks; auth gates pause gracefully

## Related Concepts

- [[wiki/summaries/summary-gsd-planner]]
- [[wiki/summaries/summary-gsd-executor]]
- [[wiki/summaries/summary-gsd-verifier]]
- [[wiki/summaries/summary-gsd-debugger]]
- [[wiki/summaries/summary-gsd-codebase-mapper]]
- [[wiki/personal/personal-jays-framework-philosophy]]

## Sources

- `raw/my-agents/gsd-planner.md`
- `raw/my-agents/gsd-executor.md`
- `raw/my-agents/gsd-verifier.md`
- `raw/my-agents/gsd-debugger.md`
- `raw/my-agents/gsd-codebase-mapper.md`
