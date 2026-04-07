/**
 * Wiki link parsing utilities.
 * Handles [[path]], [[path|Label]], [[wiki/path]], etc.
 */

export interface WikiLink {
  raw: string       // the full [[...]] match
  path: string      // the resolved path (without wiki/ prefix)
  label: string     // the display label
  href: string      // the Next.js href (/wiki/...)
}

/**
 * Parse a single wiki link string like "concepts/foo" or "concepts/foo|Label"
 */
export function parseWikiLinkTarget(target: string): { path: string; label: string; href: string } {
  const pipeIdx = target.indexOf('|')
  let rawPath: string
  let label: string

  if (pipeIdx !== -1) {
    rawPath = target.slice(0, pipeIdx).trim()
    label = target.slice(pipeIdx + 1).trim()
  } else {
    rawPath = target.trim()
    label = rawPath.split('/').pop()?.replace(/-/g, ' ') || rawPath
    // Capitalize first letter
    label = label.charAt(0).toUpperCase() + label.slice(1)
  }

  // Strip leading "wiki/" if present
  const cleanPath = rawPath.replace(/^wiki\//, '').replace(/\.md$/, '')

  return {
    path: cleanPath,
    label,
    href: `/wiki/${cleanPath}`,
  }
}

/**
 * Replace all [[wiki-links]] in markdown content with HTML anchor tags.
 * This is used in the ArticleRenderer for client-side rendering.
 */
export function replaceWikiLinks(content: string): string {
  return content.replace(/\[\[([^\]]+)\]\]/g, (match, inner) => {
    const { label, href } = parseWikiLinkTarget(inner)
    return `[${label}](${href})`
  })
}

/**
 * Extract all wiki links from a markdown document.
 */
export function extractWikiLinks(content: string): WikiLink[] {
  const links: WikiLink[] = []
  const pattern = /\[\[([^\]]+)\]\]/g
  let match: RegExpExecArray | null

  while ((match = pattern.exec(content)) !== null) {
    const { path, label, href } = parseWikiLinkTarget(match[1])
    links.push({
      raw: match[0],
      path,
      label,
      href,
    })
  }

  return links
}

/**
 * Build a regex that can find references to a given slug in markdown text.
 */
export function buildSlugPattern(slug: string): RegExp {
  const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\[\\[(?:wiki/)?${escaped}(?:\\|[^\\]]+)?\\]\\]`, 'gi')
}

/**
 * Generate a URL-safe slug from a title.
 */
export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Extract headings from markdown for ToC generation.
 */
export interface Heading {
  level: number
  text: string
  id: string
}

export function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = []
  const lines = content.split('\n')

  for (const line of lines) {
    const match = line.match(/^(#{1,4})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      // Generate an ID matching what remark/rehype would generate
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, '')
      headings.push({ level, text, id })
    }
  }

  return headings
}
