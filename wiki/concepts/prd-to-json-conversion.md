---
id: 01KQ2ZDHMBD3WQ362KVYJ7FFTW
title: PRD to JSON Conversion for Autonomous Agents
type: concept
tags: [agents, workflow, automation, patterns, architecture]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [agent-loops, context-management, multi-agent-systems]
source: my-skills/ralph-skill.md
---

# PRD to JSON Conversion for Autonomous Agents

## Definition

Converting a Product Requirements Document (PRD) into a structured JSON format that an autonomous agent (such as Ralph) can consume for iterative, context-bounded execution. The output (`prd.json`) breaks a feature into discrete user stories, each scoped to fit within a single agent iteration.

## Why It Matters

Autonomous coding agents like Ralph spawn a fresh LLM instance per iteration with **no memory of previous work**. If a user story is too large, the agent exhausts its context window before finishing, producing broken or incomplete code. A well-structured `prd.json` is the primary mechanism for keeping work units small, ordered by dependency, and verifiable.

## Output Format

```json
{
  "project": "[Project Name]",
  "branchName": "ralph/[feature-name-kebab-case]",
  "description": "[Feature description from PRD title/intro]",
  "userStories": [
    {
      "id": "US-001",
      "title": "[Story title]",
      "description": "As a [user], I want [feature] so that [benefit]",
      "acceptanceCriteria": [
        "Criterion 1",
        "Criterion 2",
        "Typecheck passes"
      ],
      "priority": 1,
      "passes": false,
      "notes": ""
    }
  ]
}
```

## Story Sizing: The Number One Rule

**Each story must be completable in one agent iteration (one context window).**

### Right-sized stories:
- Add a database column and migration
- Add a UI component to an existing page
- Update a server action with new logic
- Add a filter dropdown to a list

### Too large — split these:
- "Build the entire dashboard" → schema, queries, UI components, filters
- "Add authentication" → schema, middleware, login UI, session handling
- "Refactor the API" → one story per endpoint or pattern

> **Rule of thumb:** If you cannot describe the change in 2–3 sentences, it is too big.

## Story Ordering: Dependencies First

Stories execute in priority order. Earlier stories must not depend on later ones.

**Correct order:**
1. Schema / database changes (migrations)
2. Server actions / backend logic
3. UI components that use the backend
4. Dashboard / summary views that aggregate data

## Acceptance Criteria: Must Be Verifiable

Each criterion must be something the agent can mechanically CHECK.

### Good (verifiable):
- `"Add 'status' column to tasks table with default 'pending'"`
- `"Filter dropdown has options: All, Active, Completed"`
- `"Typecheck passes"`
- `"Tests pass"`

### Bad (vague):
- `"Works correctly"`
- `"Good UX"`
- `"Handles edge cases"`

### Always include as final criterion:
- `"Typecheck passes"` — on every story
- `"Tests pass"` — for stories with testable logic
- `"Verify in browser using dev-browser skill"` — for UI stories (frontend is not done until visually confirmed)

## Conversion Rules Summary

| Rule | Detail |
|---|---|
| IDs | Sequential: US-001, US-002, … |
| Priority | Dependency order first, then document order |
| Initial state | `passes: false`, `notes: ""` |
| Branch name | Derived from feature name, kebab-case, prefixed `ralph/` |
| Always add | `"Typecheck passes"` to every story |

## Example — Splitting a Large PRD Story

**Original:** "Add user notification system"

**Split into:**
1. US-001: Add notifications table to database
2. US-002: Create notification service
3. US-003: Add notification bell icon to header
4. US-004: Create notification dropdown panel
5. US-005: Add mark-as-read functionality
6. US-006: Add notification preferences page

## See Also

- [Agent Loops](agent-loops.md) — how autonomous agents iterate over tasks
- [Context Management](context-management.md) — why context window limits drive story sizing
- [Multi-Agent Systems](multi-agent-systems.md) — orchestration patterns relevant to Ralph-style execution
