#!/usr/bin/env node
/**
 * Agentic KB CLI
 * Query and search the knowledge base from the terminal.
 *
 * Usage:
 *   kb search "multi-agent orchestration"
 *   kb search "tool design" --scope all
 *   kb query "What is the best pattern for a supervisor-worker system?"
 *   kb read concepts/tool-use
 *   kb list concepts
 *   kb pending
 *
 * Environment variables:
 *   KB_API_URL   - Base URL of the web server (default: http://localhost:3002)
 *   PRIVATE_PIN  - PIN for accessing private content
 */

const API_URL = process.env.KB_API_URL || 'http://localhost:3002'
const PRIVATE_PIN = process.env.PRIVATE_PIN || ''

const args = process.argv.slice(2)
const command = args[0]

function usage() {
  console.log(`
Agentic KB CLI — Query your knowledge base from the terminal

Commands:
  kb search <query> [--scope public|private|all] [--limit N]
  kb query <question> [--scope public|private|all] [--pin <pin>]
  kb read <slug>
  kb list <section>
  kb pending

Examples:
  kb search "multi-agent orchestration"
  kb search "tool design" --scope all
  kb query "What is the best pattern for supervisor-worker agents?"
  kb read concepts/tool-use
  kb list frameworks
  kb pending
`)
}

function parseArgs(args) {
  const opts = { scope: 'public', limit: 10, pin: PRIVATE_PIN }
  const positional = []
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--scope') opts.scope = args[++i]
    else if (args[i] === '--limit') opts.limit = parseInt(args[++i], 10)
    else if (args[i] === '--pin') opts.pin = args[++i]
    else positional.push(args[i])
  }
  return { opts, positional }
}

async function search(query, scope, limit) {
  const params = new URLSearchParams({ q: query, scope, limit: String(limit) })
  if (scope !== 'public' && PRIVATE_PIN) params.set('pin', PRIVATE_PIN)

  const res = await fetch(`${API_URL}/api/search?${params}`)
  if (res.status === 401) {
    console.error('❌ Invalid PIN. Set PRIVATE_PIN env var to access private content.')
    process.exit(1)
  }
  const data = await res.json()
  const results = data.results || []

  if (results.length === 0) {
    console.log(`No results for "${query}" (scope: ${scope})`)
    return
  }

  console.log(`\n🔍 ${results.length} result(s) for "${query}" [scope: ${scope}]\n`)
  for (const r of results) {
    const badges = [
      r.meta.vault ? '✦ VAULT' : '',
      r.meta.visibility === 'private' ? '🔒 PRIVATE' : '',
    ].filter(Boolean).join(' ')
    console.log(`  ${r.meta.title}  ${badges}`)
    console.log(`  → /wiki/${r.meta.slug}  [${r.meta.type}]`)
    console.log(`    ${r.snippet.slice(0, 120)}...`)
    console.log()
  }
}

async function query(question, scope = 'public', pin = '') {
  console.log(`\n🤖 Querying KB: ${question}\n`)
  process.stdout.write('   ')

  const res = await fetch(`${API_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(pin ? { 'x-private-pin': pin } : {}) },
    body: JSON.stringify({ question, scope, pin }),
  })

  if (!res.body) {
    console.error('❌ Query API unavailable. Is the KB server running at', API_URL, '?')
    process.exit(1)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const text = decoder.decode(value)
    for (const line of text.split('\n')) {
      if (!line.startsWith('data: ')) continue
      try {
        const data = JSON.parse(line.slice(6))
        if ((data.type === 'token' || data.type === 'answer') && data.content) process.stdout.write(data.content)
        if (data.type === 'sources' && data.sources?.length) {
          console.log('\n\n📚 Sources:')
          for (const s of data.sources) console.log(`  → ${s}`)
        }
        if (data.type === 'done') break
      } catch { /* skip */ }
    }
  }
  console.log('\n')
}

async function readArticle(slug) {
  const cleanSlug = slug.replace(/\.md$/, '')
  const res = await fetch(`${API_URL}/wiki/${cleanSlug}`)
  // Fall back to reading the raw file directly
  const fs = await import('fs')
  const path = await import('path')
  const KB_ROOT = new URL('..', import.meta.url).pathname
  const filePath = path.join(KB_ROOT, 'wiki', cleanSlug + '.md')
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    console.log(content)
  } catch {
    console.error(`❌ Article not found: ${slug}`)
    process.exit(1)
  }
}

async function listSection(section) {
  const fs = await import('fs')
  const path = await import('path')
  const KB_ROOT = new URL('..', import.meta.url).pathname
  const sectionDir = path.join(KB_ROOT, 'wiki', section)

  if (!fs.existsSync(sectionDir)) {
    console.error(`❌ Section not found: ${section}`)
    process.exit(1)
  }

  const files = fs.readdirSync(sectionDir).filter(f => f.endsWith('.md'))
  console.log(`\n📂 ${section} — ${files.length} articles\n`)

  for (const f of files) {
    const content = fs.readFileSync(path.join(sectionDir, f), 'utf8')
    const titleMatch = content.match(/^title:\s*(.+)$/m)
    const title = titleMatch ? titleMatch[1].replace(/^["']|["']$/g, '') : f.replace(/\.md$/, '')
    const vaultMatch = content.match(/^vault:\s*true/m)
    const privMatch = content.match(/^visibility:\s*private/m)
    const badge = [vaultMatch ? '✦' : '', privMatch ? '🔒' : ''].filter(Boolean).join('')
    console.log(`  ${title} ${badge}`)
    console.log(`  → ${section}/${f.replace(/\.md$/, '')}`)
    console.log()
  }
}

async function pending() {
  const res = await fetch(`${API_URL}/api/pending-count`)
  const data = await res.json()
  const count = data.count || 0

  if (count === 0) {
    console.log('✅ No pending files — all raw materials have been ingested.')
  } else {
    console.log(`\n⚡ ${count} file(s) pending ingestion`)
    console.log(`   Run: open ${API_URL}/process  (or visit in browser)`)
    console.log(`   Or:  curl -X POST ${API_URL}/api/process/run-all\n`)
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────

if (!command || command === 'help' || command === '--help') {
  usage()
  process.exit(0)
}

const { opts, positional } = parseArgs(args.slice(1))

try {
  if (command === 'search') {
    if (!positional[0]) { console.error('Usage: kb search <query>'); process.exit(1) }
    await search(positional.join(' '), opts.scope, opts.limit)
  } else if (command === 'query') {
    if (!positional[0]) { console.error('Usage: kb query <question>'); process.exit(1) }
    await query(positional.join(' '), opts.scope, opts.pin)
  } else if (command === 'read') {
    if (!positional[0]) { console.error('Usage: kb read <slug>'); process.exit(1) }
    await readArticle(positional[0])
  } else if (command === 'list') {
    if (!positional[0]) { console.error('Usage: kb list <section>'); process.exit(1) }
    await listSection(positional[0])
  } else if (command === 'pending') {
    await pending()
  } else {
    console.error(`Unknown command: ${command}`)
    usage()
    process.exit(1)
  }
} catch (err) {
  console.error(`❌ ${err.message}`)
  process.exit(1)
}
