---
id: 01KNNVX2RF2B2F3NB05WVZTT1Z
title: Superpowers Framework
type: summary
source_file: raw/my-agents/superpowers-code-reviewer.md
author: Jay West
date_ingested: 2026-04-04
tags: [agentic, claude-code, superpowers, framework, tdd, verification, iron-laws]
key_concepts: [iron-laws, tdd-first, verification-before-completion, subagent-driven-development, two-stage-review, root-cause-requirement]
confidence: high
---

# Superpowers Framework

## Framework Overview

Superpowers is Jay's high-stakes feature framework — used when edge cases are costly (auth, payments, agentic systems). It is TDD-first, iron-law driven, and requires two-stage review at each implementation step. Best for: features where a wrong implementation is not easily undone.

From CLAUDE.md: "High-stakes feature (auth, payments, agents) → Superpowers (TDD + verification)"

## Core Iron Laws (Non-Negotiable)

1. **No production code without a failing test first.** Delete code written before the test.
2. **No fixes without root cause investigation.** Symptom fixes are failure.
3. **No completion claims without fresh verification evidence.** Run the command in *this* message.
4. **If a skill might apply (even 1% chance), invoke it.** No rationalization.

These are framed as "iron laws" — violations invalidate work regardless of outcome.

## Skill Set

Superpowers is implemented as a collection of skills in `~/.claude/skills/superpowers/`:

| Skill | When to Use |
|-------|-------------|
| `test-driven-development` | Any new feature or bugfix |
| `systematic-debugging` | Any bug or unexpected behavior |
| `brainstorming` | Before any creative/feature work |
| `writing-plans` | After spec, before touching code |
| `subagent-driven-development` | Executing plans with independent tasks |
| `dispatching-parallel-agents` | 2+ independent failures |
| `verification-before-completion` | Before any "done" claim or PR |
| `finishing-a-development-branch` | After all tests pass |
| `using-git-worktrees` | Isolation for risky changes |
| `requesting-code-review` | After implementation |
| `receiving-code-review` | When review feedback arrives |

## Workflow

```
Brainstorm → Write Design Doc → Write Plan → Subagent-Driven-Dev → Verification → Finish Branch
```

Each implementation task goes through two reviews:
1. **Spec review** — does the implementation match the plan?
2. **Quality review** — does it meet engineering standards?

The superpowers-code-reviewer agent handles plan alignment; the regular code-reviewer handles quality.

## TDD in Superpowers

Red-Green-Refactor is strictly enforced:
- **RED:** Write failing test first. Commit with `test(...)`. Must actually fail.
- **GREEN:** Write minimal code to pass. Commit with `feat(...)`. Must actually pass.
- **REFACTOR:** Clean up only. Must still pass. Commit only if changes made.

Unlike the GSD executor (which has TDD as an optional `tdd="true"` task attribute), Superpowers treats TDD as the default for everything.

## Key Differentiator from GSD

| Dimension | GSD | Superpowers |
|-----------|-----|-------------|
| Test requirement | Optional (TDD flag per task) | Mandatory (iron law) |
| Root cause | Deviation rules auto-fix | Must investigate before fixing |
| Verification | After phase completion | Before any "done" claim |
| Scope | Full feature cycles | High-stakes features only |
| Failure tolerance | Autonomous recovery (Rules 1–3) | Stop and investigate |

## Superpowers Code Reviewer Agent

The `superpowers-code-reviewer` agent is the Superpowers-native reviewer — it adds plan alignment checking on top of quality review. It uses `model: inherit` (takes spawner's model) and its description includes verbatim example dialogues showing when to invoke it. This is the most elaborate trigger description in Jay's agent set.

## Related Concepts

- [[wiki/personal/personal-jays-framework-philosophy]]
- [[wiki/summaries/summary-gsd-framework-skills]]
- [[wiki/summaries/summary-code-reviewer-agent]]

## Sources

- `raw/my-agents/superpowers-code-reviewer.md`
- `/Users/jaywest/.claude/CLAUDE.md` (framework selection section)
