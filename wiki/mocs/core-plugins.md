---
title: Core Plugins
type: moc
category: structure
tags: [obsidian, plugins, dataview, templater, terminal, canvas, graph-view]
created: 2026-04-13
updated: 2026-04-13
---

# Core Plugins

The Obsidian plugin stack that powers the Agentic-KB. Covers the terminal integration for [[framework-claude-code]], Dataview for queryable metadata, Templater for automated note creation, Periodic Notes for review cadence, Canvas for workspaces, and graph view configuration.

---

## Terminal + [[framework-claude-code]]

**Plugin:** Terminal (by Namikaze09) or Obsidian Terminal

Enables a shell pane inside Obsidian — the primary bridge for [[framework-claude-code]] interaction:
- Run `claude` directly from within the vault
- Execute KB CLI queries: `cd /Users/jaywest/My\ LLM\ Wiki && npm run query "your question"`
- Run git operations without leaving Obsidian
- Trigger INGEST workflow scripts

**Setup:** Point the terminal default shell to zsh. Set the working directory to vault root so `CLAUDE.md` is in scope on every [[framework-claude-code]] invocation.

---

## Dataview & Queries

**Plugin:** Dataview (by blacksmithgu) — essential

Turns frontmatter into a queryable database. Key queries for the KB:

```dataview
TABLE confidence, updated FROM "wiki/concepts"
WHERE confidence = "low"
SORT updated ASC
```
*→ Concepts flagged for verification*

```dataview
TABLE last_checked FROM "wiki/frameworks"
WHERE date(today) - date(last_checked) > dur(60d)
```
*→ Stale framework pages*

```dataview
TABLE tested, tested_date FROM "wiki/recipes"
WHERE tested = false AND date(today) - date(created) > dur(30d)
```
*→ Untested recipes older than 30 days (lint trigger)*

```dataview
LIST FROM "wiki/summaries"
SORT file.mtime DESC
LIMIT 10
```
*→ 10 most recently updated summaries*

For live KB stats, see [[stats]].

---

## Templater & QuickAdd

**Plugin:** Templater (by SilentVoid13) — essential for automation

Drives new-page creation with correct frontmatter. Key templates to wire up:

- **New Concept** — auto-fills `type: concept`, today's date, prompts for title/tags/confidence
- **New Pattern** — fills pattern-specific frontmatter (problem, solution, tradeoffs, category)
- **New Framework** — fills framework-specific fields (vendor, version, last_checked)
- **New Recipe** — sets `tested: false`, prompts for difficulty/prerequisites
- **New Summary** — links to source file, sets `date_ingested`
- **Daily Note** — engineering standup format (see [[daily-systems/daily-notes]])
- **Weekly Review** — KB health snapshot + priority check (see [[daily-systems/weekly-monthly-reviews]])

**QuickAdd** (by chhoumann) — command palette shortcuts for fast note capture without breaking flow.

---

## Periodic Notes

**Plugin:** Periodic Notes (by liamcain)

Powers the [[mocs/daily-systems|Daily Systems]] cadence. Configure:

| Period | Template | Location |
|--------|----------|----------|
| Daily | Daily engineering note | `wiki/daily-systems/logs/YYYY-MM-DD.md` |
| Weekly | Weekly review template | `wiki/daily-systems/reviews/YYYY-WXX.md` |
| Monthly | Monthly KB lint + retrospective | `wiki/daily-systems/reviews/YYYY-MM.md` |

The daily note auto-links to today's priority stack from [[personal/hermes-operating-context]]. The weekly review auto-triggers a KB health check (see [[mocs/maintenance]]).

---

## Advanced URI & Canvas

**Advanced URI Plugin** — enables deep linking into the vault from external apps, scripts, and [[framework-claude-code]]:

```
obsidian://advanced-uri?vault=Agentic-KB&filepath=wiki/hot.md
```

Use cases: [[framework-claude-code]] hooks that open a specific page after an INGEST run; terminal scripts that navigate to today's daily note.

**Canvas** — built-in Obsidian feature for visual workspaces. See [[mocs/visualization]] for KB-specific canvas patterns:
- Research project canvases (sources → synthesis → findings)
- Architecture decision canvases (options → tradeoffs → decision)
- Session planning canvases (priority stack visualization)

---

## Graph View Enhancers

**Plugin:** Graph Analysis (by SkepticMystic) — adds link strength metrics, community detection, and backlink analysis to the default graph view.

**Plugin:** Juggl — interactive graph with node filtering by frontmatter properties.

KB-specific graph view settings:
- Filter to `wiki/` only — exclude `raw/` to reduce noise
- Color by `type`: concepts (blue), patterns (green), frameworks (orange), syntheses (purple)
- Size nodes by inbound link count — visually identifies high-value hubs
- Hide orphan nodes — flags lint failures immediately

See [[mocs/visualization]] for full graph optimization guide and [[syntheses/lint-2026-04-12]] for current orphan report.

---

## Related

- [[mocs/visualization|Visualization MoC]] — Graph view and canvas patterns in depth
- [[mocs/claude-integration|Claude Integration]] — Terminal → [[framework-claude-code]] connection
- [[mocs/daily-systems|Daily Systems]] — Periodic Notes configuration
- [[mocs/automation|Automation]] — Templater + QuickAdd automation patterns
