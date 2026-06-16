# Agentic-KB Night Shift Map

Purpose: adapt the "second brain night shift" pattern to Jay's existing Agentic-KB vault without creating a competing folder taxonomy.

## Selected vault
`/Users/jaywest/Agentic-KB`

## Article → Agentic-KB mapping
- `0-raw/` → `raw/` plus `raw/inbox/`
- `1-desk/` → `.night-shift/desk/`
- `2-atoms/` → structured wiki pages under `wiki/concepts/`, `wiki/patterns/`, `wiki/frameworks/`, `wiki/recipes/`, `wiki/evaluations/`, and `wiki/personal/`
- `3-threads/` → `wiki/syntheses/`
- `sources/` → existing `raw/` source folders
- `briefings/` → `briefings/`
- `playbooks/` → `playbooks/`
- `house-rules.md` → `house-rules.md`

## Nightly sequence
1. Scout Run: pull URLs from `raw/reading-list.md` into `raw/framework-docs/` or the appropriate raw source folder.
2. Refinery Run: process unhandled `raw/inbox/` and raw source files into summaries and atomic wiki updates.
3. Editor Run: update synthesis threads and write the daily briefing.
4. Audit Run: report integrity problems weekly without modifying wiki pages.

## Safety posture
This is Hermes-native, not Kimi-specific. The workflow uses Hermes cron jobs and the existing Agentic-KB schema. Scheduled jobs must be idempotent, source-grounded, and conservative about writes.
