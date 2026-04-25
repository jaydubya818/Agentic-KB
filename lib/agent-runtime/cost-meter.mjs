// API cost meter — tracks Claude/Anthropic token usage + USD spend.
// Daily rollover by ts. Hard cap from env KB_DAILY_COST_CAP_USD (default 5).
// Logs to logs/api-cost.log (JSONL).
import fs from 'fs'
import path from 'path'

// Token → USD pricing (Anthropic claude-sonnet-4-x family approx).
// Update when models shift. Conservative defaults.
const PRICING = {
  'claude-sonnet-4-5': { input_per_mtok: 3.00, output_per_mtok: 15.00 },
  'claude-sonnet-4-6': { input_per_mtok: 3.00, output_per_mtok: 15.00 },
  'claude-opus-4-5':   { input_per_mtok: 15.00, output_per_mtok: 75.00 },
  'claude-opus-4-6':   { input_per_mtok: 15.00, output_per_mtok: 75.00 },
  'claude-haiku-4-5':  { input_per_mtok: 0.80, output_per_mtok: 4.00 },
  default:             { input_per_mtok: 3.00, output_per_mtok: 15.00 },
}

function pricingFor(model) {
  for (const k of Object.keys(PRICING)) {
    if (model && model.includes(k)) return PRICING[k]
  }
  return PRICING.default
}

export function computeCost(usage = {}, model = 'default') {
  const p = pricingFor(model)
  const inTok = usage.input_tokens || 0
  const outTok = usage.output_tokens || 0
  return (inTok / 1e6) * p.input_per_mtok + (outTok / 1e6) * p.output_per_mtok
}

export function recordApiCall(kbRoot, { model, usage, label = 'kb-query' }) {
  const cost = computeCost(usage, model)
  try {
    const dir = path.join(kbRoot, 'logs')
    fs.mkdirSync(dir, { recursive: true })
    fs.appendFileSync(
      path.join(dir, 'api-cost.log'),
      JSON.stringify({
        ts: new Date().toISOString(),
        model,
        input_tokens: usage.input_tokens || 0,
        output_tokens: usage.output_tokens || 0,
        cost_usd: Number(cost.toFixed(6)),
        label,
      }) + '\n',
    )
  } catch {}
  return cost
}

export function dailyCapUsd() {
  const v = parseFloat(process.env.KB_DAILY_COST_CAP_USD || '5')
  return Number.isFinite(v) && v > 0 ? v : 5
}

export function readCostLog(kbRoot) {
  const file = path.join(kbRoot, 'logs', 'api-cost.log')
  if (!fs.existsSync(file)) return []
  return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean)
    .map(l => { try { return JSON.parse(l) } catch { return null } })
    .filter(Boolean)
}

export function spendForDay(kbRoot, isoDate = new Date().toISOString().slice(0, 10)) {
  return readCostLog(kbRoot)
    .filter(e => e.ts.startsWith(isoDate))
    .reduce((s, e) => s + (e.cost_usd || 0), 0)
}

export function spendForMonth(kbRoot, ymPrefix = new Date().toISOString().slice(0, 7)) {
  return readCostLog(kbRoot)
    .filter(e => e.ts.startsWith(ymPrefix))
    .reduce((s, e) => s + (e.cost_usd || 0), 0)
}

/**
 * Pre-flight check before an API call. Throws if past cap.
 * Use as: assertWithinDailyCap(KB_ROOT)
 */
export function assertWithinDailyCap(kbRoot) {
  const cap = dailyCapUsd()
  const today = spendForDay(kbRoot)
  if (today >= cap) {
    throw new Error(`KB daily cost cap reached: $${today.toFixed(2)} / $${cap.toFixed(2)} (KB_DAILY_COST_CAP_USD)`)
  }
  return { today, cap, remaining: cap - today }
}

export function summary(kbRoot) {
  const today = spendForDay(kbRoot)
  const month = spendForMonth(kbRoot)
  const cap = dailyCapUsd()
  const log = readCostLog(kbRoot)
  const byModel = {}
  for (const e of log) byModel[e.model || 'unknown'] = (byModel[e.model || 'unknown'] || 0) + (e.cost_usd || 0)
  return {
    today_usd: Number(today.toFixed(4)),
    month_usd: Number(month.toFixed(4)),
    daily_cap_usd: cap,
    pct_of_cap: cap ? Number(((today / cap) * 100).toFixed(1)) : 0,
    by_model: Object.fromEntries(Object.entries(byModel).map(([k, v]) => [k, Number(v.toFixed(4))])),
    total_calls: log.length,
  }
}
