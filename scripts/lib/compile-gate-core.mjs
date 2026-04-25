/**
 * Pure helpers for the 2-source compile gate. Extracted so they can be
 * unit-tested without spawning subprocesses or touching the real wiki.
 *
 * No I/O here except buildIndex (which reads a directory of summary files).
 * Importing this module has zero side effects.
 */

import fs from 'node:fs/promises'
import path from 'node:path'

export const MIN_SOURCES = 2

/** Extract the YAML-ish frontmatter block as a raw string. */
export function extractFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/)
  return m ? m[1] : ''
}

/** Pull every wikilink slug from a frontmatter block (`related:` or inline). */
export function extractWikilinks(fm) {
  const out = new Set()
  for (const m of fm.matchAll(/\[\[([^\]|]+?)(?:\|[^\]]+)?\]\]/g)) {
    out.add(m[1].trim())
  }
  return [...out]
}

/** Pull `key_concepts: [a, b, c]` slugs (single-line list form). */
export function extractKeyConcepts(fm) {
  const m = fm.match(/^key_concepts:\s*\[(.+)\]\s*$/m)
  if (!m) return []
  return m[1].split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
}

/** Build (theme → Set<summarySlug>) inverted index from a summaries dir. */
export async function buildIndex(summariesDir) {
  const themes = new Map()
  const files = (await fs.readdir(summariesDir)).filter((f) => f.endsWith('.md'))
  for (const file of files) {
    const text = await fs.readFile(path.join(summariesDir, file), 'utf8')
    const fm = extractFrontmatter(text)
    const slug = file.replace(/\.md$/, '')
    const themesInFile = new Set([...extractWikilinks(fm), ...extractKeyConcepts(fm)])
    for (const theme of themesInFile) {
      if (!themes.has(theme)) themes.set(theme, new Set())
      themes.get(theme).add(slug)
    }
  }
  return themes
}

/**
 * Classify themes into promote / defer / graduate.
 * @param {Map<string, Set<string>>} themes
 * @param {Set<string>} priorCandidates  themes that were single-source last run
 * @param {Set<string>} existingPages    themes that already have a wiki page
 * @param {{force?: boolean}} opts
 */
export function classify(themes, priorCandidates, existingPages, opts = {}) {
  const force = !!opts.force
  const promote = []
  const defer = []
  const graduate = []
  for (const [theme, summarySet] of themes) {
    const sources = [...summarySet]
    const hasPage = existingPages.has(theme)
    if (sources.length >= MIN_SOURCES) {
      if (priorCandidates.has(theme)) graduate.push({ theme, sources })
      else promote.push({ theme, sources, hasPage })
    } else if (force) {
      promote.push({ theme, sources, hasPage, forced: true })
    } else {
      defer.push({ theme, sources })
    }
  }
  return { promote, defer, graduate }
}
