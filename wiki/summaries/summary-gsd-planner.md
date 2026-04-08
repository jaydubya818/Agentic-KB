---
id: 01KNNVX2RD9QDFMBR8A4ZC7T81
title: GSD Planner Agent
type: summary
source_file: raw/my-agents/gsd-planner.md
author: Jay West
date_ingested: 2026-04-04
tags: [agentic, claude-code, agent-definition, gsd, planning, goal-backward, context-budget]
key_concepts: [goal-backward-planning, context-budget, discovery-levels, plan-as-prompt, wave-execution, dependency-graph, user-decision-fidelity]
confidence: high
---

# GSD Planner Agent

## Key Purpose

Creates executable PLAN.md files that Claude executors can implement without interpretation. Spawned by `/gsd:plan-phase`. Handles both standard planning and gap-closure mode (when verifier finds gaps). The core philosophy: **"Plans are prompts, not documents that become prompts."**

## Tools Granted

`Read, Write, Bash, Glob, Grep, WebFetch, mcp__context7__*` — Color: green. Has web access and Context7 MCP for library docs. This is notably richer than the executor's tool set — the planner needs to discover and research; the executor just needs to build.

## Design Decisions

### Context Budget as First-Class Constraint

The planner explicitly models the quality degradation curve and designs around it:

| Context Usage | Quality | State |
|---------------|---------|-------|
| 0–30% | PEAK | Thorough |
| 30–50% | GOOD | Confident |
| 50–70% | DEGRADING | Efficiency mode |
| 70%+ | POOR | Rushed |

**Rule:** Plans should complete within ~50% context. This means 2–3 tasks per plan maximum. More plans, smaller scope, consistent quality across each.

### User Decision Fidelity (Context Lock)

Before creating any task, the planner checks CONTEXT.md (from `/gsd:discuss-phase`) for locked decisions. The enforcement is strict:

- **Locked decisions (D-01, D-02...)** — MUST be implemented exactly. If user said "use Zustand," plans must use Zustand, not Redux, even if research suggests Redux is better. The task action must reference the decision ID.
- **Deferred ideas** — MUST NOT appear anywhere in plans.
- **Claude's Discretion areas** — Free choice, document reasoning.

Self-check: before returning, verify every locked decision has a covering task with a decision ID reference, and no deferred ideas snuck in.

### Discovery Protocol (4 Levels)

The planner doesn't just plan — it first decides how much research is needed:

- **Level 0 (Skip):** Pure internal work, existing patterns confirmed via grep. No research.
- **Level 1 (Quick, 2–5 min):** Single known library — just check syntax/version via Context7.
- **Level 2 (Standard, 15–30 min):** Choosing between 2–3 options or new external integration → produces DISCOVERY.md.
- **Level 3 (Deep, 1+ hour):** Architectural decision with long-term impact → full research with DISCOVERY.md.

Triggers for Level 2+: new library not in package.json, external API integration, "choose/select/evaluate" in description. Triggers for Level 3: "architecture/design/system", multiple external services, auth or data modeling.

### Anti-Enterprise Philosophy

The planner explicitly rejects enterprise patterns: no team structures, RACI matrices, sprint ceremonies, stakeholder management, or human dev time estimates. It plans for one user + one Claude, not a team. Effort is estimated in Claude execution time.

### Gap-Closure Mode

When spawned with `--gaps` flag, receives structured gap data from VERIFICATION.md and creates targeted plans to fix only what's broken. Reuses the same PLAN.md format but scoped to the specific artifacts/truths that failed verification.

### Plan Structure

Each PLAN.md contains: frontmatter (phase, plan, type, wave, depends_on), objective with context @-references, tasks (with `<files>`, `<action>`, `<verify>`, `<done>` elements), success criteria, and optional `must_haves` section that feeds the verifier.

Wave assignments enable parallel execution: plans in the same wave run concurrently, plans in different waves run sequentially.

## Prompt Patterns Observed

- **XML section hierarchy:** `<role>`, `<project_context>`, `<context_fidelity>`, `<philosophy>`, `<discovery_levels>` — each a self-contained behavioral module.
- **Forbidden output patterns:** Explicitly lists anti-enterprise patterns to delete if seen. Negative instruction ("delete if seen") is unusual and suggests these patterns actively appeared in early versions.
- **Tool priority table:** In advisor mode, lists tools in priority order (Context7 → WebFetch → WebSearch) with trust level per source.
- **Calibration tiers:** The advisor sub-agent uses `full_maturity`, `standard`, or `minimal_decisive` tiers to control output verbosity, keeping the planner's output proportional to project maturity.

## Related Concepts

- [[patterns/pattern-plan-execute-verify]]
- [[wiki/summaries/summary-gsd-executor]]
- [[wiki/summaries/summary-gsd-verifier]]
- [[wiki/summaries/summary-gsd-framework-skills]]

## Sources

- `raw/my-agents/gsd-planner.md`
