---
title: Daily Notes
type: personal
category: pattern
confidence: high
date: 2026-04-13
tags: [daily-notes, standup, session-logging, cadence, engineering]
---

# Daily Notes

The daily note is a lightweight engineering log — not a journal, not a task manager. It records what happened, what was decided, and what carries forward. One file per day, auto-created by Periodic Notes from template.

---

## Template

```markdown
---
date: {{date:YYYY-MM-DD}}
type: daily
tags: [daily]
---

# {{date:dddd, MMMM D, YYYY}}

## Today's Priority
> Pull from: [[personal/hermes-operating-context]] → Priority Stack

**P1:** {current primary objective}
**Daily focus:** {specific task from Daily Focus Rule}

---

## Sessions

### Session 1 — {HH:MM}
**Goal:** {1 sentence}
**Completed:**
- 
**Decisions:**
- 
**Blockers:**
- 
**Next:** {what picks up from here}

---

## Decisions Log
> Decisions made today that affect the KB or active projects

| Decision | Rationale | Reversible? |
|----------|-----------|-------------|
| | | |

---

## Open Threads
> Things unfinished that need to carry to tomorrow or a future session

- [ ] 
- [ ] 

---

## KB Updates
> New raw sources to INGEST, pages to update, or gaps discovered

- [ ] Ingest: 
- [ ] Update: 
- [ ] Gap found: 

---

## End of Day
**Accomplished:** {1-sentence summary}
**Tomorrow starts with:** {the single most important thing to pick up}
**Hot cache update needed?** {yes/no — if yes, note what to add}
```

---

## Usage Notes

**Templater setup:** Wire this template to the `D` hotkey in Templater. Set Periodic Notes to auto-create with this template on vault open.

**Session granularity:** One session block per distinct Claude session or work context switch. If you opened Claude Code 3 times today, 3 session blocks.

**Decision log discipline:** Every significant decision (architecture choice, priority change, skip/defer on a task) gets a row. The decision log is searchable and becomes the audit trail for "why did we do X."

**Open threads vs tasks:** Open threads are session-scoped — things that must carry to the next session. Longer-lived tasks live in [[daily-systems/task-priority-management]].

---

## Daily Standup Format

For async standups or logging to a team channel:

```
Yesterday: {what was shipped or decided}
Today: {specific focus — not "working on X" but "completing Y"}
Blockers: {anything that needs resolution from someone else}
```

Hermes can generate this from the previous day's note on demand.

---

## File Location

Store daily notes in `wiki/daily-systems/logs/YYYY-MM-DD.md`.

Configure Obsidian Periodic Notes:
- Daily notes folder: `wiki/daily-systems/logs`
- Template file: `wiki/daily-systems/daily-notes.md` (this page as template source)
- Date format: `YYYY-MM-DD`

---

## Related

- [[daily-systems/index|Daily Systems]] ← parent
- [[daily-systems/weekly-monthly-reviews|Weekly/Monthly Reviews]]
- [[daily-systems/task-priority-management|Task & Priority Management]]
- [[prompt-library/reflection-synthesis|Session Debrief Prompt]]
- [[personal/hermes-operating-context]] — Source of today's priority
