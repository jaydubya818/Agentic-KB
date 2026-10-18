// Category-specific freshness policy.
//
// A single 30-day cadence treated a 2024 reference concept like an agent's
// scratch log, so 44% of the vault read as "stale" and the number stopped
// meaning anything. Each category now has a review cadence that matches how
// fast its content actually goes out of date.
//
// Two rules that must not be bent:
//   1. Timestamps are never touched to make a page look fresh. A page is current
//      because it was *verified*, which is recorded in the separate
//      `last_verified` front-matter field, not because `updated` moved.
//   2. A page's own `stale_after_days` / `review_cadence_days` front matter always
//      wins over the category default.
//
// `days: null` means event-driven: the page is a point-in-time record (a
// decision, a source summary, a CI report). It does not rot on a calendar; it is
// reviewed when something supersedes it or contradicts it. Those pages are
// reported separately instead of being silently dropped from the numbers.

export const FRESHNESS_POLICIES = [
  // Historical records and generated reports: event-driven.
  { id: 'historical', label: 'Historical records', days: null,
    match: /^(decisions|summaries|reports|archive|_quarantine|system\/reports)\//,
    reason: 'point-in-time record; reviewed when superseded or contradicted' },
  { id: 'historical', label: 'Historical records', days: null,
    match: /^syntheses\/lint-/, reason: 'dated lint snapshot' },

  // Agent working memory and instructions: 30d.
  { id: 'agent-memory', label: 'Agent working memory', days: 30,
    match: /^agents\//, reason: 'agent memory and instructions drift fast' },

  // Active operational documentation: 30d.
  { id: 'operational', label: 'Active operational docs', days: 30,
    match: /^repos\//, reason: 'tracks live project state' },

  // Architecture / implementation documentation: 90d.
  { id: 'architecture', label: 'Architecture & implementation', days: 90,
    match: /^(system\/policies|syntheses|evaluations)\//, reason: 'design and policy docs' },

  // Reference material and patterns: 90–180d.
  { id: 'reference', label: 'Reference & patterns', days: 90,
    match: /^(frameworks|entities|mocs|personal)\//, reason: 'tool and ecosystem facts change quarterly' },
  { id: 'reference', label: 'Reference & patterns', days: 120,
    match: /^(patterns|recipes)\//, reason: 'engineering patterns change slowly' },
  { id: 'reference', label: 'Reference & patterns', days: 180,
    match: /^(concepts|prompt-library)\//, reason: 'foundational concepts change slowest' },
]

export const FALLBACK_POLICY = {
  id: 'operational', label: 'Active operational docs', days: 30,
  reason: 'top-level operational page; default cadence',
}

export function classifyFreshness(relPath) {
  const p = String(relPath || '').replace(/^wiki\//, '')
  return FRESHNESS_POLICIES.find(rule => rule.match.test(p)) || FALLBACK_POLICY
}

const DAY = 24 * 60 * 60 * 1000

function toTime(value) {
  if (!value) return NaN
  return new Date(value).getTime()
}

/**
 * Resolve the freshness verdict for one page.
 *
 *   state: 'fresh' | 'stale' | 'event-driven' | 'undated'
 *   basis: which date the verdict was computed from ('verified' | 'updated')
 */
export function evaluateFreshness(page, now = Date.now()) {
  const policy = classifyFreshness(page?.relPath)
  const explicit = Number(page?.staleAfterDays ?? page?.reviewCadenceDays)
  const hasExplicit = Number.isFinite(explicit) && explicit > 0
  const days = hasExplicit ? explicit : policy.days

  const updated = toTime(page?.updated)
  const verified = toTime(page?.lastVerified)
  const hasUpdated = !Number.isNaN(updated)
  const hasVerified = !Number.isNaN(verified)

  if (!hasUpdated && !hasVerified) {
    return { state: 'undated', category: policy.id, days, basis: null, ageDays: null }
  }
  if (days === null) {
    return { state: 'event-driven', category: policy.id, days: null,
      basis: hasVerified ? 'verified' : 'updated', ageDays: null }
  }

  // Whichever is newer counts: editing a page is evidence it was looked at,
  // and an explicit verification is evidence the content was checked.
  const ref = Math.max(hasUpdated ? updated : -Infinity, hasVerified ? verified : -Infinity)
  const basis = hasVerified && verified >= (hasUpdated ? updated : -Infinity) ? 'verified' : 'updated'
  const ageDays = Math.floor((now - ref) / DAY)
  return { state: ref < now - days * DAY ? 'stale' : 'fresh', category: policy.id, days, basis, ageDays }
}

/** Per-category rollup for the dashboard. */
export function freshnessBreakdown(pages, now = Date.now()) {
  const out = {}
  for (const page of pages) {
    const v = evaluateFreshness(page, now)
    const row = (out[v.category] ||= { total: 0, stale: 0, fresh: 0, eventDriven: 0, undated: 0, verified: 0 })
    row.total++
    if (v.state === 'stale') row.stale++
    else if (v.state === 'fresh') row.fresh++
    else if (v.state === 'event-driven') row.eventDriven++
    else row.undated++
    if (page?.lastVerified) row.verified++
  }
  return out
}
