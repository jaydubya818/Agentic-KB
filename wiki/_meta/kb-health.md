# KB Health

> Maintained by `scripts/daily-lint.sh` — **attention**. Only changes in status are committed; run history lives in `logs/lint-runs.jsonl`.

| Metric | Value | Threshold | Status | Open since |
|---|---|---|---|---|
| Open contradictions | 0 | 0 | 🟢 OK | — |
| Orphaned pages | 1 | 80 | 🟢 OK | — |
| Orphan growth per run (> 5) | -95 | 5 | 🟢 OK | — |
| Stale pages (% of vault) | 43 | 40 | 🆕 NEW | 2026-10-11 (0d) |
| Broken cross-references | 37 | 0 | 🆕 NEW | 2026-10-11 (0d) |
| Active-project documentation gaps | 8 | 0 | 🆕 NEW | 2026-10-11 (0d) |
| Degraded analysis run | 0 | 0 | 🟢 OK | — |

Pages: 933 · Stale: 410 (43%) · Pages with `last_verified`: 0 · Gaps: 0

**Analysis coverage:** 60/933 pages this run. The window rotates each run, so contradiction and gap findings reflect a rolling sample, not a full-vault sweep.

## Last remediation

| | Before | After |
|---|---|---|
| Orphans | 0 | 1 |
| Stale | 219 | 410 |
| Broken cross-references | 37 | 37 |

**Status key:** NEW · REGRESSION · WORSENING notify. STANDING and BLOCKED are shown here without re-alerting. REMEDIATED is reported once.

See [[_meta/kb-quality]] for project coverage, duplicates and broken links; [lint-report.md](../lint-report.md) for page-level triage; [lint-trend.csv](../lint-trend.csv) for history; [lint-alerts.md](./lint-alerts.md) for the alert log.
