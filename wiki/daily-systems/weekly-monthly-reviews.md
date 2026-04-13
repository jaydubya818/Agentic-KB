---
title: Weekly & Monthly Reviews
type: personal
category: pattern
confidence: high
date: 2026-04-13
tags: [weekly-review, monthly-review, retrospective, lint, kb-health, cadence]
---

# Weekly & Monthly Reviews

Structured review cadence for keeping the KB sharp and priorities current. Weekly reviews are 15 minutes. Monthly reviews are 45 minutes with a full LINT pass.

---

## Weekly Review Template

Run every Monday (or session-start after a weekend gap). Auto-create in `wiki/daily-systems/reviews/YYYY-WXX.md`.

```markdown
---
date: {{date:YYYY-MM-DD}}
week: {{date:YYYY-[W]WW}}
type: weekly-review
---

# Week {{date:[W]WW}} Review — {{date:MMMM D, YYYY}}

## Priority Check
> Source: [[personal/hermes-operating-context]]

**P1 status:** {on track / blocked / needs update}
**P2 status:** {on track / blocked / needs update}
**P3 status:** {on track / blocked / needs update}

**Changes this week:**
- 

**Priority shifts needed:**
- 

---

## Blockers
> From hermes-operating-context → Open Blockers

| Blocker | Age | Status | Next Action |
|---------|-----|--------|-------------|
| | | | |

---

## KB Health (Quick Check)
- New pages added: {count}
- Raw sources ingested: {list}
- Orphans introduced: {yes/no — if yes, fix before closing review}
- Hot cache still ≤500 words? {yes/no}
- Any framework pages now stale? {check last_checked dates}

**Hot cache update:** {add / prune / no change}

---

## This Week's Lessons
> Validated patterns or anti-patterns to write to wiki/personal/

- [ ] 

---

## Next Week's Focus
**Single most important thing:** 
**Secondary:** 
```

---

## Monthly Review Template

Run on the 1st of each month. Auto-create in `wiki/daily-systems/reviews/YYYY-MM.md`.

```markdown
---
date: {{date:YYYY-MM-DD}}
month: {{date:YYYY-MM}}
type: monthly-review
---

# {{date:MMMM YYYY}} Monthly Review

## KB Growth
- Pages this month: {count added}
- Summaries added: {count}
- Patterns promoted: {count + names}
- Pages deprecated: {count + names}

## LINT Results
> Run /lint before filling this section

- Orphan count: {number}
- Stale frameworks: {list}
- Untested old recipes: {list}
- Gap candidates identified: {list}
- Lint report: [[syntheses/lint-{YYYY-MM-DD}]]

## Priority Retrospective
> How well did the Daily Focus Rule work this month?

**P1 progress:** {what moved}
**Biggest blocker:** {what slowed P1}
**Surprise time sink:** {what consumed unplanned time}

## What Compounded
> Which KB investments paid off this month?

- 

## What Didn't
> Which investments failed or weren't used?

- 

## Agent Infrastructure Review
- New agents added: 
- Skills added/refined: 
- Underused agents (candidates for retirement): 

## Next Month's Priority Stack
**P1:** 
**P2:** 
**P3:** 

**Update [[personal/hermes-operating-context]] before closing.**
```

---

## Making Reviews Stick

**The review only works if it produces an action.** At minimum, every weekly review should:
- Update one priority in [[personal/hermes-operating-context]]
- Add or remove one entry from [[hot]]
- Create or link one task in [[daily-systems/task-priority-management]]

If a review produces no changes, the KB is probably drifting from actual work — investigate.

---

## Related

- [[daily-systems/index|Daily Systems]] ← parent
- [[daily-systems/daily-notes|Daily Notes]]
- [[daily-systems/task-priority-management|Task & Priority Management]]
- [[personal/hermes-operating-context]] — Source of truth for priority stack
- [[mocs/maintenance|Maintenance]] — Full LINT workflow
- [[prompt-library/reflection-synthesis|Session Debrief & Weekly KB Reflection prompts]]
