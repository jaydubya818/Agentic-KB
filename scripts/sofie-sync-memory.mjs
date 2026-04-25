#!/usr/bin/env node
/**
 * sofie-sync-memory.mjs
 *
 * Vault-canonical Memory.md → KB profile.md mirror sync.
 * Reads $OBSIDIAN_VAULT_ROOT/Memory.md, updates KB
 * wiki/agents/leads/sofie/profile.md frontmatter:
 *   - last_synced_from_vault: ISO ts
 *   - vault_memory_hash: sha256[:16] of Memory.md content
 *
 * Memory.md content is NOT copied (avoids bloat + drift). Profile
 * remains a thin pointer with synced metadata.
 *
 * Usage:
 *   node scripts/sofie-sync-memory.mjs           # sync
 *   node scripts/sofie-sync-memory.mjs --dry-run # preview
 */
import fs from 'fs'
import os from 'os'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const KB_ROOT = path.resolve(__dirname, '..')
const VAULT = process.env.OBSIDIAN_VAULT_ROOT || path.join(os.homedir(), 'Documents', 'Obsidian Vault')

const dryRun = process.argv.includes('--dry-run')

const memoryPath = path.join(VAULT, 'Memory.md')
const profilePath = path.join(KB_ROOT, 'wiki/agents/leads/sofie/profile.md')

if (!fs.existsSync(memoryPath)) {
  console.error(`✗ Vault Memory.md not found: ${memoryPath}`)
  process.exit(1)
}
if (!fs.existsSync(profilePath)) {
  console.error(`✗ KB profile.md not found: ${profilePath}`)
  process.exit(1)
}

const memoryContent = fs.readFileSync(memoryPath, 'utf8')
const profileContent = fs.readFileSync(profilePath, 'utf8')

const hash = crypto.createHash('sha256').update(memoryContent, 'utf8').digest('hex').slice(0, 16)
const ts = new Date().toISOString()

const fmEnd = profileContent.indexOf('\n---', 4)
if (!profileContent.startsWith('---\n') || fmEnd === -1) {
  console.error('✗ profile.md missing frontmatter')
  process.exit(1)
}
const fm = profileContent.slice(4, fmEnd)
const body = profileContent.slice(fmEnd + 4)

const lines = fm.split('\n').filter(l => !l.startsWith('last_synced_from_vault:') && !l.startsWith('vault_memory_hash:'))
lines.push(`last_synced_from_vault: ${ts}`)
lines.push(`vault_memory_hash: ${hash}`)
const newProfile = `---\n${lines.join('\n')}\n---${body}`

console.log(`Memory.md: ${memoryContent.length} bytes, hash ${hash}`)
console.log(`Profile:   ${profilePath}`)
console.log(`Action:    ${dryRun ? 'DRY-RUN' : 'WRITE'}`)

if (dryRun) {
  console.log('--- new frontmatter preview ---')
  console.log(`---\n${lines.join('\n')}\n---`)
} else {
  fs.writeFileSync(profilePath, newProfile)
  console.log('✓ profile.md frontmatter updated')
}
