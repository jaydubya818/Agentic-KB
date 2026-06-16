# Audit Run

Schedule: Sunday evening.

## Job
Run a report-only integrity pass over the Agentic-KB vault and write `briefings/audit-YYYY-MM-DD.md`.

1. Read `AGENTS.md`, `house-rules.md`, `playbooks/night-shift-map.md`, and this playbook.
2. Read `.night-shift/state/audit-state.json` if present.
3. Perform the report-only checks below.
4. Write `briefings/audit-YYYY-MM-DD.md`.
5. Write `.night-shift/state/audit-state.json` with: last run timestamp, files considered, outputs written, status, and briefing path.

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

## Allowed writes
Audit may only write:
- `briefings/audit-YYYY-MM-DD.md`
- `.night-shift/state/audit-state.json`
- `briefings/errors/agentic-kb-audit-run-YYYY-MM-DD-HHMM.md` if the audit fails or blocks before completing the normal audit briefing

## Error briefing rule
If the job fails, blocks, or exits early before completing `briefings/audit-YYYY-MM-DD.md`, write an error briefing to:

`briefings/errors/agentic-kb-audit-run-YYYY-MM-DD-HHMM.md`

The error briefing must include:
- job name
- job ID if available
- timestamp
- phase/stage where it failed
- error or blocked reason
- files read
- files written or attempted
- files that may need review
- rollback guidance
- safest next action for Jay

## Rules
- Report only.
- Do not fix anything automatically during audit.
- Do not modify `raw/`.
- Do not modify `wiki/`.
- Do not modify `wiki/index.md`.
- Do not modify `wiki/log.md`.
- The audit exists to hand Jay a decision list.
