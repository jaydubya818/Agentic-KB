// PII / secret redaction — applied to Vault → KB ingest before staging in raw/.
// Default rules cover email, phone, SSN, credit card, JWT, AWS keys.
// Custom client-name rules loaded from config/redaction.yaml when present.
// Audited per redaction (count + rule fired, never the redacted content).
import fs from 'fs'
import path from 'path'
import { parse as yamlParse } from 'yaml'

const DEFAULT_RULES = [
  { id: 'email', re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, replacement: '[EMAIL]' },
  { id: 'phone-us', re: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, replacement: '[PHONE]' },
  { id: 'ssn', re: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[SSN]' },
  { id: 'credit-card', re: /\b(?:\d[ -]?){13,19}\b/g, replacement: '[CARD]' },
  { id: 'jwt', re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, replacement: '[JWT]' },
  { id: 'aws-access-key', re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g, replacement: '[AWS_KEY]' },
  { id: 'aws-secret', re: /\b[A-Za-z0-9/+=]{40}\b/g, replacement: '[AWS_SECRET?]' },
  { id: 'private-key-pem', re: /-----BEGIN [A-Z ]+PRIVATE KEY-----[\s\S]+?-----END [A-Z ]+PRIVATE KEY-----/g, replacement: '[PRIVATE_KEY]' },
]

export function loadCustomRules(kbRoot) {
  const file = path.join(kbRoot, 'config', 'redaction.yaml')
  if (!fs.existsSync(file)) return []
  try {
    const cfg = yamlParse(fs.readFileSync(file, 'utf8')) || {}
    const out = []
    for (const r of cfg.rules || []) {
      if (!r.id || !r.pattern) continue
      const flags = (r.flags || 'g').includes('g') ? r.flags : (r.flags || '') + 'g'
      out.push({
        id: String(r.id),
        re: new RegExp(r.pattern, flags),
        replacement: r.replacement || `[${String(r.id).toUpperCase()}]`,
      })
    }
    return out
  } catch (err) {
    console.error(`[redaction] failed to parse config/redaction.yaml: ${err.message}`)
    return []
  }
}

/**
 * Apply rules to content. Returns { redacted, hits: [{rule, count}], total }.
 * Never returns the redacted content itself in `hits`.
 */
export function redact(content, rules = DEFAULT_RULES) {
  let out = String(content)
  const counts = new Map()
  for (const rule of rules) {
    let count = 0
    out = out.replace(rule.re, () => { count++; return rule.replacement })
    if (count > 0) counts.set(rule.id, count)
  }
  const hits = [...counts.entries()].map(([rule, count]) => ({ rule, count }))
  const total = hits.reduce((s, h) => s + h.count, 0)
  return { redacted: out, hits, total }
}

/** Default + custom rules merged. */
export function loadAllRules(kbRoot) {
  return [...DEFAULT_RULES, ...loadCustomRules(kbRoot)]
}

/** Convenience: default-rules redaction without kbRoot wiring. */
export function redactDefault(content) {
  return redact(content, DEFAULT_RULES)
}

export const _DEFAULT_RULES = DEFAULT_RULES
