#!/usr/bin/env node
// Applies the alert lifecycle to today's metrics, updates the persisted state
// and renders the health dashboard.
//
//   node scripts/kb-alerts.mjs '<metrics-json>'
//
// Prints a JSON result on stdout. Writes (only when content actually differs):
//   wiki/_meta/alert-state.json   durable lifecycle state
//   wiki/_meta/kb-health.md       dashboard (no volatile timestamps, so an
//                                 unchanged day produces an unchanged file)
// Thresholds come from the same env vars as daily-lint.sh and are never relaxed
// by this script.
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { evaluateAlerts } from './lib/alert-lifecycle.mjs'

const root = path.resolve(process.env.KB_REPO || path.join(path.dirname(fileURLToPath(import.meta.url)), '..'))
const STATE = path.join(root, 'wiki/_meta/alert-state.json')
const HEALTH = path.join(root, 'wiki/_meta/kb-health.md')
const m = JSON.parse(process.argv[2] || '{}')
const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d)
const ORPHAN_MAX = num(process.env.ORPHAN_MAX, 80)
const STALE_PCT_MAX = num(process.env.STALE_PCT_MAX, 40)
const ORPHAN_ALERT = num(process.env.ORPHAN_ALERT, 5)
const today = m.today || new Date().toISOString().slice(0, 10)

const prevState = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : {}
const degraded = Boolean(m.degraded)

// Contradiction results are carry-over on a degraded run: do not let a failed
// analysis "remediate" them.
const current = [
  ...(degraded ? [] : [{ key: 'contradictions', label: 'Open contradictions', value: num(m.contradictions), threshold: 0 }]),
  { key: 'orphans', label: 'Orphaned pages', value: num(m.orphans), threshold: ORPHAN_MAX },
  { key: 'orphan_growth', label: `Orphan growth per run (> ${ORPHAN_ALERT})`, value: num(m.orphanDelta), threshold: ORPHAN_ALERT },
  { key: 'stale_pct', label: 'Stale pages (% of vault)', value: num(m.stalePct), threshold: STALE_PCT_MAX },
  { key: 'broken_links', label: 'Broken cross-references', value: num(m.brokenLinks), threshold: 0 },
  { key: 'project_gaps', label: 'Active-project documentation gaps', value: num(m.projectGaps), threshold: 0 },
  { key: 'degraded', label: 'Degraded analysis run', value: degraded ? 1 : 0, threshold: 0 },
]
const res = evaluateAlerts(prevState, current, today)
// A degraded run must not erase the contradiction record.
if (degraded && prevState.findings?.contradictions) res.state.findings.contradictions = prevState.findings.contradictions

const write = (file, text) => {
  const prev = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null
  if (prev === text) return false
  fs.writeFileSync(file, text)
  return true
}
const icon = { OK: '🟢', NEW: '🆕', REGRESSION: '🔁', WORSENING: '🔺', REMEDIATED: '✅', STANDING: '🟡', BLOCKED: '⛔' }
const status = res.results.find(r => r.status !== 'OK' && r.status !== 'REMEDIATED') ? (res.actionable.length ? 'attention' : 'standing') : 'healthy'

const L = [
  '# KB Health', '',
  `> Maintained by \`scripts/daily-lint.sh\` — **${status}**. Only changes in status are committed; run history lives in \`logs/lint-runs.jsonl\`.`, '',
  '| Metric | Value | Threshold | Status | Open since |', '|---|---|---|---|---|',
  ...res.results.map(r => `| ${r.label} | ${r.value} | ${r.threshold} | ${icon[r.status] || ''} ${r.status} | ${r.standingSince && r.status !== 'OK' ? `${r.standingSince} (${r.standingDays}d)` : '—'} |`),
  '',
  `Pages: ${num(m.pages)} · Stale: ${num(m.stale)} (${num(m.stalePct)}%) · Pages with \`last_verified\`: ${num(m.verified)} · Gaps: ${num(m.gaps)}`, '',
  `**Analysis coverage:** ${num(m.examined)}/${num(m.pages)} pages this run. The window rotates each run, so contradiction and gap findings reflect a rolling sample, not a full-vault sweep.`, '',
]
if (degraded) L.push(`> ⚠️ Degraded run: \`${String(m.reason || '').slice(0, 200)}\` — contradiction/gap results are carry-over from the last good run.`, '')
if (m.before) {
  L.push('## Last remediation', '', '| | Before | After |', '|---|---|---|',
    `| Orphans | ${m.before.orphans} | ${m.orphans} |`, `| Stale | ${m.before.stale} | ${m.stale} |`,
    `| Broken cross-references | ${m.before.brokenLinks} | ${m.brokenLinks} |`, '')
}
L.push('**Status key:** NEW · REGRESSION · WORSENING notify. STANDING and BLOCKED are shown here without re-alerting. REMEDIATED is reported once.', '',
  'See [[_meta/kb-quality]] for project coverage, duplicates and broken links; [lint-report.md](../lint-report.md) for page-level triage; [lint-trend.csv](../lint-trend.csv) for history; [lint-alerts.md](./lint-alerts.md) for the alert log.', '')

const stateChanged = write(STATE, JSON.stringify(res.state, null, 2) + '\n')
const healthChanged = write(HEALTH, L.join('\n'))
console.log(JSON.stringify({
  stateChanged, healthChanged, actionable: res.actionable, remediated: res.remediated,
  standing: res.standing, results: res.results,
}))
