// Shared vault scanner used by kb-quality.mjs and kb-remediate.mjs. Offline: no
// dev server, no API calls, so the health pipeline can measure before/after a
// remediation in seconds. Uses the SAME orphan/stale logic as /api/lint (via
// lib/wiki-lint.mjs) so numbers are directly comparable.
import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
import {
  buildInboundLinkMap, isOrphanCandidate, isStalePage, normalizeLinkTarget, evaluateFreshness,
} from '../../lib/wiki-lint.mjs'

export function loadMatter(root) {
  return createRequire(path.join(root, 'web', 'package.json'))('gray-matter')
}

const iso = v => (v instanceof Date ? v.toISOString() : v)
const stripCode = s => s.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')

export function scanVault(root) {
  const wikiRoot = path.join(root, 'wiki')
  const matter = loadMatter(root)
  const pages = []
  const walk = dir => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith('.')) continue
      const full = path.join(dir, e.name)
      if (e.isDirectory()) { walk(full); continue }
      if (!e.name.endsWith('.md') || e.name === 'lint-report.md' || e.name === 'log.md') continue
      const relPath = path.relative(wikiRoot, full)
      let data = {}, content = '', malformed = false
      try { ({ data, content } = matter(fs.readFileSync(full, 'utf8'))) } catch { malformed = true }
      // `links` matches /api/lint exactly (code fences included) so orphan counts
      // are comparable; `cleanLinks` drops code so broken-link checks don't flag
      // example syntax inside fenced blocks.
      const extract = text => [
        ...[...text.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map(m => m[2]).filter(l => l.endsWith('.md') || l.startsWith('./')),
        ...[...text.matchAll(/\[\[([^\]]+)\]\]/g)].map(m => m[1]),
      ]
      const mdLinks = [], wikiLinks = extract(content)
      const cleanLinks = extract(stripCode(content))
      pages.push({
        relPath, malformed, content,
        title: data.title || e.name.replace(/\.md$/, ''),
        tags: Array.isArray(data.tags) ? data.tags : [],
        category: data.category, type: data.type, description: data.description,
        updated: iso(data.updated), lastVerified: iso(data.last_verified),
        staleAfterDays: typeof data.stale_after_days === 'number' ? data.stale_after_days : undefined,
        reviewCadenceDays: typeof data.review_cadence_days === 'number' ? data.review_cadence_days : undefined,
        links: [...mdLinks, ...wikiLinks], cleanLinks,
        wordCount: content.split(/\s+/).length,
      })
    }
  }
  walk(wikiRoot)
  return { root, wikiRoot, pages }
}

/** Key index mirroring buildInboundLinkMap's resolution rules. */
export function buildKeyIndex(pages) {
  const keys = new Map()
  const add = (k, p) => { if (!k) return; if (!keys.has(k)) keys.set(k, new Set()); keys.get(k).add(p) }
  for (const p of pages) {
    const n = normalizeLinkTarget(p.relPath)
    add(n, p.relPath); add(path.posix.basename(n), p.relPath)
    if (path.posix.basename(n) === 'index') add(path.posix.dirname(n), p.relPath)
  }
  return keys
}

export function resolveLink(raw, keys) {
  const n = normalizeLinkTarget(raw)
  if (!n || /^[a-z]+:/i.test(String(raw).trim())) return { skip: true }
  const hit = keys.get(n)
  if (hit?.size) return { targets: [...hit] }
  const fuzzy = new Set()
  for (const [k, ps] of keys) if (n.endsWith(`/${k}`) || k.endsWith(`/${n}`)) ps.forEach(p => fuzzy.add(p))
  return fuzzy.size ? { targets: [...fuzzy] } : { targets: [] }
}

// Vault root is the repo root (index.md links `wiki/home` and
// `knowledge-systems/...`), and log.md / lint-report.md are scanned out of the
// page set, so a link only counts as broken if no file exists for it anywhere.
function existsOnDisk(root, raw) {
  const n = normalizeLinkTarget(raw)
  if (['log', 'lint-report'].includes(path.posix.basename(n))) return true
  const rel = String(raw).split('|')[0].split('#')[0].replace(/^\.?\//, '')
  return [n, rel, rel.replace(/^(\.\.\/)+/, ''), rel.replace(/^wiki\//, '')]
    .flatMap(c => [c, `${c}.md`])
    .some(c => fs.existsSync(path.join(root, c)) || fs.existsSync(path.join(root, 'wiki', c)))
}

export function brokenLinks(pages, root) {
  const keys = buildKeyIndex(pages)
  const out = []
  for (const p of pages) {
    if (/^(_private|archive|_quarantine)\//.test(p.relPath)) continue
    for (const raw of new Set(p.cleanLinks)) {
      const r = resolveLink(raw, keys)
      if (r.skip || r.targets.length) continue
      if (root && existsOnDisk(root, raw)) continue
      out.push({ page: p.relPath, link: raw })
    }
  }
  return out
}

export function coreMetrics(pages) {
  const inbound = buildInboundLinkMap(pages)
  const orphans = pages.filter(p => isOrphanCandidate(p.relPath) && (inbound.get(p.relPath)?.length ?? 0) === 0)
  const stale = pages.filter(p => isStalePage(p))
  return { inbound, orphans, stale, pages: pages.length,
    stalePct: pages.length ? Math.floor((stale.length * 100) / pages.length) : 0 }
}

export { evaluateFreshness }
