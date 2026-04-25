---
description: Surface actionable proposals from compile-log + candidates history (stuck candidates, flapping graduates, heavy backlog).
allowed-tools: Bash, Read, Write
---

# /foundry-propose

Reactive proposal loop. Scans the KB's own history for patterns worth acting on and emits stable, dedupe-aware proposals (PROP-###). User accepts/rejects manually.

## What it does

1. Parse `wiki/_meta/compile-log.md` (every `/foundry-compile` run).
2. Parse `wiki/candidates.md` (current single-source themes).
3. Parse `wiki/_meta/proposals.md` (existing proposals, for dedup).
4. Run three detectors:
   - **STUCK_CANDIDATE** — theme deferred for >30 days. Recommendation: find a 2nd source or remove from candidates.
   - **REPEAT_GRADUATE** — theme that graduated more than once (flapping signal). Recommendation: investigate why sources keep falling below the threshold.
   - **HEAVY_BACKLOG** — latest compile defer count > 50. Recommendation: compile more often, audit candidates, or seed high-leverage sources.
5. Print fresh proposals (skipping ones already in `proposals.md`).
6. With `--execute`: append the new proposals to `wiki/_meta/proposals.md`.

## How to run it

Plan mode (no writes):
```bash
node scripts/foundry-propose.mjs
```

Execute mode (append to proposals.md):
```bash
node scripts/foundry-propose.mjs --execute
```

Tune thresholds:
```bash
node scripts/foundry-propose.mjs --stuck-days 14 --backlog 30
```

## Output (example)

```
/foundry-propose — 2026-04-25T17:30:00.000Z
  compile runs scanned: 12
  current candidates:   108
  existing proposals:   3
  detectors fired:      5 (2 new, 3 already proposed)

### PROP-004 [STUCK_CANDIDATE] semantic-search
- theme: `semantic-search`
- single source: `agentic-kb-enterprise-plan`
- age: 38 days (since gate started or earliest run)
- recommendation: Find a 2nd source for [[semantic-search]] or remove it from candidates.md as out-of-scope.

### PROP-005 [HEAVY_BACKLOG] backlog:2026-04-25T16:00:00.000Z
- defer count: 108 (threshold 50)
- run: 2026-04-25T16:00:00.000Z
- recommendation: Latest compile deferred 108 themes (>50). Consider: (a) running /foundry-compile more often, (b) auditing candidates.md for low-value themes to drop, or (c) seeding 2nd sources for the highest-leverage themes.

(plan mode — re-run with --execute to append to wiki/_meta/proposals.md)
```

## Refuse list

- Do NOT auto-act on proposals. Surface them; the human accepts.
- Do NOT modify wiki pages (`wiki/concepts/`, `wiki/patterns/`, etc.) — proposals.md only.
- Do NOT modify `raw/` (Rule 1) or the personal vault (Rule 13).
- Do NOT skip dedup — re-runs must not multiply identical proposals.

## Related

`/foundry-compile` — appends to compile-log.md (the data source).
`/foundry-lint` — diagnostic; `/foundry-propose` is prescriptive.
