---
title: Action Tracker
type: tracker
tags: [actions, tracker, operational]
created: 2026-04-20
updated: 2026-04-20
maintained_by: LLM
---

# Action Tracker
> Single source of truth for open commitments extracted from calls, sessions, and messages.
> Maintained by LLM — do not edit rows by hand; edit the source (transcript/session) and re-run INGEST.

## Format
Each row: `- [ ] {description} — owner: {name} · due: {YYYY-MM-DD or "tbd"} · source: [[path/to/source]]`
Completed rows move to `## Completed` with `- [x]` and a `done: YYYY-MM-DD` suffix.
Blocked rows move to `## Blocked` with a `blocker:` suffix naming what's stuck.

---

## Open
<!-- INGEST appends new actions here. Keep sorted: due date ascending, undated last. -->

## Blocked
<!-- Actions with an external dependency. -->

## Completed
<!-- Rolling log, most recent first. Archive >90 days old to archive/action-tracker-{YYYY}.md. -->
