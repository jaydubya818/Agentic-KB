import { NextResponse } from 'next/server'
import fs from 'fs'
import os from 'os'
import path from 'path'

export const dynamic = 'force-dynamic'

const SKIP_DIRS = new Set(['.obsidian', '.git', 'node_modules', '.next'])

interface ObsidianVault {
  path: string
  ts: number
  open?: boolean
}

function countMdFiles(vaultPath: string): number {
  const wikiDir = path.join(vaultPath, 'wiki')
  const root = fs.existsSync(wikiDir) ? wikiDir : vaultPath
  let count = 0
  function walk(dir: string, depth = 0): void {
    if (depth > 6 || !fs.existsSync(dir)) return
    try {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (SKIP_DIRS.has(entry.name)) continue
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) walk(full, depth + 1)
        else if (entry.name.endsWith('.md')) count++
      }
    } catch { /* ignore */ }
  }
  walk(root)
  return count
}

export async function GET() {
  const configPath = path.join(os.homedir(), 'Library/Application Support/obsidian/obsidian.json')
  try {
    const raw = fs.readFileSync(configPath, 'utf8')
    const config = JSON.parse(raw) as { vaults: Record<string, ObsidianVault> }
    const vaults = Object.entries(config.vaults).map(([id, v]) => ({
      id,
      name: path.basename(v.path),
      path: v.path,
      fileCount: countMdFiles(v.path),
    }))
    return NextResponse.json({ vaults })
  } catch {
    return NextResponse.json({ vaults: [] })
  }
}
