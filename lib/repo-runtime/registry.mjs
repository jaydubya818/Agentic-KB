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
    const content = fs.readFileSync(full, 'utf8')
    return JSON.parse(content) || []
  } catch {
    return []
  }
}

export function saveRegistry(kbRoot, records) {
  const full = path.join(kbRoot, REGISTRY_PATH)
  ensureDir(full)
  fs.writeFileSync(full, JSON.stringify(records, null, 2) + '\n')
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
