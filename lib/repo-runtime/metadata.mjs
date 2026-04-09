// Source metadata for imported docs.
import { parseFrontmatter, serializeFrontmatter } from '../agent-runtime/frontmatter.mjs'

export const IMPORTED_DOC_FIELDS = [
  'repo_name',
  'repo_visibility',
  'source_type',
  'branch',
  'commit_sha',
  'source_path',
  'imported_at',
  'source_url',
]

// Build frontmatter object for an imported doc.
export function makeImportedFrontmatter(opts) {
  const {
    repo_name,
    repo_visibility,
    source_type = 'github',
    branch,
    commit_sha,
    source_path,
    imported_at = new Date().toISOString(),
    source_url,
  } = opts

  const fm = {
    repo_name,
    repo_visibility,
    source_type,
    branch,
    commit_sha,
    source_path,
    imported_at,
    source_url,
  }

  // Filter out undefined/null values
  for (const key of Object.keys(fm)) {
    if (fm[key] === undefined || fm[key] === null) {
      delete fm[key]
    }
  }

  return fm
}

// Parse frontmatter and return { meta, body }
export function parseImportedMeta(content) {
  const { data, content: body } = parseFrontmatter(content)
  return { meta: data, body }
}

// Check if file has source_type frontmatter field (marker of imported doc).
export function isImportedContent(content) {
  if (typeof content !== 'string') return false
  const { data } = parseFrontmatter(content)
  return !!data.source_type
}
