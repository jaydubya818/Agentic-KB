---
title: Context Graph Schema
type: concept
tags: [schema, context-management, agent-architecture]
confidence: medium
date: 2026-05-11
status: evolving
reviewed: false
reviewed_date: ""
---

# Context Graph — Schema v0

## Conventions

- All entities are objects with required fields `id` (stable slug), `type` (one of the entity types below), `updated_at` (ISO-8601 date).
- Optional fields per type are listed below; agents must tolerate missing fields.
- Cross-references between entities use `id` strings, never embedded objects (to keep the graph flat and diffable).
- Timestamps are ISO-8601 dates (`YYYY-MM-DD`) unless full datetime is meaningful.
- Confidence on every claim: `high` | `medium` | `low`. Defaults to `medium`. Drives whether the agent surfaces it as a hard fact vs. a hypothesis.

## Entity types

### `career`

A career chapter — role, employer, dates, scope, decisions. One entry per distinct chapter (not per project — projects live in their own type).

```json
{
  "id": "career-2024-anthropic-cowork-pm",
  "type": "career",
  "role": "PM, Cowork",
  "employer": "Anthropic",
  "start": "2024-09",
  "end": null,
  "scope": "Cowork mode product, Claude Agent SDK adoption",
  "highlights": ["..."],
  "confidence": "high",
  "updated_at": "2026-05-11"
}
```

### `projects`

Active and recent personal projects. Includes Anthropic-internal projects only at the level of "project name + my role"; private details belong in work systems, not here.

```json
{
  "id": "project-sellerfi",
  "type": "projects",
  "name": "SellerFi",
  "status": "active",
  "role": "owner",
  "started": "2025-08",
  "stage": "alpha hardening",
  "stack": ["next.js", "supabase", "claude"],
  "north_star": "...",
  "linked_career": "career-2024-anthropic-cowork-pm",
  "confidence": "high",
  "updated_at": "2026-05-11"
}
```

### `reading`

Books, papers, essays, podcasts that have shaped current thinking. The point isn't a complete bibliography — it's the ~30 sources the agent should reference when reasoning from your worldview.

```json
{
  "id": "reading-pema-chodron-when-things-fall-apart",
  "type": "reading",
  "title": "When Things Fall Apart",
  "author": "Pema Chödrön",
  "format": "book",
  "started": "2026-04",
  "finished": null,
  "themes": ["groundlessness", "letting-go", "Buddhist-practice"],
  "tags": ["therapy", "personal-growth"],
  "links": ["therapy_theme-2026-q2-letting-go"],
  "confidence": "high",
  "updated_at": "2026-05-11"
}
```

### `relationships`

People who matter to current decision-making — family, close colleagues, key founder peers, mentors. Distinct from `founder_network` (broader weak-tie).

```json
{
  "id": "relationship-spouse",
  "type": "relationships",
  "name": "...",
  "role": "spouse",
  "shared_context": ["parenting", "career-decisions"],
  "decisions_to_loop_in": ["job-changes", "major-purchases", "moves"],
  "confidence": "high",
  "updated_at": "2026-05-11"
}
```

### `therapy_themes`

Active themes in personal-development / therapy work. Critical context for agents like Pi when journaling, reflecting, or framing options. Sensitive — `seed.json` is gitignored.

```json
{
  "id": "therapy_theme-2026-q2-letting-go",
  "type": "therapy_themes",
  "name": "Letting go of fixed identities",
  "started": "2026-03",
  "active": true,
  "linked_reading": ["reading-pema-chodron-when-things-fall-apart"],
  "confidence": "medium",
  "updated_at": "2026-05-11"
}
```

### `meetings`

Recurring or high-importance meeting cadences — not transcripts (those live in raw/transcripts/), just the cadence and purpose. Used by Hermes when scheduling or contextualizing notes.

```json
{
  "id": "meeting-weekly-1-1-manager",
  "type": "meetings",
  "name": "Weekly 1:1 with manager",
  "cadence": "weekly",
  "participants": ["relationship-manager"],
  "purpose": "Status + blockers + career check-in",
  "confidence": "high",
  "updated_at": "2026-05-11"
}
```

### `founder_network`

Other founders / builders in Jay's orbit. Broader than `relationships`. Used for "who do I know who's solved X" queries.

```json
{
  "id": "founder-jane-doe-acme-corp",
  "type": "founder_network",
  "name": "Jane Doe",
  "company": "Acme Corp",
  "domain": ["fintech", "ai-agents"],
  "last_contact": "2026-04-15",
  "notes_slug": "people/jane-doe",
  "confidence": "medium",
  "updated_at": "2026-05-11"
}
```

## File shape

`seed.json` (and `seed.example.json`) hold a single object keyed by entity type:

```json
{
  "career": [ /* career entries */ ],
  "projects": [ /* project entries */ ],
  "reading": [ /* reading entries */ ],
  "relationships": [ /* relationship entries */ ],
  "therapy_themes": [ /* theme entries */ ],
  "meetings": [ /* meeting entries */ ],
  "founder_network": [ /* network entries */ ]
}
```

Agents load the whole file (it's small) and index in-memory.

## Validation

A schema-validator (planned, not yet built) will live at `scripts/validate-context-graph.mjs`. It will check: required fields present, IDs unique, cross-references resolve, `updated_at` is ISO-8601.

## Counter-arguments & gaps

- **YAGNI risk** — building a typed graph before a consumer needs it can lead to over-design. Mitigation: v0 is just a JSON file with documented shape — no code, no runtime API. If the consumer turns out to need different entity types, refactoring 7 JSON keys is cheap.
- **Personal write-vault duplication** — Jay's personal vault already has people notes, project notes, daily notes. A context graph in Agentic-KB could drift. Mitigation: the graph is meant to be a *distilled summary* (~30 reading entries, ~10 projects, ~15 relationships), not a mirror. The personal vault stays the source of truth for content; the graph is the index agents use to navigate.
- **Sensitivity vs. publicness** — Agentic-KB is public on GitHub. Real therapy themes and relationships must NOT be committed. Mitigation: `seed.json` is gitignored; only `seed.example.json` (placeholders) is in the repo. This is enforced by `.gitignore` and the Rule 13 one-way principle.
