// Repo-scoped path helpers.

export function repoWikiRoot(kbRoot, repoName) {
  return `wiki/repos/${repoName}`
}

export function repoDocsRoot(kbRoot, repoName) {
  return `${repoWikiRoot(kbRoot, repoName)}/repo-docs`
}

export function repoCanonicalRoot(kbRoot, repoName) {
  return `${repoWikiRoot(kbRoot, repoName)}/canonical`
}

export function repoAgentMemoryRoot(kbRoot, repoName, tier, agentId) {
  return `${repoWikiRoot(kbRoot, repoName)}/agent-memory/${tier}/${agentId}`
}

export function repoBusRoot(kbRoot, repoName, channel) {
  return `${repoWikiRoot(kbRoot, repoName)}/bus/${channel}`
}

export function repoTasksRoot(kbRoot, repoName) {
  return `${repoWikiRoot(kbRoot, repoName)}/tasks`
}

export function repoRewritesRoot(kbRoot, repoName, type) {
  return `${repoWikiRoot(kbRoot, repoName)}/rewrites/${type}`
}

// Map a source file path to the imported doc path under repo-docs.
export function importedDocPath(kbRoot, repoName, sourcePath) {
  const normalized = sourcePath.replace(/\\/g, '/')
  const ext = normalized.endsWith('.mdx') ? '.mdx' : '.md'
  const base = normalized.replace(/\.(md|mdx)$/, '')
  return `${repoDocsRoot(kbRoot, repoName)}/${base}${ext}`
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
