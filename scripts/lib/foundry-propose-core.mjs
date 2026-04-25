/**
 * Pure helpers for /foundry-propose. Zero I/O — all functions take parsed
 * data structures, return proposals as plain objects.
 *
 * Borrowed concept (not code) from claude-code-hermit's proposal/learning
 * loop: surface actionable patterns from the system's own history. Unlike
 * Hermit, no auto-act — the user runs the command, accepts manually.
 *
 * Three detectors in v1:
 *   1. STUCK_CANDIDATE   — theme deferred for >N days (default 30)
 *   2. REPEAT_GRADUATE   — theme that graduated more than once (flapping)
 *   3. HEAVY_BACKLOG     — latest compile shows defer count > N (default 50)
 */

const STUCK_DAYS_DEFAULT = 30
const HEAVY_BACKLOG_DEFAULT = 50

/**
 * Parse wiki/_meta/compile-log.md into structured runs.
 * Each run looks like:
 *   ## 2026-04-21T10:30:00.000Z
 *   - promote: 29
 *   - defer:    108
 *   - graduate: 0
 *   - graduated: foo, bar           (only present if graduate > 0)
 *
 * Returns an array of { ts: Date, promote, defer, graduate, graduated: string[] }
 * sorted oldest → newest.
 */
export function parseCompileLog(text) {
  const runs = []
  // Split on `## <iso-timestamp>` headers.
  const blocks = text.split(/^## /m).slice(1)
  for (const block of blocks) {
    const tsLine = block.split('\n', 1)[0].trim()
    const ts = new Date(tsLine)
    if (isNaN(ts.getTime())) continue
    const promoteMatch = block.match(/^- promote:\s*(\d+)/m)
    const deferMatch = block.match(/^- defer:\s*(\d+)/m)
    const graduateMatch = block.match(/^- graduate:\s*(\d+)/m)
    const graduatedMatch = block.match(/^- graduated:\s*(.+)$/m)
    runs.push({
      ts,
      promote: promoteMatch ? Number(promoteMatch[1]) : 0,
      defer: deferMatch ? Number(deferMatch[1]) : 0,
      graduate: graduateMatch ? Number(graduateMatch[1]) : 0,
      graduated: graduatedMatch
        ? graduatedMatch[1].split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    })
  }
  return runs.sort((a, b) => a.ts - b.ts)
}

/**
 * Parse wiki/candidates.md into a list of currently-deferred themes.
 * Format: `- theme/slug  (1 source: source-slug)`
 */
export function parseCandidates(text) {
  const out = []
  for (const m of text.matchAll(/^- (\S+)\s+\(1 source: (\S+)\)/gm)) {
    out.push({ theme: m[1], source: m[2] })
  }
  return out
}

/**
 * Parse wiki/_meta/proposals.md to find already-issued proposals (so we
 * don't re-emit them). Returns a Set of proposal "subjects" — for each
 * detector, the unique key that identifies the proposal.
 *
 * Subjects are encoded as: `<TYPE>:<theme>` or `<TYPE>:backlog:<run-iso>`.
 */
export function parseExistingProposals(text) {
  const out = new Set()
  for (const m of text.matchAll(/^### PROP-\d+\s+\[([^\]]+)\]\s+(.+)$/gm)) {
    out.add(`${m[1]}:${m[2].trim()}`)
  }
  return out
}

/**
 * STUCK_CANDIDATE detector.
 * A theme in current candidates.md whose first-seen ts (from compile-log)
 * is older than `stuckDays` ago.
 *
 * @param {Array} candidates - parseCandidates() output
 * @param {Array} runs       - parseCompileLog() output
 * @param {Date}  now
 * @param {{stuckDays?: number}} opts
 */
export function detectStuckCandidates(candidates, runs, now, opts = {}) {
  const stuckDays = opts.stuckDays ?? STUCK_DAYS_DEFAULT
  const cutoff = new Date(now.getTime() - stuckDays * 24 * 60 * 60 * 1000)
  // Build first-seen map by walking compile-log forward and noting when
  // each theme first appears in a defer line. Compile-log doesn't list
  // deferred theme NAMES (only counts), so we proxy first-seen as
  // "earliest run that did NOT graduate this theme" — practically, we
  // only know first-seen for themes that graduated. For themes still
  // deferred, we use the OLDEST run as a lower-bound first-seen
  // (conservative — flags themes that have been around since the gate
  // started).
  const oldestRun = runs.length > 0 ? runs[0].ts : now
  const out = []
  for (const c of candidates) {
    if (oldestRun < cutoff) {
      out.push({
        type: 'STUCK_CANDIDATE',
        theme: c.theme,
        source: c.source,
        firstSeen: oldestRun,
        ageDays: Math.floor((now - oldestRun) / (24 * 60 * 60 * 1000)),
        recommendation: `Find a 2nd source for [[${c.theme}]] or remove it from candidates.md as out-of-scope.`,
      })
    }
  }
  return out
}

/**
 * REPEAT_GRADUATE detector.
 * Themes that appear in the `graduated:` line of more than one run.
 * Suggests a "flapping" theme — graduates, falls back below threshold,
 * graduates again. Worth investigating why.
 */
export function detectRepeatGraduates(runs) {
  const counts = new Map()
  const firstSeen = new Map()
  for (const run of runs) {
    for (const theme of run.graduated) {
      counts.set(theme, (counts.get(theme) || 0) + 1)
      if (!firstSeen.has(theme)) firstSeen.set(theme, run.ts)
    }
  }
  const out = []
  for (const [theme, count] of counts) {
    if (count > 1) {
      out.push({
        type: 'REPEAT_GRADUATE',
        theme,
        graduateCount: count,
        firstGraduated: firstSeen.get(theme),
        recommendation: `Theme [[${theme}]] graduated ${count}× — investigate why it keeps falling below the 2-source threshold (sources removed? renamed? merged into another theme?).`,
      })
    }
  }
  return out
}

/**
 * HEAVY_BACKLOG detector.
 * If the most recent compile run shows defer count > threshold, suggest
 * either narrowing scope (drop low-value candidates) or running compile
 * more often.
 */
export function detectHeavyBacklog(runs, opts = {}) {
  const threshold = opts.threshold ?? HEAVY_BACKLOG_DEFAULT
  if (runs.length === 0) return []
  const latest = runs[runs.length - 1]
  if (latest.defer <= threshold) return []
  return [{
    type: 'HEAVY_BACKLOG',
    deferCount: latest.defer,
    threshold,
    runTs: latest.ts,
    recommendation: `Latest compile deferred ${latest.defer} themes (>${threshold}). Consider: (a) running /foundry-compile more often, (b) auditing candidates.md for low-value themes to drop, or (c) seeding 2nd sources for the highest-leverage themes.`,
  }]
}

/**
 * Run all detectors against parsed inputs. Returns an array of proposals
 * in stable order (STUCK first, then REPEAT, then HEAVY).
 */
export function runDetectors({ candidates, runs, now }, opts = {}) {
  return [
    ...detectStuckCandidates(candidates, runs, now, opts),
    ...detectRepeatGraduates(runs),
    ...detectHeavyBacklog(runs, opts),
  ]
}

/**
 * Build a stable subject key for de-duplication against existing
 * proposals. Same shape as parseExistingProposals() returns.
 */
export function proposalKey(p) {
  switch (p.type) {
    case 'STUCK_CANDIDATE': return `${p.type}:${p.theme}`
    case 'REPEAT_GRADUATE': return `${p.type}:${p.theme}`
    case 'HEAVY_BACKLOG':   return `${p.type}:backlog:${p.runTs.toISOString()}`
    default: return `${p.type}:${JSON.stringify(p)}`
  }
}

/**
 * Filter out proposals that already exist in proposals.md.
 */
export function dedupeProposals(proposals, existing) {
  return proposals.filter((p) => !existing.has(proposalKey(p)))
}

/**
 * Format a proposal as a markdown block, given a sequence number.
 * The first line is the ### header (parsed back by parseExistingProposals).
 */
export function formatProposal(p, n) {
  const idStr = `PROP-${String(n).padStart(3, '0')}`
  const header = `### ${idStr} [${p.type}] ${proposalKey(p).split(':').slice(1).join(':')}`
  let body = ''
  switch (p.type) {
    case 'STUCK_CANDIDATE':
      body = `- theme: \`${p.theme}\`\n` +
             `- single source: \`${p.source}\`\n` +
             `- age: ${p.ageDays} days (since gate started or earliest run)\n` +
             `- recommendation: ${p.recommendation}\n`
      break
    case 'REPEAT_GRADUATE':
      body = `- theme: \`${p.theme}\`\n` +
             `- graduated count: ${p.graduateCount}\n` +
             `- first graduated: ${p.firstGraduated.toISOString()}\n` +
             `- recommendation: ${p.recommendation}\n`
      break
    case 'HEAVY_BACKLOG':
      body = `- defer count: ${p.deferCount} (threshold ${p.threshold})\n` +
             `- run: ${p.runTs.toISOString()}\n` +
             `- recommendation: ${p.recommendation}\n`
      break
  }
  return `${header}\n\n${body}`
}

export const DEFAULTS = { STUCK_DAYS_DEFAULT, HEAVY_BACKLOG_DEFAULT }
