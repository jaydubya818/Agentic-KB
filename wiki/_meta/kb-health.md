# KB Health

> Maintained by `scripts/daily-lint.sh` — **standing**. Only changes in status are committed; run history lives in `logs/lint-runs.jsonl`.

| Metric | Value | Threshold | Status | Open since |
|---|---|---|---|---|
| Open contradictions | 0 | 0 | 🟢 OK | — |
| Orphaned pages | 0 | 80 | 🟢 OK | — |
| Orphan growth per run (> 5) | 0 | 5 | 🟢 OK | — |
| Stale pages (% of vault) | 23 | 40 | 🟢 OK | — |
| Broken cross-references | 37 | 0 | 🟡 STANDING | 2026-10-11 (4d) |
| Active-project documentation gaps | 8 | 0 | 🟡 STANDING | 2026-10-11 (4d) |
| Degraded analysis run | 0 | 0 | 🟢 OK | — |

Pages: 938 · Stale: 219 (23%) · Pages with `last_verified`: 0 · Gaps: 0

**Analysis coverage:** 60/938 pages this run. The window rotates each run, so contradiction and gap findings reflect a rolling sample, not a full-vault sweep.

## Last remediation

| | Before | After |
|---|---|---|
| Orphans | 1 | 0 |
| Stale | 219 | 219 |
| Broken cross-references | 37 | 37 |

**Status key:** NEW · REGRESSION · WORSENING notify. STANDING and BLOCKED are shown here without re-alerting. REMEDIATED is reported once.

See [[_meta/kb-quality]] for project coverage, duplicates and broken links; [lint-report.md](../lint-report.md) for page-level triage; [lint-trend.csv](../lint-trend.csv) for history; [lint-alerts.md](./lint-alerts.md) for the alert log.
