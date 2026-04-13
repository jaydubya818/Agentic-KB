---
title: Daily Systems
type: moc
category: daily-systems
tags: [daily-notes, reviews, task-management, journaling, habits, cadence]
created: 2026-04-13
updated: 2026-04-13
---

# Daily Systems

The recurring rhythms that keep the work compounding. An engineering KB without a usage cadence is a graveyard. These systems ensure the KB is read, updated, and actioned — not just written to.

---

## Contents

- [[daily-systems/daily-notes|Daily Notes]] — Engineering standup format, session logging, priority check
- [[daily-systems/weekly-monthly-reviews|Weekly/Monthly Reviews]] — Sprint review, KB lint, retrospective templates
- [[daily-systems/task-priority-management|Task & Priority Management]] — Hermes priority stack, Daily Focus Rule, blocker escalation

---

## The Cadence at a Glance

| Rhythm | Trigger | Key Action | Output |
|--------|---------|------------|--------|
| Daily | Session start | Read hot.md + hermes-operating-context | Know today's priority |
| Daily | Session end | Debrief — log decisions, open threads | wiki/log.md entry |
| Weekly | Monday | Review priority stack, check blockers | Updated hermes-operating-context |
| Weekly | Friday | KB health snapshot, hot.md prune | hot.md update if needed |
| Monthly | 1st of month | Full LINT pass | wiki/syntheses/lint-{date}.md |
| Monthly | End of month | Retrospective — what compounded, what didn't | personal/ war story or lesson |

---

## Hermes Daily Protocol

On every session start, Hermes auto-loads:
1. `wiki/hot.md` — primes on most-used context
2. `wiki/personal/hermes-operating-context.md` — priority stack, routing defaults, open blockers

This means the daily system is largely automatic — the KB tells Hermes what matters today. The only manual step is keeping `hermes-operating-context.md` current (update Priority 1 when focus shifts).

---

## Related

- [[personal/hermes-operating-context]] — Full priority stack and operating context
- [[hot]] — Hot cache (read every session)
- [[mocs/automation|Automation]] — Automated review triggers
- [[mocs/maintenance|Maintenance & Optimization]] — Monthly LINT protocol
- [[prompt-library/reflection-synthesis|Reflection & Synthesis]] — Session debrief prompts
