---
title: Task & Priority Management
type: personal
category: pattern
confidence: high
date: 2026-04-13
tags: [task-management, priority, hermes, daily-focus-rule, blockers]
---

# Task & Priority Management

How Jay's work is prioritized, tracked, and executed. The priority system lives in [[personal/hermes-operating-context]] — this page explains the framework and how to operate it.

---

## The Priority Stack

Three levels, always current in [[personal/hermes-operating-context]]:

| Level | Description | Update Frequency |
|-------|-------------|-----------------|
| **Priority 1** | The single most important objective — the thing that, if completed, makes everything else easier or irrelevant | When P1 is done or the world changes |
| **Priority 2** | Active infrastructure investment — compounds over time, not urgent but important | Weekly |
| **Priority 3** | Research / exploration — feeds future P1s | Monthly |

**The invariant:** P1 always has one concrete task that could be completed today. If P1 doesn't have that, it's not defined precisely enough.

---

## Daily Focus Rule

Five-level decision hierarchy for what to work on in any given session:

1. **Primary objective (P1)** — if something moves P1 forward, do it first
2. **Active blockers** — unblock yourself or someone waiting on you before new work
3. **Active commitments** — things promised to others with a deadline
4. **Compounding infrastructure** — work that makes future sessions faster (KB updates, skill creation, agent improvements)
5. **Optional exploration** — learning, research, or speculative work

**Rule:** Never jump to level 5 while level 1 or 2 has work available.

---

## Priority Interpretation Rules

From [[personal/hermes-operating-context]]:

1. **Objectives beat domains.** P1 defines the work. If P1 is SellerFi, all other domains serve it.
2. **Weekly truth beats static importance.** The priority stack updates weekly. Stale priorities produce wasted sessions.
3. **Blockers get elevation.** A blocker on P1 becomes P0 — drop everything else.
4. **Compounding work is never waste.** KB updates, skill creation, agent improvements reduce future friction even when they don't move P1 directly.
5. **Exploration is earned.** Start exploring only after P1 has moved forward today.

---

## Task Tracking Conventions

This KB does not maintain a full task list — that lives in external tooling (Asana, Linear, or Jay's terminal TASKS.md). What the KB tracks:

**Open threads** (session-scoped) → [[daily-systems/daily-notes]] daily note, "Open Threads" section.

**Blockers** (priority-scoped) → [[personal/hermes-operating-context]] → Open Blockers (append-only).

**KB action items** → [[wiki/recently-added]] and [[wiki/log.md]] (implicit task queue from ingest gaps).

**Research questions** → [[knowledge-systems/research-engine/knowledge/open-questions|Open Questions]] (append-only).

---

## Blocker Escalation Protocol

When a blocker appears:
1. **Log it immediately** → append to [[personal/hermes-operating-context]] → Open Blockers section
2. **Classify it:** waiting-on-person | missing-tool | unclear-requirement | technical-block
3. **Set a resolution path:** who needs to do what by when
4. **Elevate to P0** if it blocks P1 and has no workaround

Hermes surfaces open blockers at every session start (reads hermes-operating-context on load). Blockers older than 7 days with no update get flagged in the weekly review.

---

## Sprint Cadence (for SellerFi work)

Jay's SellerFi work runs in sprint cycles. The weekly review (Monday) maps to sprint planning; the monthly review maps to sprint retrospective.

**Sprint planning inputs:**
- Current P1 objective from hermes-operating-context
- Open blockers from last sprint
- Velocity estimate (how much actually shipped vs planned)

**Sprint outputs:**
- Specific deliverables for this sprint (not vague goals)
- One "stretch goal" that's only attempted if primary deliverables are done
- Explicit blockers to resolve in week 1

---

## Related

- [[daily-systems/index|Daily Systems]] ← parent
- [[daily-systems/weekly-monthly-reviews|Weekly/Monthly Reviews]] — Priority stack review cadence
- [[personal/hermes-operating-context]] — Live priority stack and open blockers
- [[hot]] — Daily context pre-load (includes current P1)
