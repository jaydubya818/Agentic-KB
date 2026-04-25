---
description: Health check — orphans, stale pages, candidates ready, keyword drift.
allowed-tools: Bash, Read, Write
---

# /foundry-lint

Run the wiki health check and surface what needs attention.

## What it does

1. Shell out to `kb lint` (existing checks: orphans, missing cross-links, stale frameworks, low-confidence claims, untested recipes, unreviewed pages, review drift, missing Counter-arguments sections, gap candidates).
2. Add **candidate health**: scan `wiki/candidates.md` and report any candidate now backed by ≥2 summaries (ready to graduate via `/foundry-compile`).
3. Add **keyword drift**: compare tag frequency in the last 30 days vs. the last 90. Flag any tag whose use dropped > 70% (a Foundry signal — concepts may be drifting out of focus).
4. Write a combined report to `wiki/syntheses/lint-{YYYY-MM-DD}.md`.

## How to run it

```bash
kb lint
node scripts/foundry-lint-extra.mjs --candidates --drift
```

The first command runs the standard kb lint and writes `wiki/lint-report.md`. The second runs the Foundry-specific extra checks and appends them to the same report file. (If `foundry-lint-extra.mjs` does not exist yet, fall back to inlining the candidate scan directly.)

## Output

```
Wiki Lint — 2026-04-21
─────────────────────
Orphans:                 4 pages (see wiki/lint-report.md)
Stale frameworks:        2 (last_checked > 60d ago)
Unreviewed (mtime > 30d): 7 pages
Missing Counter-args:    1 concept page

Foundry extras:
  Candidates ready:       2 ready to graduate
    - inbox-zero-pattern (2 sources, was 1)
    - context-decay-strategies (3 sources, was 1)
  Candidates waiting:     5 single-source themes
  Keyword drift:          1 tag dropped >70% in last 30d
    - #pattern-deployment (was 14, now 3)
```

## Refuse list

- Do NOT auto-fix issues. Lint reports; humans (or other commands) fix.
- Do NOT delete orphan pages. Flag only.
- Do NOT modify pages outside `wiki/syntheses/lint-*.md` and `wiki/lint-report.md`.

## Related

`/foundry-compile` graduates ready candidates.
`kb agent verify-state` is for the agent runtime layer (separate concern).
