// GitHub markdown sync. Fetch, filter, compare, write, archive.
import fs from 'fs'
import path from 'path'
import { importedDocPath, repoDocsRoot, isImportedDoc } from './paths.mjs'
import { makeImportedFrontmatter } from './metadata.mjs'
import { serializeFrontmatter, parseFrontmatter, updateFrontmatter } from '../agent-runtime/frontmatter.mjs'
import { appendAudit } from '../agent-runtime/audit.mjs'

export const INCLUDED_PATTERNS = [
  '*.md',
  '*.mdx',
  'docs/**/*.md',
  'docs/**/*.mdx',
  'specs/**/*.md',
  'plans/**/*.md',
  'reports/**/*.md',
  'architecture/**/*.md',
  'CLAUDE.md',
  'README.md',
]

export const EXCLUDED_PREFIXES = [
  'node_modules/',
  'dist/',
  'build/',
  '.next/',
  'generated/',
  'coverage/',
  '.git/',
]

function matchGlob(filePath, pattern) {
  // Simple glob matching: * matches non-/, ** matches anything
  let re = ''
  let i = 0
  while (i < pattern.length) {
    const c = pattern[i]
    if (c === '*') {
      if (pattern[i + 1] === '*') {
        re += '.*'
        i += 2
        if (pattern[i] === '/') i++
      } else {
        re += '[^/]*'
        i++
      }
    } else if (c === '?') {
      re += '[^/]'
      i++
    } else if ('.+^$()|{}[]\\'.includes(c)) {
      re += '\\' + c
      i++
    } else {
      re += c
      i++
    }
  }
  return new RegExp('^' + re + '$').test(filePath)
}

export function shouldInclude(filePath) {
  const normalized = filePath.replace(/\\/g, '/')

  // Check excluded prefixes first
  for (const prefix of EXCLUDED_PREFIXES) {
    if (normalized.startsWith(prefix)) return false
  }

  // Check included patterns
  for (const pattern of INCLUDED_PATTERNS) {
    if (matchGlob(normalized, pattern)) return true
  }

  return false
}

// Fetch tree and blobs from GitHub API.
export async function fetchRepoMarkdown(repoName, owner, opts = {}) {
  const { token, branch, commitSha } = opts
  const baseUrl = 'https://api.github.com/repos'
  const repo = `${owner}/${repoName}`

  // Fetch tree
  const treeBranch = commitSha || branch || 'main'
  const treeUrl = `${baseUrl}/${repo}/git/trees/${treeBranch}?recursive=1`

  const treeOpts = {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
    },
  }
  if (token) {
    treeOpts.headers['Authorization'] = `token ${token}`
  }

  let treeData
  try {
    const treeResp = await fetch(treeUrl, treeOpts)
    if (!treeResp.ok) {
      throw new Error(`GitHub tree fetch failed: ${treeResp.status} ${treeResp.statusText}`)
    }
    treeData = await treeResp.json()
  } catch (err) {
    throw new Error(`Failed to fetch tree from GitHub: ${err.message}`)
  }

  // Filter to markdown files
  const files = (treeData.tree || []).filter(item => {
    return item.type === 'blob' && shouldInclude(item.path)
  })

  // Fetch each blob
  const results = []
  for (const file of files) {
    try {
      const blobUrl = `${baseUrl}/${repo}/git/blobs/${file.sha}`
      const blobResp = await fetch(blobUrl, treeOpts)
      if (!blobResp.ok) {
        console.warn(`Skipping ${file.path}: blob fetch failed ${blobResp.status}`)
        continue
      }
      const blobData = await blobResp.json()
      const content = Buffer.from(blobData.content, 'base64').toString('utf8')
      results.push({
        path: file.path,
        content,
        sha: file.sha,
        download_url: `https://raw.githubusercontent.com/${repo}/${treeBranch}/${file.path}`,
      })
    } catch (err) {
      console.warn(`Skipping ${file.path}: ${err.message}`)
    }
  }

  return results
}

function ensureDir(full) {
  fs.mkdirSync(path.dirname(full), { recursive: true })
}

// Write a single imported doc with full frontmatter.
export function writeImportedDoc(kbRoot, repoName, repoVisibility, branch, commitSha, sourceFile) {
  const relPath = importedDocPath(kbRoot, repoName, sourceFile.path)
  const full = path.join(kbRoot, relPath)

  const fm = makeImportedFrontmatter({
    repo_name: repoName,
    repo_visibility: repoVisibility,
    source_type: 'github',
    branch,
    commit_sha: commitSha,
    source_path: sourceFile.path,
    imported_at: new Date().toISOString(),
    source_url: sourceFile.download_url,
  })

  const { data, content: existingBody } = parseFrontmatter(sourceFile.content)
  const mergedFm = { ...data, ...fm }
  const content = serializeFrontmatter(mergedFm, '\n' + existingBody)

  ensureDir(full)
  fs.writeFileSync(full, content)

  return relPath
}

// Move a file to archive and update frontmatter.
export function archiveRemovedDoc(kbRoot, repoName, relPath) {
  if (!isImportedDoc(relPath)) return null

  const full = path.join(kbRoot, relPath)
  if (!fs.existsSync(full)) return null

  const content = fs.readFileSync(full, 'utf8')
  const archived = updateFrontmatter(content, { archived_at: new Date().toISOString() })

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const filename = path.basename(relPath)
  const archivePath = `wiki/archive/repos/${repoName}/${today}/${filename}`
  const archiveFull = path.join(kbRoot, archivePath)

  ensureDir(archiveFull)
  fs.writeFileSync(archiveFull, archived)

  return archivePath
}

// Orchestrate the sync: fetch, compare, write, archive.
// Second arg can be a repo name string OR a full registry record object.
export async function syncRepo(kbRoot, repoNameOrRecord, opts = {}) {
  let repoRecord = repoNameOrRecord
  if (typeof repoNameOrRecord === 'string') {
    const { getRepo } = await import('./registry.mjs')
    repoRecord = getRepo(kbRoot, repoNameOrRecord)
    if (!repoRecord) throw new Error(`Repo not found in registry: ${repoNameOrRecord}`)
  }
  const repoName = repoRecord.repo_name
  const owner = repoRecord.owner
  const branch = repoRecord.default_branch || 'main'
  const visibility = repoRecord.visibility

  const trace = {
    repo_name: repoName,
    started_at: new Date().toISOString(),
    created: [],
    updated: [],
    archived: [],
    errors: [],
    commit_sha: null,
  }

  // Fetch from GitHub
  let sourceFiles
  try {
    sourceFiles = await fetchRepoMarkdown(repoName, owner, { ...opts, branch })
  } catch (err) {
    trace.errors.push({ type: 'fetch', message: err.message })
    appendAudit(kbRoot, { op: 'repo-sync-fetch-error', repo: repoName, error: err.message })
    return trace
  }

  // Record commit SHA if available
  if (sourceFiles.length > 0 && sourceFiles[0].sha) {
    trace.commit_sha = sourceFiles[0].sha
  }

  // Get existing docs
  const docsRoot = repoDocsRoot(kbRoot, repoName)
  const docsFull = path.join(kbRoot, docsRoot)
  const existingDocs = new Map()
  if (fs.existsSync(docsFull)) {
    function walkDocs(dir, prefix = '') {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const relName = prefix ? `${prefix}/${entry.name}` : entry.name
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          walkDocs(full, relName)
        } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
          existingDocs.set(relName, full)
        }
      }
    }
    walkDocs(docsFull)
  }

  // Write new/updated files
  const sourceSet = new Set()
  for (const sourceFile of sourceFiles) {
    try {
      const relPath = writeImportedDoc(kbRoot, repoName, visibility, branch, trace.commit_sha, sourceFile)
      sourceSet.add(relPath)

      // Check if this is new or updated
      if (existingDocs.has(path.relative(docsFull, path.join(kbRoot, relPath)))) {
        trace.updated.push(relPath)
      } else {
        trace.created.push(relPath)
      }
      appendAudit(kbRoot, { op: 'repo-doc-sync', repo: repoName, path: relPath, action: 'write' })
    } catch (err) {
      trace.errors.push({ type: 'write', path: sourceFile.path, message: err.message })
    }
  }

  // Archive removed docs
  for (const [relName, full] of existingDocs) {
    const relPath = `${docsRoot}/${relName}`
    if (!sourceSet.has(relPath)) {
      try {
        const archivePath = archiveRemovedDoc(kbRoot, repoName, relPath)
        if (archivePath) {
          trace.archived.push(relPath)
          appendAudit(kbRoot, { op: 'repo-doc-sync', repo: repoName, path: relPath, action: 'archive' })
        }
      } catch (err) {
        trace.errors.push({ type: 'archive', path: relPath, message: err.message })
      }
    }
  }

  trace.completed_at = new Date().toISOString()
  return trace
}
