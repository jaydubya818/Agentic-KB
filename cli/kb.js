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
    else if (args[i] === '--mode') opts.mode = args[++i]
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


async function compile(mode, pin) {
  console.log('\n⚙️  Compiling KB (mode: ' + mode + ')...\n')
  const res = await fetch(`${API_URL}/api/compile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(pin ? { 'x-private-pin': pin } : {}) },
    body: JSON.stringify({ mode, pin }),
  })
  if (!res.body) { console.error('Compile API unavailable.'); process.exit(1) }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const parts = buf.split('\n\n')
    buf = parts.pop() || ''
    for (const part of parts) {
      if (!part.startsWith('data: ')) continue
      try {
        const data = JSON.parse(part.slice(6))
        if (data.type === 'progress') console.log('  i ', data.message)
        if (data.type === 'compiling') console.log('  . ', data.file)
        if (data.type === 'page') console.log('    ' + (data.op === 'create' ? '[new]' : '[upd]') + ' ' + data.path)
        if (data.type === 'skip') console.log('  skip ', data.file, '-', data.reason)
        if (data.type === 'done') { console.log('\nDone: ' + data.message); break }
        if (data.type === 'error') { console.error('Error: ' + data.message); process.exit(1) }
      } catch(e) { }
    }
  }
  console.log()
}

async function lint(pin) {
  console.log('\nRunning wiki lint...\n')
  const res = await fetch(`${API_URL}/api/lint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(pin ? { 'x-private-pin': pin } : {}) },
    body: JSON.stringify({ pin }),
  })
  const data = await res.json()
  if (data.ok) {
    console.log('  Pages scanned:  ' + data.pagesScanned)
    console.log('  Contradictions: ' + data.contradictions)
    console.log('  Orphaned pages: ' + data.orphans)
    console.log('  Stale pages:    ' + data.stalePages)
    console.log('  Knowledge gaps: ' + data.gaps)
    console.log('\nReport saved to wiki/lint-report.md')
    console.log('Done: ' + data.summary)
  } else {
    console.error('Error: ' + data.error)
    process.exit(1)
  }
}


async function ingestYoutube(url) {
  const { execSync, spawnSync } = await import('child_process')
  const fs = await import('fs')
  const path = await import('path')

  // Check yt-dlp is installed
  const check = spawnSync('which', ['yt-dlp'], { encoding: 'utf8' })
  if (check.status !== 0) {
    console.error('\n❌ yt-dlp is not installed.')
    console.error('   Install it with: brew install yt-dlp')
    console.error('   Or:              pip install yt-dlp')
    process.exit(1)
  }

  console.log('\n📺 Fetching YouTube transcript...')
  console.log('   URL:', url)

  const tmpDir = '/tmp/kb-yt-' + Date.now()
  fs.mkdirSync(tmpDir, { recursive: true })

  try {
    // Get video metadata (title, description, upload date)
    const metaResult = spawnSync('yt-dlp', [
      '--skip-download',
      '--print', '%(title)s|||%(uploader)s|||%(upload_date)s|||%(duration_string)s|||%(description)s',
      url
    ], { encoding: 'utf8', cwd: tmpDir })

    let title = 'YouTube Video', uploader = '', uploadDate = '', duration = '', description = ''
    if (metaResult.stdout) {
      const parts = metaResult.stdout.trim().split('|||')
      title = parts[0] || title
      uploader = parts[1] || ''
      uploadDate = parts[2] || ''
      duration = parts[3] || ''
      description = (parts[4] || '').slice(0, 500)
    }

    console.log('   Title:', title)

    // Download auto-generated subtitles as SRT
    spawnSync('yt-dlp', [
      '--skip-download',
      '--write-auto-sub',
      '--sub-langs', 'en',
      '--convert-subs', 'srt',
      '--output', '%(id)s',
      url
    ], { encoding: 'utf8', cwd: tmpDir })

    // Find the SRT file
    const files = fs.readdirSync(tmpDir)
    const srtFile = files.find(f => f.endsWith('.srt'))
    let transcript = ''

    if (srtFile) {
      const raw = fs.readFileSync(path.join(tmpDir, srtFile), 'utf8')
      // Parse SRT: remove timestamps and sequence numbers, deduplicate lines
      const lines = raw.split('\n')
      const textLines = []
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        if (/^\d+$/.test(trimmed)) continue              // sequence number
        if (/-->/.test(trimmed)) continue                  // timestamp
        if (textLines[textLines.length - 1] === trimmed) continue  // duplicate
        textLines.push(trimmed)
      }
      transcript = textLines.join(' ').replace(/<[^>]+>/g, '').trim()
      console.log('   Transcript:', Math.round(transcript.length / 5), 'words approx')
    } else {
      console.log('   No auto-subtitles found — using description only')
      transcript = description
    }

    // Write to raw/transcripts/
    const KB_ROOT = new URL('..', import.meta.url).pathname
    const outDir = path.join(KB_ROOT, 'raw', 'transcripts')
    fs.mkdirSync(outDir, { recursive: true })

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
    const date = uploadDate ? uploadDate.slice(0, 4) + '-' + uploadDate.slice(4, 6) + '-' + uploadDate.slice(6, 8) : new Date().toISOString().slice(0, 10)
    const filename = date + '-' + slug + '.md'
    const outPath = path.join(outDir, filename)

    const frontmatter = [
      '---',
      'title: "' + title.replace(/"/g, "'") + '"',
      'type: transcript',
      'source: youtube',
      'url: ' + url,
      'author: ' + uploader,
      'date: ' + date,
      'duration: ' + duration,
      'tags: [youtube, transcript]',
      '---',
      '',
      '# ' + title,
      '',
      '**Channel:** ' + uploader + '  ',
      '**Date:** ' + date + '  ',
      '**Duration:** ' + duration,
      '',
      '## Transcript',
      '',
      transcript,
    ].join('\n')

    fs.writeFileSync(outPath, frontmatter, 'utf8')
    console.log('\n✅ Saved to raw/transcripts/' + filename)
    console.log('   Run: kb compile  to ingest it into the wiki')

  } finally {
    // Cleanup tmp
    try { execSync('rm -rf ' + tmpDir) } catch(e) {}
  }
}

async function ingestTwitterArchive(archivePath) {
  const fs = await import('fs')
  const path = await import('path')
  const { execSync } = await import('child_process')

  if (!archivePath) {
    console.error('Usage: kb ingest-twitter <path-to-archive.zip or archive-folder>')
    process.exit(1)
  }

  const resolvedPath = archivePath.replace(/^~/, process.env.HOME)

  // Unzip if needed
  let archiveDir = resolvedPath
  if (resolvedPath.endsWith('.zip')) {
    console.log('\n🐦 Unzipping Twitter archive...')
    archiveDir = '/tmp/kb-twitter-' + Date.now()
    fs.mkdirSync(archiveDir, { recursive: true })
    execSync('unzip -q "' + resolvedPath + '" -d "' + archiveDir + '"')
  }

  // Find data files
  const dataDir = fs.existsSync(path.join(archiveDir, 'data'))
    ? path.join(archiveDir, 'data')
    : archiveDir

  const KB_ROOT = new URL('..', import.meta.url).pathname
  const outDir = path.join(KB_ROOT, 'raw', 'twitter')
  fs.mkdirSync(outDir, { recursive: true })

  let totalSaved = 0

  // Helper: parse Twitter JS files (they start with "window.YTD.tweets.part0 = ")
  function parseTwitterJs(filePath) {
    if (!fs.existsSync(filePath)) return []
    const raw = fs.readFileSync(filePath, 'utf8')
    const jsonStr = raw.replace(/^[^[{]*/, '').replace(/;\s*$/, '')
    try { return JSON.parse(jsonStr) } catch { return [] }
  }

  // 1. Tweets
  const tweetsFile = path.join(dataDir, 'tweets.js')
  const tweets = parseTwitterJs(tweetsFile)
  if (tweets.length > 0) {
    console.log('\n🐦 Processing', tweets.length, 'tweets...')
    const tweetLines = []
    for (const item of tweets) {
      const t = item.tweet || item
      const text = t.full_text || t.text || ''
      if (text.startsWith('RT @')) continue  // skip retweets
      const date = t.created_at ? new Date(t.created_at).toISOString().slice(0, 10) : ''
      const likes = t.favorite_count || 0
      const rts = t.retweet_count || 0
      tweetLines.push('**' + date + '** (❤️ ' + likes + ' 🔁 ' + rts + ')  ')
      tweetLines.push(text.replace(/https:\/\/t\.co\/\S+/g, '').trim())
      tweetLines.push('')
    }

    const tweetsOut = [
      '---',
      'title: "My X/Twitter Tweets Archive"',
      'type: transcript',
      'source: twitter-archive',
      'tags: [twitter, personal, archive]',
      'date: ' + new Date().toISOString().slice(0, 10),
      '---',
      '',
      '# My X/Twitter Tweets',
      '',
      tweetLines.join('\n'),
    ].join('\n')

    fs.writeFileSync(path.join(outDir, 'tweets-archive.md'), tweetsOut)
    totalSaved++
    console.log('   ✅ Tweets saved (' + tweets.filter(t => !(t.tweet?.full_text || t.full_text || '').startsWith('RT @')).length + ' original tweets)')
  }

  // 2. Bookmarks
  const bookmarksFile = path.join(dataDir, 'bookmarks.js')
  const bookmarks = parseTwitterJs(bookmarksFile)
  if (bookmarks.length > 0) {
    console.log('   Processing', bookmarks.length, 'bookmarks...')
    const bookmarkLines = []
    for (const item of bookmarks) {
      const t = item.tweet || item
      const text = t.full_text || t.text || ''
      const url = 'https://twitter.com/i/web/status/' + (t.id_str || t.id || '')
      bookmarkLines.push('- **' + (text.slice(0, 120)) + '...**')
      bookmarkLines.push('  ' + url)
      bookmarkLines.push('')
    }

    const bookmarksOut = [
      '---',
      'title: "My X/Twitter Bookmarks Archive"',
      'type: transcript',
      'source: twitter-archive',
      'tags: [twitter, bookmarks, archive]',
      'date: ' + new Date().toISOString().slice(0, 10),
      '---',
      '',
      '# My X/Twitter Bookmarks',
      '',
      bookmarkLines.join('\n'),
    ].join('\n')

    fs.writeFileSync(path.join(outDir, 'bookmarks-archive.md'), bookmarksOut)
    totalSaved++
    console.log('   ✅ Bookmarks saved (' + bookmarks.length + ' bookmarks)')
  }

  if (totalSaved === 0) {
    console.log('\n⚠️  No tweets or bookmarks found.')
    console.log("   Make sure you're passing the archive folder or .zip file.")
    console.log('   Twitter archives contain data/tweets.js and data/bookmarks.js')
  } else {
    console.log('\n✅ Archive imported to raw/twitter/')
    console.log('   Run: kb compile  to compile into the wiki')
  }

  // Cleanup tmp unzip
  if (resolvedPath.endsWith('.zip')) {
    try { execSync('rm -rf "' + archiveDir + '"') } catch(e) {}
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
  } else if (command === 'compile') {
    await compile(opts.mode || 'incremental', opts.pin)
  } else if (command === 'lint') {
    await lint(opts.pin)
  } else if (command === 'ingest-youtube') {
    if (!positional[0]) { console.error('Usage: kb ingest-youtube <url>'); process.exit(1) }
    await ingestYoutube(positional[0])
  } else if (command === 'ingest-twitter') {
    await ingestTwitterArchive(positional[0])
  } else {
    console.error(`Unknown command: ${command}`)
    usage()
    process.exit(1)
  }
} catch (err) {
  console.error(`❌ ${err.message}`)
  process.exit(1)
}
