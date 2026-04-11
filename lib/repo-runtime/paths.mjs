// Repo-scoped path helpers.
// All functions return relative paths under the vault root — kbRoot is never needed here.

export function repoWikiRoot(repoName) {
  return `wiki/repos/${repoName}`
}

export function repoDocsRoot(repoName) {
  return `${repoWikiRoot(repoName)}/repo-docs`
}

export function repoCanonicalRoot(repoName) {
  return `${repoWikiRoot(repoName)}/canonical`
}

export function repoAgentMemoryRoot(repoName, tier, agentId) {
  return `${repoWikiRoot(repoName)}/agent-memory/${tier}/${agentId}`
}

export function repoBusRoot(repoName, channel) {
  return `${repoWikiRoot(repoName)}/bus/${channel}`
}

export function repoTasksRoot(repoName) {
  return `${repoWikiRoot(repoName)}/tasks`
}

export function repoRewritesRoot(repoName, type) {
  return `${repoWikiRoot(repoName)}/rewrites/${type}`
}

// Map a source file path to the imported doc path under repo-docs.
export function importedDocPath(repoName, sourcePath) {
  const normalized = sourcePath.replace(/\\/g, '/')
  const ext = normalized.endsWith('.mdx') ? '.mdx' : '.md'
  const base = normalized.replace(/\.(md|mdx)$/, '')
  return `${repoDocsRoot(repoName)}/${base}${ext}`
}

// Check if a relative path is under wiki/repos/*/repo-docs/
export function isImportedDoc(relPath) {
  const normalized = relPath.replace(/\\/g, '/')
  return /^wiki\/repos\/[^/]+\/repo-docs\//.test(normalized)
}

// Check if a relative path is under wiki/repos/ but NOT repo-docs/
export function isOperationalDoc(relPath) {
  const normalized = relPath.replace(/\\/g, '/')
  if (!/^wiki\/repos\/[^/]+\//.test(normalized)) return false
  return !isImportedDoc(normalized)
}

// Throw if someone tries to write to an imported doc path.
export function assertNotImportedDoc(relPath) {
  if (isImportedDoc(relPath)) {
    throw new Error(`Cannot write directly to imported doc: ${relPath}. Use sync workflow instead.`)
  }
}
