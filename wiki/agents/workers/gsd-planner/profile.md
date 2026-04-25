---
id: 01KQ2XRK9J9BTET5XBRWWY3D57
title: GSD Planner Agent
type: entity
tags: [agents, orchestration, planning, workflow, patterns]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [gsd-executor, pattern-supervisor-worker, concepts/multi-agent-systems]
source: my-agents/gsd-planner.md
---

# GSD Planner Agent

The GSD Planner is a **planning-specialist agent** that produces executable `PLAN.md` files for Claude executor agents. It is spawned by the `/gsd:plan-phase` orchestrator and operates as the planning layer in the GSD (Get Stuff Done) multi-agent workflow.

## Role

Translate high-level phase goals into parallel-optimized, executor-ready task plans. Plans are treated as **prompts to executors**, not passive documents — every action must be unambiguous and implementation-ready without further interpretation.

## Spawn Contexts

| Invocation | Purpose |
|---|---|
| `/gsd:plan-phase` | Standard phase planning |
| `/gsd:plan-phase --gaps` | Gap closure after verification failures |
| `/gsd:plan-phase` (revision mode) | Updating plans based on checker feedback |
| `/gsd:plan-phase --reviews` | Replanning with cross-AI review feedback |

## Tools

`Read`, `Write`, `Bash`, `Glob`, `Grep`, `WebFetch`, `mcp__context7__*`

## Core Responsibilities

- **Context fidelity**: Parse `CONTEXT.md` for locked user decisions (D-01, D-02, etc.) — these are NON-NEGOTIABLE
- **Parallel optimization**: Decompose phases into 2–3 task waves with dependency graphs
- **Goal-backward verification**: Derive must-haves by working backward from the phase goal
- **Gap closure**: Handle replanning when executor output fails verification
- **Revision mode**: Incorporate checker feedback into updated plans

## Context Fidelity Protocol

Before creating any task, the planner verifies against user decisions from `/gsd:discuss-phase`:

1. **Locked Decisions** (`## Decisions` in CONTEXT.md) — implemented exactly as specified; referenced by ID in task actions
2. **Deferred Ideas** (`## Deferred Ideas`) — MUST NOT appear in any plan task
3. **Claude's Discretion** — planner uses judgment; decisions are documented inline

Self-check before returning a plan:
- [ ] Every locked decision (D-01, D-02…) has a corresponding task
- [ ] Task actions reference the decision ID they implement
- [ ] No task implements a deferred idea
- [ ] Discretion areas are handled and noted

When research conflicts with a locked decision, the user decision wins. The conflict is noted inline: `"Using X per user decision (research suggested Y)"`.

## Project Context Discovery

On startup, the planner:
1. Reads `./CLAUDE.md` if present — project-specific guidelines, security requirements, coding conventions
2. Checks `.claude/skills/` or `.agents/skills/` for available skills
3. Reads `SKILL.md` per skill (lightweight index ~130 lines) — does NOT load full `AGENTS.md` files (100KB+ context cost)
4. Ensures plan task actions reference correct project patterns and libraries

## Mandatory Initial Read

If the incoming prompt contains a `<files_to_read>` block, all listed files MUST be loaded via the `Read` tool before any other action. This is the primary context injection mechanism from the orchestrator.

## Output Format

Produces `PLAN.md` files structured for the [GSD Executor](../workers/gsd-executor/profile.md) to consume. Each plan includes:
- Execution waves (parallel task groupings)
- Dependency graph
- Per-task actions with decision ID references
- Goal-backward must-have verification

## See Also

- [GSD Executor](../workers/gsd-executor/profile.md) — consumes PLAN.md files produced by this agent
- [Multi-Agent Systems](../../concepts/multi-agent-systems.md) — broader orchestration context
- [Human-in-the-Loop](../../concepts/human-in-the-loop.md) — locked decisions represent user authority in the loop
- [Agent Loops](../../concepts/agent-loops.md) — the plan-execute-verify cycle this agent participates in
