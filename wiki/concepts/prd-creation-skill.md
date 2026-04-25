---
id: 01KQ2Z8969NX8FY31Z5YCK3EEP
title: "PRD Creation Skill"
type: concept
tags: [agents, workflow, automation, patterns, architecture]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [pattern-supervisor-worker, agent-loops, human-in-the-loop]
source: my-skills/prd-creator-skill.md
---

# PRD Creation Skill

A structured agent skill that transforms a rough software idea into a comprehensive Product Requirements Document (PRD) and a developer-ready implementation task list.

## Definition

The PRD Creator Skill is a multi-phase agentic workflow designed to assist beginner-level developers in formalising software ideas. It combines structured questioning, competitive research, document generation, and task decomposition into a single coherent process.

## Why It Matters

Many developers struggle to bridge the gap between a vague idea and an actionable implementation plan. This skill provides a repeatable process that ensures requirements are captured, validated, and broken into granular, verifiable tasks before any code is written — reducing ambiguity and rework.

## Structure

The skill is divided into four parts:

### Part 1 — Implementation Description
- Receives a rough description from the user
- Infers intent and fills architectural gaps
- Sets the foundation for structured questioning

### Part 2 — PRD Creation (`PRD.md`)
- Asks clarifying questions using the `AskUserQuestion` tool
- Creates an executive summary for user approval
- Researches the competitive landscape via `WebSearch`
- Generates a comprehensive `PRD.md` covering:
  - App overview and objectives
  - Target audience
  - Success metrics and KPIs
  - Competitive analysis
  - Core features and user flows
  - Technical stack recommendations
  - Security considerations
  - Assumptions and dependencies
- Iterates based on user feedback

### Part 3 — Implementation Task Generation (`JSON.md`)
- Analyses the completed, approved PRD
- Generates a `tasks.json` file with granular tasks
- Each task must be completable in **≤10 minutes**; complex tasks are split
- Categorises tasks by type: `functional`, `ui-ux`, `api-endpoint`, `security`, etc.
- Defines a `pass` (verification) criterion per task

### Part 4 — Overall Summary (`SUMMARY.md`)
- Reads the completed PRD
- Writes a concise `PROJECT_ROOT/.agent/prd/SUMMARY.md` containing:
  - Overall project description
  - Main features
  - Key user flows
  - Short list of key requirements

## Example

> User: "I want to build a task manager app for small teams."

1. Agent asks clarifying questions (team size, integrations, auth model, etc.)
2. Agent generates executive summary → user approves
3. Agent researches Trello, Linear, Asana as competitive context
4. Agent writes `PRD.md` with full specifications
5. Agent generates `tasks.json` with ~50 granular tasks, each with a `pass` criterion
6. Agent writes `SUMMARY.md` for downstream agents to consume

## Quick Start

| Goal | Action |
|---|---|
| Create a new PRD | Read `PRD.md`, follow workflow, then offer task generation |
| Generate tasks for existing PRD | Read `JSON.md`, read the PRD, generate `tasks.json` |
| Do both | PRD first → user approval → task generation |

## See Also

- [Agent Loops](agent-loops.md) — the iterative structure this skill runs within
- [Human-in-the-Loop](human-in-the-loop.md) — approval gates used between PRD and task generation
- [Context Management](context-management.md) — managing PRD document state across skill phases
