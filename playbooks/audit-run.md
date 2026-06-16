# Audit Run

Schedule: Sunday evening.

## Job
Run a report-only integrity pass over the Agentic-KB vault and write `briefings/audit-YYYY-MM-DD.md`.

Check:
1. Wiki pages missing required frontmatter fields for their type.
2. Wiki pages with no source references or `[UNVERIFIED]` markers where a source should exist.
3. Orphan wiki pages with no obvious inbound links.
4. `[FRICTION]` blocks unresolved for 7+ days.
5. `confidence: low` or `confidence: medium` pages not revisited recently.
6. Framework pages with `last_checked` older than 60 days.
7. Recipe pages with `tested: false` older than 30 days.
8. Broken Obsidian links where practical.
9. Raw sources with `status: unprocessed` older than 7 days.

## Rule
Report only. Do not fix anything automatically during audit. The audit exists to hand Jay a decision list.
