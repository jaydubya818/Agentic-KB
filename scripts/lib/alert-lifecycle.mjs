// Alert lifecycle for the daily KB health check.
//
// The old job re-alerted on the same absolute-ceiling breach every morning
// (15 days running for orphans and stale), which trained everyone to ignore it.
// Each finding now has a status, and only *changes* in status or severity notify:
//
//   NEW         first time this finding is seen
//   REGRESSION  was resolved earlier and came back
//   WORSENING   still open and the value increased
//   REMEDIATED  was open, now below its threshold (reported once)
//   STANDING    still open, unchanged or improving (dashboard only, no alert)
//   BLOCKED     open and marked as needing external intervention (dashboard only,
//               re-alerts only if it worsens)
//
// Thresholds are NOT relaxed here. A standing breach stays red on the dashboard
// until the number actually comes down.

export const NOTIFY_STATUSES = new Set(['NEW', 'REGRESSION', 'WORSENING'])

/**
 * @param {object} state   persisted state: { findings: { [key]: {...} }, blocked: { [key]: reason } }
 * @param {Array}  current [{ key, value, threshold, label }]  (breach when value > threshold)
 * @param {string} today   YYYY-MM-DD
 */
export function evaluateAlerts(state, current, today) {
  const prev = state?.findings || {}
  const blocked = state?.blocked || {}
  const next = {}
  const results = []

  for (const f of current) {
    const before = prev[f.key]
    const breached = f.value > f.threshold
    let status = 'OK'

    if (breached) {
      if (!before || before.status === 'REMEDIATED') {
        status = before?.resolvedAt ? 'REGRESSION' : 'NEW'
      } else if (f.value > before.value) {
        status = 'WORSENING'
      } else {
        status = blocked[f.key] ? 'BLOCKED' : 'STANDING'
      }
      if (blocked[f.key] && status !== 'WORSENING' && status !== 'NEW' && status !== 'REGRESSION') status = 'BLOCKED'
      next[f.key] = {
        status, value: f.value, threshold: f.threshold, label: f.label,
        firstSeen: (status === 'NEW' || status === 'REGRESSION') ? today : (before?.firstSeen || today),
        lastChanged: (!before || before.value !== f.value || before.status !== status) ? today : before.lastChanged,
        resolvedAt: before?.resolvedAt,
        ...(blocked[f.key] ? { blockedReason: blocked[f.key] } : {}),
      }
    } else if (before && before.status !== 'OK' && before.status !== 'REMEDIATED') {
      status = 'REMEDIATED'
      next[f.key] = { status, value: f.value, threshold: f.threshold, label: f.label,
        firstSeen: before.firstSeen, lastChanged: today, resolvedAt: today }
    } else if (before) {
      // Stays resolved; keep the history so a later return is a REGRESSION.
      status = before.status === 'REMEDIATED' ? 'OK' : 'OK'
      next[f.key] = { ...before, value: f.value, status: before.status === 'REMEDIATED' ? 'REMEDIATED' : 'OK' }
      if (before.value !== f.value) next[f.key].lastChanged = today
    }

    results.push({
      key: f.key, label: f.label, status, value: f.value, threshold: f.threshold,
      previous: before?.value ?? null,
      standingSince: next[f.key]?.firstSeen ?? null,
      standingDays: next[f.key]?.firstSeen
        ? Math.floor((Date.parse(today) - Date.parse(next[f.key].firstSeen)) / 86400000) : 0,
      notify: NOTIFY_STATUSES.has(status),
    })
  }

  return {
    state: { findings: next, blocked },
    results,
    actionable: results.filter(r => r.notify),
    remediated: results.filter(r => r.status === 'REMEDIATED'),
    standing: results.filter(r => r.status === 'STANDING' || r.status === 'BLOCKED'),
  }
}

/** True when persisting would change the stored state (so we only commit real changes). */
export const stateChanged = (a, b) => JSON.stringify(a) !== JSON.stringify(b)
