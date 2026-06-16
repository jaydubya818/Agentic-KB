# Night Shift Error Briefings

Scheduled Night Shift jobs write a normal briefing when they complete.

If a scheduled job fails, blocks, or exits early before completing its normal briefing, it must write an error briefing here:

`briefings/errors/{job-name}-YYYY-MM-DD-HHMM.md`

Each error briefing must include:
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

Rollback guidance should start from the baseline tag when appropriate:

`agentic-kb-night-shift-baseline-2026-06-15`

Error briefings are review artifacts. They should not attempt automatic recovery, cleanup, or source mutation.
