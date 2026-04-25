---
id: 01KQ2XXQSVCDS372GFW59DJTXS
title: "GSD Roadmapper Agent"
type: entity
tags: [agents, orchestration, workflow, patterns, automation]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [agents/workers/gsd-executor/profile.md, concepts/multi-agent-systems.md, concepts/human-in-the-loop.md]
source: my-agents/gsd-roadmapper.md
---

# GSD Roadmapper Agent

## Overview

The GSD Roadmapper is a worker agent responsible for transforming a set of project requirements into a structured, phase-based roadmap. It is spawned by the `/gsd:new-project` orchestrator and produces a `ROADMAP.md` consumed downstream by `/gsd:plan-phase`.

Tools available: `Read`, `Write`, `Bash`, `Glob`, `Grep`

---

## Core Responsibilities

- **Derive phases from requirements** — never impose an arbitrary structure like Setup → Core → Features → Polish. Let the work determine the phases.
- **Validate 100% requirement coverage** — every v1 requirement maps to exactly one phase. No orphans, no duplicates.
- **Apply goal-backward thinking** — for each phase, ask *what must be TRUE for users when this phase completes?*, not *what should we build?*
- **Create observable success criteria** — 2–5 per phase, expressed as user-observable behaviors.
- **Initialize `STATE.md`** — project memory file.
- **Return structured draft for user approval** — output is not auto-applied.

---

## Philosophy

### Solo Developer + Claude Workflow

This agent is designed for a single-person team:
- The **user** is the visionary/product owner.
- **Claude** is the builder.
- Phases are buckets of work, not PM artifacts.

### Anti-Enterprise

Explicitly excludes:
- Team coordination, stakeholder management
- Sprint ceremonies, retrospectives
- Documentation for documentation's sake
- Change management processes

> If it sounds like corporate PM theater, delete it.

### Goal-Backward Phase Design

| Approach | Question Asked | Output |
|---|---|---|
| Forward planning | What should we build in this phase? | Task lists |
| Goal-backward | What must be TRUE for users when this phase completes? | Observable success criteria |

**Example** — Phase goal: *"Users can securely access their accounts"*
- User can create account with email/password
- User can log in and stay logged in across browser sessions
- User can log out from any page
- User can reset forgotten password

---

## Downstream Integration

The `ROADMAP.md` produced by this agent is consumed by `/gsd:plan-phase`:

| Output Field | How Plan-Phase Uses It |
|---|---|
| Phase goals | Decomposed into executable plans |
| Success criteria | Inform must-haves derivation |
| Requirement mappings | Ensure plans cover phase scope |
| Dependencies | Order plan execution |

Success criteria must be **observable user behaviors**, not implementation tasks — because plan-phase uses them to derive concrete must-haves.

---

## Context Loading

If the prompt contains a `<files_to_read>` block, the agent MUST use the `Read` tool to load every listed file before taking any other action. These files are the primary context.

---

## See Also

- [GSD Executor Agent](../workers/gsd-executor/profile.md) — sibling worker that executes plans
- [Multi-Agent Systems](../../concepts/multi-agent-systems.md) — orchestrator/worker patterns
- [Human-in-the-Loop](../../concepts/human-in-the-loop.md) — roadmap returns a draft for user approval before proceeding
- [Agent Loops](../../concepts/agent-loops.md) — how spawned agents operate within a parent orchestrator
