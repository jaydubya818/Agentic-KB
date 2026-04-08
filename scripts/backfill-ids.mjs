#!/usr/bin/env node
/**
 * backfill-ids.mjs — add a stable `id: <ulid>` to every markdown file in
 * wiki/ and raw/ that doesn't have one. Idempotent.
 *
 * Usage: node scripts/backfill-ids.mjs [vaultRoot]
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const VAULT = path.resolve(process.argv[2] || process.cwd())
const SCAN = ['wiki', 'raw']
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

function enc(n, len) {
  let o = ''
  for (let i = 0; i < len; i++) { o = CROCKFORD[Number(n & 31n)] + o; n >>= 5n }
  return o
}
function ulid() {
  const t = enc(BigInt(Date.now()), 10)
  let r = 0n
  for (const b of crypto.randomBytes(10)) r = (r << 8n) | BigInt(b)
  return t + enc(r, 16)
}
function* walk(dir) {
  let ents
  try { ents = fs.readdirSync(dir, { withFileTypes: true }) } catch { return }
  for (const e of ents) {
    if (e.name.startsWith('.')) continue
    const full = path.join(dir, e.name)
    if (e.isDirectory()) yield* walk(full)
    else if (e.isFile() && e.name.endsWith('.md')) yield full
  }
}

let added = 0, skipped = 0, noFm = 0
for (const sub of SCAN) {
  const base = path.join(VAULT, sub)
  if (!fs.existsSync(base)) continue
  for (const abs of walk(base)) {
    const content = fs.readFileSync(abs, 'utf8')
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
    if (fmMatch) {
      if (/^id:\s*\S/m.test(fmMatch[1])) { skipped++; continue }
      const updated = `---\nid: ${ulid()}\n${fmMatch[1]}\n---${content.slice(fmMatch[0].length)}`
      fs.writeFileSync(abs, updated, 'utf8')
      added++
    } else {
      // prepend minimal frontmatter
      const updated = `---\nid: ${ulid()}\n---\n\n${content}`
      fs.writeFileSync(abs, updated, 'utf8')
      noFm++
      added++
    }
  }
}
console.log(`backfill-ids: added=${added} skipped=${skipped} (no-frontmatter=${noFm}) vault=${VAULT}`)
