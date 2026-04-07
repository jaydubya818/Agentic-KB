import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export const KB_ROOT = '/Users/jaywest/Agentic-KB'
export const WIKI_ROOT = path.join(KB_ROOT, 'wiki')

export interface ArticleMeta {
  path: string        // relative path from KB_ROOT e.g. "wiki/concepts/foo.md"
  slug: string        // route-friendly e.g. "concepts/foo"
  title: string
  type: string
  tags: string[]
  confidence?: string
  created?: string
  updated?: string
  description?: string
  category?: string
  vendor?: string
  version?: string
  jay_experience?: string
  difficulty?: string
  time_estimate?: string
}

export interface ArticleContent {
  meta: ArticleMeta
  content: string
  rawContent: string
}

const WIKI_SECTIONS = [
  'concepts',
  'patterns',
  'frameworks',
  'entities',
  'recipes',
  'evaluations',
  'personal',
  'summaries',
  'syntheses',
]

/**
 * Parse frontmatter from a markdown file and return metadata + content.
 */
export function parseArticle(filePath: string): ArticleContent | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(raw)

    // Build relative path from KB_ROOT
    const relPath = path.relative(KB_ROOT, filePath).replace(/\\/g, '/')
    // Build slug: strip "wiki/" prefix and ".md" extension
    const slug = relPath
      .replace(/^wiki\//, '')
      .replace(/\.md$/, '')

    // Extract title from frontmatter or first H1 in content
    let title = (data.title as string) || ''
    if (!title) {
      const h1Match = content.match(/^#\s+(.+)$/m)
      title = h1Match ? h1Match[1].trim() : slug
    }

    // gray-matter parses YAML dates as Date objects — stringify everything
    const toStr = (v: unknown): string | undefined => {
      if (v === undefined || v === null) return undefined
      if (v instanceof Date) return v.toISOString().slice(0, 10)
      return String(v)
    }

    const meta: ArticleMeta = {
      path: relPath,
      slug,
      title,
      type: toStr(data.type) || 'article',
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      confidence: toStr(data.confidence),
      created: toStr(data.created),
      updated: toStr(data.updated),
      description: toStr(data.description),
      category: toStr(data.category),
      vendor: toStr(data.vendor),
      version: toStr(data.version),
      jay_experience: toStr(data.jay_experience),
      difficulty: toStr(data.difficulty),
      time_estimate: toStr(data.time_estimate),
    }

    return { meta, content, rawContent: raw }
  } catch {
    return null
  }
}

/**
 * List all markdown files in wiki/ recursively.
 */
export function listAllWikiFiles(): string[] {
  const results: string[] = []

  function walk(dir: string): void {
    if (!fs.existsSync(dir)) return
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.name.endsWith('.md')) {
        results.push(fullPath)
      }
    }
  }

  walk(WIKI_ROOT)
  return results
}

/**
 * List wiki files in a specific section.
 */
export function listSectionFiles(section: string): string[] {
  const sectionDir = path.join(WIKI_ROOT, section)
  if (!fs.existsSync(sectionDir)) return []
  return fs.readdirSync(sectionDir)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(sectionDir, f))
}

/**
 * Get all articles grouped by section.
 */
export interface SectionGroup {
  section: string
  label: string
  articles: ArticleMeta[]
}

const SECTION_LABELS: Record<string, string> = {
  concepts: 'Concepts',
  patterns: 'Patterns',
  frameworks: 'Frameworks',
  entities: 'Entities',
  recipes: 'Recipes',
  evaluations: 'Evaluations',
  personal: 'Personal',
  summaries: 'Summaries',
  syntheses: 'Syntheses',
}

export function getArticlesBySection(): SectionGroup[] {
  return WIKI_SECTIONS.map(section => {
    const files = listSectionFiles(section)
    const articles = files
      .map(f => parseArticle(f))
      .filter((a): a is ArticleContent => a !== null)
      .map(a => a.meta)
    return {
      section,
      label: SECTION_LABELS[section] || section,
      articles,
    }
  })
}

/**
 * Find an article by its slug (route path without leading /wiki/).
 */
export function findArticleBySlug(slug: string): ArticleContent | null {
  // slug might be "concepts/foo" or "concepts/foo.md"
  const cleanSlug = slug.replace(/\.md$/, '')

  // Try direct path first
  const directPath = path.join(WIKI_ROOT, cleanSlug + '.md')
  if (fs.existsSync(directPath)) {
    return parseArticle(directPath)
  }

  // Try searching all wiki files
  const allFiles = listAllWikiFiles()
  for (const filePath of allFiles) {
    const relPath = path.relative(WIKI_ROOT, filePath).replace(/\\/g, '/').replace(/\.md$/, '')
    if (relPath === cleanSlug) {
      return parseArticle(filePath)
    }
  }

  return null
}

/**
 * Get backlinks: which wiki pages link to the given slug.
 */
export function getBacklinks(targetSlug: string): ArticleMeta[] {
  const allFiles = listAllWikiFiles()
  const backlinks: ArticleMeta[] = []

  // The target can be linked as [[concepts/foo]], [[wiki/concepts/foo]], [[foo]], etc.
  const baseName = targetSlug.split('/').pop() || ''

  for (const filePath of allFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      // Look for wiki links containing the target slug or its basename
      const wikiLinkPattern = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g
      let match
      while ((match = wikiLinkPattern.exec(content)) !== null) {
        const linkedPath = match[1].trim()
          .replace(/^wiki\//, '')
          .replace(/\.md$/, '')
        if (linkedPath === targetSlug || linkedPath === baseName ||
            linkedPath.endsWith('/' + baseName)) {
          const article = parseArticle(filePath)
          if (article && article.meta.slug !== targetSlug) {
            backlinks.push(article.meta)
          }
          break
        }
      }
    } catch {
      // Skip unreadable files
    }
  }

  return backlinks
}

/**
 * Search across all wiki articles for a query string.
 */
export interface SearchResult {
  meta: ArticleMeta
  snippet: string
  score: number
}

export function searchArticles(query: string, limit = 20): SearchResult[] {
  if (!query.trim()) return []

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  const allFiles = listAllWikiFiles()
  const results: SearchResult[] = []

  for (const filePath of allFiles) {
    const article = parseArticle(filePath)
    if (!article) continue

    const fullText = (article.meta.title + ' ' + article.content).toLowerCase()
    let score = 0
    let matchPos = -1

    for (const term of terms) {
      const idx = fullText.indexOf(term)
      if (idx !== -1) {
        score++
        if (matchPos === -1) matchPos = idx
        // Bonus for title matches
        if (article.meta.title.toLowerCase().includes(term)) score += 2
      }
    }

    if (score > 0) {
      // Extract snippet around first match
      const rawText = article.content
      const rawLower = rawText.toLowerCase()
      let snippetStart = 0
      for (const term of terms) {
        const idx = rawLower.indexOf(term)
        if (idx !== -1) {
          snippetStart = Math.max(0, idx - 60)
          break
        }
      }
      const snippet = rawText.slice(snippetStart, snippetStart + 200).replace(/^[^\s]+ /, '...')

      results.push({ meta: article.meta, snippet, score })
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * Read the index.md file content.
 */
export function readIndex(): string {
  const indexPath = path.join(WIKI_ROOT, 'index.md')
  try {
    return fs.readFileSync(indexPath, 'utf8')
  } catch {
    return ''
  }
}

/**
 * Read a specific file from KB_ROOT given a relative path.
 */
export function readKBFile(relPath: string): string {
  try {
    const fullPath = path.join(KB_ROOT, relPath)
    return fs.readFileSync(fullPath, 'utf8')
  } catch {
    return ''
  }
}

/**
 * Write raw material file with frontmatter.
 */
export interface RawMaterial {
  title: string
  type: string
  content: string
  sourceUrl?: string
}

export function writeRawMaterial(material: RawMaterial): string {
  const slug = material.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const now = new Date().toISOString().split('T')[0]
  const typeDir = path.join(KB_ROOT, 'raw', material.type)

  // Ensure directory exists
  if (!fs.existsSync(typeDir)) {
    fs.mkdirSync(typeDir, { recursive: true })
  }

  const frontmatter = [
    '---',
    `title: "${material.title}"`,
    `type: ${material.type}`,
    `date_ingested: ${now}`,
    material.sourceUrl ? `source_url: "${material.sourceUrl}"` : null,
    'status: raw',
    '---',
    '',
  ].filter(Boolean).join('\n')

  const fileContent = frontmatter + material.content
  const filePath = path.join(typeDir, slug + '.md')

  fs.writeFileSync(filePath, fileContent, 'utf8')

  return `raw/${material.type}/${slug}.md`
}

export { WIKI_SECTIONS }
