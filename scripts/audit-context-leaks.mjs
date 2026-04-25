#!/usr/bin/env node
/**
 * audit-context-leaks.mjs
 *
 * For each agent contract, compute the effective context bundle and flag
 * any path that crosses tier boundaries downward (worker reading lead/
 * orchestrator content). Surfaces unintended strategy leaks before they
 * ship as silent context drift.
 *
 * Output: wiki/system/reports/tier-leak-audit-{date}.md
 *
 * Flags:
 *   --strict   Exit non-zero if any leak found (CI mode)
 *   --verbose  Print every excluded path too
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const KB_ROOT = path.resolve(__dirname, '..')
const strict = process.argv.includes('--strict')
const verbose = process.argv.includes('--verbose')

const { listContracts, loadAgentContext } = await import(path.join(KB_ROOT, 'lib/agent-runtime/index.mjs'))

// Tier descent: worker should NOT read leads or orchestrators.
//                lead   should NOT read orchestrators.
const FORBIDDEN_FOR_TIER = {
  worker: [/^wiki\/agents\/leads\//, /^wiki\/agents\/orchestrators\//],
  lead:   [/^wiki\/agents\/orchestrators\//],
  orchestrator: [],
}

const contracts = listContracts(KB_ROOT)
const findings = []

for (const c of contracts) {
  const bundle = loadAgentContext(KB_ROOT, c, {
    project: 'example-project',
    domain: c.domain || 'platform',
    agent: c.agent_id,
  })
  const forbidden = FORBIDDEN_FOR_TIER[c.tier] || []
  for (const f of bundle.files || []) {
    for (const re of forbidden) {
      if (re.test(f.path)) {
        findings.push({
          agent_id: c.agent_id,
          tier: c.tier,
          leaked_path: f.path,
          file_class: f.class,
          rule: re.source,
        })
      }
    }
  }
}

const today = new Date().toISOString().slice(0, 10)
const reportDir = path.join(KB_ROOT, 'wiki/system/reports')
fs.mkdirSync(reportDir, { recursive: true })
const reportPath = path.join(reportDir, `tier-leak-audit-${today}.md`)

const lines = [
  '---',
  `title: Tier Read-Leak Audit — ${today}`,
  'type: report',
  `date: ${today}`,
  `findings: ${findings.length}`,
  '---',
  '',
  `# Tier Read-Leak Audit — ${today}`,
  '',
  `Scanned ${contracts.length} contracts.`,
  `Findings: **${findings.length}**.`,
  '',
]

if (findings.length === 0) {
  lines.push('✓ No cross-tier reads detected. All workers stay in worker scope; all leads stay below orchestrator scope.')
} else {
  lines.push('## Leaks')
  lines.push('')
  lines.push('| Agent | Tier | Leaked Path | Class | Rule |')
  lines.push('|-------|------|-------------|-------|------|')
  for (const f of findings) {
    lines.push(`| ${f.agent_id} | ${f.tier} | \`${f.leaked_path}\` | ${f.file_class} | \`${f.rule}\` |`)
  }
}

fs.writeFileSync(reportPath, lines.join('\n') + '\n')

console.log(`Tier-leak audit: scanned ${contracts.length} contracts, ${findings.length} findings`)
console.log(`Report: ${path.relative(KB_ROOT, reportPath)}`)
if (verbose && findings.length > 0) {
  for (const f of findings) console.log(`  ${f.agent_id} (${f.tier}) → ${f.leaked_path}`)
}

if (strict && findings.length > 0) {
  console.error(`\n✗ STRICT MODE: ${findings.length} leak(s) — failing CI`)
  process.exit(2)
}
