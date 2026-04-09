// Repo registry CRUD. Reads/writes config/repos/registry.json.
import fs from 'fs'
import path from 'path'

const REGISTRY_PATH = 'config/repos/registry.json'

function ensureDir(full) {
  fs.mkdirSync(path.dirname(full), { recursive: true })
}

export function loadRegistry(kbRoot) {
  const full = path.join(kbRoot, REGISTRY_PATH)
  if (!fs.existsSync(full)) return []
  try {
    const parsed = JSON.parse(fs.readFileSync(full, 'utf8'))
    // Support both plain array format and wrapped { version, repos: [...] } format
    if (Array.isArray(parsed)) return parsed
    if (parsed && Array.isArray(parsed.repos)) return parsed.repos
    return []
  } catch {
    return []
  }
}

export function saveRegistry(kbRoot, records) {
  const full = path.join(kbRoot, REGISTRY_PATH)
  ensureDir(full)
  // Read existing wrapper metadata if present, otherwise create fresh
  let wrapper = { version: '1.0' }
  if (fs.existsSync(full)) {
    try {
      const existing = JSON.parse(fs.readFileSync(full, 'utf8'))
      if (existing && !Array.isArray(existing)) wrapper = existing
    } catch { /* ignore */ }
  }
  wrapper.repos = records
  wrapper.updated_at = new Date().toISOString()
  fs.writeFileSync(full, JSON.stringify(wrapper, null, 2) + '\n')
}

export function getRepo(kbRoot, repoName) {
  const records = loadRegistry(kbRoot)
  return records.find(r => r.repo_name === repoName) || null
}

export function upsertRepo(kbRoot, record) {
  const records = loadRegistry(kbRoot)
  const idx = records.findIndex(r => r.repo_name === record.repo_name)
  if (idx >= 0) {
    records[idx] = { ...records[idx], ...record }
  } else {
    records.push(record)
  }
  saveRegistry(kbRoot, records)
  return records[idx >= 0 ? idx : records.length - 1]
}

export function listRepos(kbRoot) {
  return loadRegistry(kbRoot)
}

export function markSynced(kbRoot, repoName, { commit_sha, file_count }) {
  const record = getRepo(kbRoot, repoName)
  if (!record) throw new Error(`Repo not found: ${repoName}`)
  return upsertRepo(kbRoot, {
    repo_name: repoName,
    last_sync_at: new Date().toISOString(),
    last_synced_commit: commit_sha,
    markdown_file_count: file_count,
    status: 'active',
  })
}
