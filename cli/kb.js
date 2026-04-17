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

// Resolve KB root from this script location: cli/kb.js -> repo root
import pathMod from 'path'
import os from 'os'
import { fileURLToPath } from 'url'
import { safeJoin, validateSlug } from '../lib/agent-runtime/safe-path.mjs'
const AGENT_KB_ROOT = pathMod.resolve(pathMod.dirname(fileURLToPath(import.meta.url)), '..')

/** Expand a leading ~ using HOME or os.homedir(); throw if neither is set. */
function expandHome(p) {
  if (typeof p !== 'string' || !p.startsWith('~')) return p
  const home = process.env.HOME || os.homedir()
  if (!home) throw new Error('Cannot expand ~: HOME and os.homedir() are both empty')
  return p.replace(/^~/, home)
}
const AGENT_RUNTIME_PATH = pathMod.join(AGENT_KB_ROOT, 'lib/agent-runtime/index.mjs')
const REPO_RUNTIME_PATH = pathMod.join(AGENT_KB_ROOT, 'lib/repo-runtime/index.mjs')

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
  kb compile [--mode full|incremental]
  kb lint
  kb reindex            Rebuild wiki/index.md from actual files on disk
  kb ingest-file <path> Convert any file to markdown (via markitdown) and drop into raw/
  kb ingest-youtube <url>
  kb ingest-twitter <archive.zip>

Repo commands:
  kb repo list                               List all tracked repos with status
  kb repo show <name>                        Show full repo details
  kb repo sync <name> [--token <pat>]        Sync a repo from GitHub
  kb repo sync-all [--token <pat>]           Sync all active repos
  kb repo search <name> <query>              Search within a specific repo's docs
  kb repo status <name>                      Show sync status, last SHA, doc count
  kb repo docs <name> [--section <s>]        List imported docs for a repo
  kb repo progress <name>                    Show progress.md for a repo
  kb repo close-task <name> <agent> --payload <file.json> [--dry-run]

Bus & Rewrite commands:
  kb bus list <name> <channel>               List bus items for a repo channel
  kb bus publish <name> <channel> --from <id> --body <text>  Publish bus item
  kb bus transition <name> <channel> <id> <status>           Change item status
  kb rewrite list <name>                     List rewrite artifacts for a repo
  kb canonical list <name>                   List canonical docs for a repo
  kb canonical show <name> <doc>             Show a canonical doc (e.g., PRD, TECH_STACK)

Agent runtime commands:
  kb agent context <agent-id> [--project <p>]
  kb agent start-task <agent-id> [--project <p>] [--description <d>] [--task-id <tid>]
  kb agent active-task <agent-id>
  kb agent status <agent-id> [--last <n>]
  kb agent append-state <agent-id> <task-id> "<entry>"
  kb agent verify-state <agent-id>
  kb agent repair-state <agent-id>
  kb agent abandon-task <agent-id> <task-id> [--reason <r>]
  kb agent close-task <agent-id> --payload <file.json> [--dry-run]
  kb agent trace <agent-id> [--last <n>]

Examples:
  kb search "multi-agent orchestration"
  kb query "What is the best pattern for supervisor-worker agents?"
  kb read concepts/tool-use
  kb list frameworks
  kb reindex
  kb ingest-file ~/Downloads/paper.pdf
  kb ingest-file ~/Documents/spec.docx --dir framework-docs
  kb repo list
  kb repo sync my-project --token ghp_xxxxx
  kb repo search my-project "authentication"
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
  let cleanSlug
  try {
    cleanSlug = validateSlug(String(slug || '').replace(/\.md$/, ''), 'slug')
  } catch (e) {
    console.error(`❌ Invalid slug: ${e.message}`)
    process.exit(1)
  }
  const res = await fetch(`${API_URL}/wiki/${cleanSlug}`)
  // Fall back to reading the raw file directly
  const fs = await import('fs')
  const KB_ROOT = new URL('..', import.meta.url).pathname
  let filePath
  try {
    filePath = safeJoin(KB_ROOT, 'wiki', cleanSlug + '.md')
  } catch (e) {
    console.error(`❌ Invalid slug path: ${e.message}`)
    process.exit(1)
  }
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
  const KB_ROOT = new URL('..', import.meta.url).pathname
  let sectionDir
  try {
    const safeSection = validateSlug(String(section || ''), 'section')
    sectionDir = safeJoin(KB_ROOT, 'wiki', safeSection)
  } catch (e) {
    console.error(`❌ Invalid section: ${e.message}`)
    process.exit(1)
  }

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
    // Cleanup tmp — fs.rmSync replaces shell `rm -rf`, no injection surface.
    try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch(e) {}
  }
}

async function ingestTwitterArchive(archivePath) {
  const fs = await import('fs')
  const path = await import('path')
  const { spawnSync } = await import('child_process')

  if (!archivePath) {
    console.error('Usage: kb ingest-twitter <path-to-archive.zip or archive-folder>')
    process.exit(1)
  }

  let resolvedPath
  try {
    resolvedPath = expandHome(archivePath)
  } catch (e) {
    console.error(`❌ ${e.message}`)
    process.exit(1)
  }

  // Unzip if needed — use spawnSync with args array (no shell, no injection via filename)
  let archiveDir = resolvedPath
  if (resolvedPath.endsWith('.zip')) {
    console.log('\n🐦 Unzipping Twitter archive...')
    archiveDir = path.join(os.tmpdir(), 'kb-twitter-' + Date.now())
    fs.mkdirSync(archiveDir, { recursive: true })
    const r = spawnSync('unzip', ['-q', resolvedPath, '-d', archiveDir], { stdio: 'inherit' })
    if (r.status !== 0) {
      console.error(`❌ unzip failed with status ${r.status}`)
      process.exit(1)
    }
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

  // Cleanup tmp unzip — fs.rmSync replaces shell `rm -rf`, no injection surface.
  if (resolvedPath.endsWith('.zip')) {
    try { fs.rmSync(archiveDir, { recursive: true, force: true }) } catch(e) {}
  }
}

// ─── ingest-file (markitdown) ────────────────────────────────────────────────

async function ingestFile(filePath, opts) {
  const { spawnSync } = await import('child_process')
  const fs = await import('fs')
  const path = await import('path')

  if (!filePath) {
    console.error('Usage: kb ingest-file <path> [--dir <raw-subdir>]')
    process.exit(1)
  }

  let resolved
  try { resolved = expandHome(filePath) } catch (e) { console.error('❌ ' + e.message); process.exit(1) }
  if (!fs.existsSync(resolved)) {
    console.error(`❌ File not found: ${resolved}`)
    process.exit(1)
  }

  // Check markitdown is installed
  const check = spawnSync('python3', ['-m', 'markitdown', '--version'], { encoding: 'utf8' })
  const check2 = check.status !== 0
    ? spawnSync('markitdown', ['--version'], { encoding: 'utf8' })
    : { status: 0 }

  if (check.status !== 0 && check2.status !== 0) {
    console.error('\n❌ markitdown is not installed.')
    console.error('   Install it with: pip install markitdown[all] --break-system-packages')
    console.error('   Or:              pip3 install markitdown[all]')
    process.exit(1)
  }

  const cmd = check.status === 0 ? 'python3' : 'markitdown'
  const cmdArgs = check.status === 0 ? ['-m', 'markitdown', resolved] : [resolved]

  console.log(`\n📄 Converting ${path.basename(resolved)} via markitdown...`)

  const result = spawnSync(cmd, cmdArgs, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
  if (result.status !== 0) {
    console.error('❌ markitdown conversion failed:')
    console.error(result.stderr || result.stdout)
    process.exit(1)
  }

  const markdown = result.stdout
  if (!markdown || markdown.trim().length < 50) {
    console.error('❌ markitdown returned empty or very short output. File may be unsupported.')
    process.exit(1)
  }

  // Determine output subdirectory
  const subdir = opts.dir || inferRawSubdir(resolved)
  const KB_ROOT = new URL('..', import.meta.url).pathname
  const outDir = path.join(KB_ROOT, 'raw', subdir)
  fs.mkdirSync(outDir, { recursive: true })

  // Generate output filename
  const basename = path.basename(resolved, path.extname(resolved))
  const slug = basename.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
  const date = new Date().toISOString().slice(0, 10)
  const outFilename = `${date}-${slug}.md`
  const outPath = path.join(outDir, outFilename)

  // Prepend minimal frontmatter
  const frontmatter = [
    '---',
    `title: "${basename.replace(/"/g, "'")}"`,
    `source_file: ${path.basename(resolved)}`,
    `date_ingested: ${date}`,
    `tags: [${subdir}]`,
    '---',
    '',
  ].join('\n')

  fs.writeFileSync(outPath, frontmatter + markdown, 'utf8')

  console.log(`✅ Saved to raw/${subdir}/${outFilename}`)
  console.log(`   Words: ~${Math.round(markdown.length / 5)}`)
  console.log(`   Run: kb compile  to ingest into the wiki`)
}

function inferRawSubdir(filePath) {
  const ext = filePath.split('.').pop()?.toLowerCase() || ''
  if (['pdf'].includes(ext)) return 'papers'
  if (['docx', 'doc'].includes(ext)) return 'framework-docs'
  if (['pptx', 'ppt'].includes(ext)) return 'conversations'
  if (['mp3', 'mp4', 'wav', 'm4a', 'webm'].includes(ext)) return 'transcripts'
  if (['xlsx', 'xls', 'csv'].includes(ext)) return 'framework-docs'
  return 'note'
}

// ─── reindex ─────────────────────────────────────────────────────────────────

async function reindex(pin) {
  console.log('\n🗂️  Rebuilding wiki/index.md...\n')
  const res = await fetch(`${API_URL}/api/reindex`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(pin ? { 'x-private-pin': pin } : {}) },
    body: JSON.stringify({ pin }),
  })
  if (!res.ok) {
    // If the API endpoint doesn't exist yet, do a local rebuild
    console.log('   (API not available — using local rebuild)')
    await reindexLocal()
    return
  }
  const data = await res.json()
  if (data.ok) {
    console.log(`✅ Index rebuilt: ${data.pagesIndexed} pages across ${data.sections} sections`)
  } else {
    // Fallback to local
    await reindexLocal()
  }
}

async function reindexLocal() {
  const fs = await import('fs')
  const path = await import('path')
  const KB_ROOT = new URL('..', import.meta.url).pathname
  const wikiDir = path.join(KB_ROOT, 'wiki')

  const sections = ['concepts', 'patterns', 'frameworks', 'entities', 'recipes', 'evaluations', 'summaries', 'syntheses', 'personal']
  const counts = {}
  let total = 0

  for (const section of sections) {
    const sectionDir = path.join(wikiDir, section)
    if (!fs.existsSync(sectionDir)) { counts[section] = 0; continue }
    const files = fs.readdirSync(sectionDir).filter(f => f.endsWith('.md'))
    counts[section] = files.length
    total += files.length
  }

  // Read current index.md and update section count headers
  const indexPath = path.join(wikiDir, 'index.md')
  if (!fs.existsSync(indexPath)) {
    console.error('❌ wiki/index.md not found')
    process.exit(1)
  }

  let content = fs.readFileSync(indexPath, 'utf8')
  for (const [section, count] of Object.entries(counts)) {
    const capitalized = section.charAt(0).toUpperCase() + section.slice(1)
    // Update count in section headers like "## Concepts (16)"
    content = content.replace(
      new RegExp(`## ${capitalized}s?\\s*\\(\\d+\\)`, 'g'),
      `## ${capitalized}${section.endsWith('s') ? '' : 's'} (${count})`
    )
  }

  fs.writeFileSync(indexPath, content, 'utf8')
  console.log(`✅ Index counts updated: ${total} pages across ${sections.length} sections`)
  for (const [s, c] of Object.entries(counts)) {
    if (c > 0) console.log(`   ${s}: ${c}`)
  }
}

// ─── Agent Runtime Commands ───────────────────────────────────────────────

async function agentCmd(sub, rest) {
  const rt = await import(AGENT_RUNTIME_PATH)
  if (sub === 'list') {
    const contracts = rt.listContracts(AGENT_KB_ROOT)
    if (contracts.length === 0) { console.log('No agents configured.'); return }
    for (const c of contracts) {
      console.log(`- ${c.agent_id} [${c.tier}] domain=${c.domain || '-'} team=${c.team || '-'}`)
    }
    return
  }
  if (sub === 'show') {
    const id = rest[0]
    if (!id) throw new Error('Usage: kb agent show <agent-id>')
    const c = rt.loadContract(AGENT_KB_ROOT, id)
    if (!c) throw new Error(`Agent not found: ${id}`)
    console.log(JSON.stringify(c, null, 2))
    return
  }
  if (sub === 'context') {
    const id = rest[0]
    if (!id) throw new Error('Usage: kb agent context <agent-id> [--project <p>]')
    const projectIdx = rest.indexOf('--project')
    const project = projectIdx >= 0 ? rest[projectIdx + 1] : null
    const c = rt.loadContract(AGENT_KB_ROOT, id)
    if (!c) throw new Error(`Agent not found: ${id}`)
    const bundle = rt.loadAgentContext(AGENT_KB_ROOT, c, { project, domain: c.domain, agent: id })
    console.log(`\n=== Context for ${id} (${c.tier}) ===`)
    console.log(`Budget: ${bundle.trace.budget_used}/${bundle.trace.budget_bytes} bytes${bundle.trace.truncated ? ' (TRUNCATED)' : ''}`)
    console.log(`Files included (${bundle.files.length}):`)
    for (const f of bundle.files) console.log(`  [${f.class}] ${f.path} (${f.bytes}B) — ${f.reason}`)
    if (bundle.trace.excluded.length) {
      console.log(`\nExcluded (${bundle.trace.excluded.length}):`)
      for (const e of bundle.trace.excluded) console.log(`  ${e.path} — ${e.reason}`)
    }
    return
  }
  // ── start-task ─────────────────────────────────────────────────────────────
  if (sub === 'start-task') {
    const id = rest[0]
    if (!id) throw new Error('Usage: kb agent start-task <agent-id> [--project <p>] [--description <d>] [--task-id <tid>]')
    const projectIdx = rest.indexOf('--project')
    const descIdx = rest.indexOf('--description')
    const taskIdIdx = rest.indexOf('--task-id')
    const project = projectIdx >= 0 ? rest[projectIdx + 1] : null
    const description = descIdx >= 0 ? rest[descIdx + 1] : ''
    const taskId = taskIdIdx >= 0 ? rest[taskIdIdx + 1] : undefined
    const c = rt.loadContract(AGENT_KB_ROOT, id)
    const result = rt.startTask(AGENT_KB_ROOT, c, { project, description, taskId })
    console.log(`✅ Task started: ${result.taskId}`)
    console.log(`   working-memory: ${result.workingMemoryPath}`)
    console.log(`   active-task:    ${result.activeTaskPath}`)
    return
  }

  // ── active-task ────────────────────────────────────────────────────────────
  if (sub === 'active-task') {
    const id = rest[0]
    if (!id) throw new Error('Usage: kb agent active-task <agent-id>')
    const c = rt.loadContract(AGENT_KB_ROOT, id)
    const active = rt.getActiveTask(AGENT_KB_ROOT, c)
    if (!active) {
      console.log(`No active task for ${id}`)
    } else {
      console.log(`\nActive task: ${active.taskId}`)
      console.log(`  project:     ${active.project || '—'}`)
      console.log(`  description: ${active.description || '—'}`)
      console.log(`  started:     ${active.started}`)
      console.log(`  state file:  ${active.workingMemoryPath}`)
    }
    return
  }

  if (sub === 'status') {
    const id = rest[0]
    const limitIdx = rest.indexOf('--last')
    const traceLimit = limitIdx >= 0 ? parseInt(rest[limitIdx + 1], 10) : 5
    if (!id) throw new Error('Usage: kb agent status <agent-id> [--last <n>]')
    const c = rt.loadContract(AGENT_KB_ROOT, id)
    const status = rt.getAgentStatus(AGENT_KB_ROOT, c, { traceLimit })
    console.log(`\n=== Agent Status: ${id} (${status.tier}) ===`)
    console.log(`Domain: ${status.domain || '—'}`)
    console.log(`Active task: ${status.active_task ? status.active_task.taskId : 'none'}`)
    if (status.active_task) {
      console.log(`  project: ${status.active_task.project || '—'}`)
      console.log(`  state:   ${status.active_task.workingMemoryPath}`)
    }
    console.log(`Close policy:`)
    console.log(`  required_fields: ${(status.close_policy.required_fields || []).join(', ') || 'none'}`)
    console.log(`  at_least_one_of: ${(status.close_policy.at_least_one_of || []).join(', ') || 'none'}`)
    console.log(`  require_active_task: ${status.close_policy.require_active_task === true}`)
    console.log(`Verification: ${status.verification.ok ? 'OK' : 'ISSUES'}`)
    if (status.verification.issues.length) {
      for (const issue of status.verification.issues) {
        console.log(`  [${issue.severity}] ${issue.code}${issue.repairable ? ' (repairable)' : ''}`)
      }
    }
    if (status.recent_traces.length) {
      console.log(`Recent traces:`)
      for (const trace of status.recent_traces) {
        console.log(`  [${trace.ts}] ${trace.type}`)
      }
    }
    return
  }

  // ── append-state ───────────────────────────────────────────────────────────
  if (sub === 'append-state') {
    const id = rest[0]
    const taskId = rest[1]
    const entry = rest[2]
    if (!id || !taskId || !entry) throw new Error('Usage: kb agent append-state <agent-id> <task-id> "<entry>"')
    const c = rt.loadContract(AGENT_KB_ROOT, id)
    const result = rt.appendTaskState(AGENT_KB_ROOT, c, taskId, entry)
    console.log(`✅ State appended to ${result.path}`)
    return
  }

  // ── abandon-task ───────────────────────────────────────────────────────────
  if (sub === 'abandon-task') {
    const id = rest[0]
    const taskId = rest[1]
    const reasonIdx = rest.indexOf('--reason')
    const reason = reasonIdx >= 0 ? rest[reasonIdx + 1] : ''
    if (!id || !taskId) throw new Error('Usage: kb agent abandon-task <agent-id> <task-id> [--reason <r>]')
    const c = rt.loadContract(AGENT_KB_ROOT, id)
    const result = rt.abandonTask(AGENT_KB_ROOT, c, taskId, reason)
    console.log(`✅ Task abandoned: ${result.workingMemoryPath}`)
    return
  }

  if (sub === 'verify-state') {
    const id = rest[0]
    if (!id) throw new Error('Usage: kb agent verify-state <agent-id>')
    const c = rt.loadContract(AGENT_KB_ROOT, id)
    const verification = rt.verifyTaskState(AGENT_KB_ROOT, c)
    console.log(JSON.stringify(verification, null, 2))
    if (!verification.ok) process.exitCode = 2
    return
  }

  if (sub === 'repair-state') {
    const id = rest[0]
    if (!id) throw new Error('Usage: kb agent repair-state <agent-id>')
    const c = rt.loadContract(AGENT_KB_ROOT, id)
    const result = rt.repairTaskState(AGENT_KB_ROOT, c)
    console.log(JSON.stringify(result, null, 2))
    if (!result.ok) process.exitCode = 2
    return
  }

  // ── close-task (with --dry-run support) ────────────────────────────────────
  if (sub === 'close-task') {
    const id = rest[0]
    if (!id) throw new Error('Usage: kb agent close-task <agent-id> --payload <file.json> [--dry-run]')
    const payloadIdx = rest.indexOf('--payload')
    const dryRun = rest.includes('--dry-run')
    const fs = await import('fs')
    const payload = payloadIdx >= 0
      ? JSON.parse(fs.readFileSync(rest[payloadIdx + 1], 'utf8'))
      : {}
    const c = rt.loadContract(AGENT_KB_ROOT, id)
    if (dryRun) {
      const plan = rt.dryRunCloseTask(AGENT_KB_ROOT, c, payload)
      console.log(`\n--- Dry run for ${id} close-task ---`)
      console.log(`Would succeed: ${plan.wouldSucceed}`)
      console.log(`Total ops: ${plan.summary.total} (${plan.summary.file_writes} file, ${plan.summary.bus_publishes} bus)`)
      if (plan.rejected.length) {
        console.log(`\nREJECTED (${plan.rejected.length}):`)
        for (const r of plan.rejected) console.log(`  ✗ [${r.op}] ${r.path} — ${r.reason}`)
      }
      console.log(`\nPLAN:`)
      for (const p of plan.planned) {
        const ok = p.allowed ? '✓' : '✗'
        console.log(`  ${ok} [${p.op}] ${p.path}`)
      }
      return
    }
    const result = rt.closeTask(AGENT_KB_ROOT, c, payload)
    if (!result.ok) {
      const rejected = result.rejected || result.trace?.writes_rejected || []
      console.error(`❌ Close rejected (${rejected.length} rejections):`)
      for (const r of rejected) console.error(`  ${r.path || 'policy'} — ${r.reason}`)
      if (result.trace?.rollback) {
        console.error(`  rollback: ${result.trace.rollback.rolledBack} actions, ${result.trace.rollback.errors.length} errors`)
      }
      process.exit(2)
    }
    console.log(`✅ Task closed.`)
    console.log(`   Writes committed: ${result.trace.writes_committed.length}`)
    console.log(`   Bus items published: ${result.trace.bus_items.length}`)
    for (const w of result.trace.writes_committed) console.log(`   [${w.op}] ${w.path}`)
    for (const b of result.trace.bus_items) console.log(`   [bus:${b.channel}] ${b.id}`)
    return
  }

  if (sub === 'trace') {
    const id = rest[0]
    const limitIdx = rest.indexOf('--last')
    const limit = limitIdx >= 0 ? parseInt(rest[limitIdx + 1], 10) : 10
    const traces = rt.readRuntimeTraces(AGENT_KB_ROOT, limit, id ? { agent_id: id } : {})
    for (const t of traces) {
      console.log(`[${t.ts}] ${t.type} ${t.agent_id || ''} ${t.project || ''}`)
      if (t.budget_used !== undefined) console.log(`  budget ${t.budget_used}/${t.budget_bytes} truncated=${t.truncated}`)
      if (t.writes_committed) console.log(`  committed=${t.writes_committed.length} rejected=${(t.writes_rejected||[]).length} bus=${(t.bus_items||[]).length}`)
    }
    return
  }
  throw new Error(`Unknown agent subcommand: ${sub}`)
}

async function promoteCmd(rest) {
  const rt = await import(AGENT_RUNTIME_PATH)
  const [channel, id] = rest
  if (!channel || !id) throw new Error('Usage: kb promote <channel> <item-id> [--target <path>] [--approver <name>]')
  const targetIdx = rest.indexOf('--target')
  const approverIdx = rest.indexOf('--approver')
  const target = targetIdx >= 0 ? rest[targetIdx + 1] : undefined
  const approver = approverIdx >= 0 ? rest[approverIdx + 1] : 'cli-user'
  const r = rt.promoteLearning(AGENT_KB_ROOT, { channel, id, targetPath: target, approver })
  console.log(`✅ Promoted ${id}`)
  console.log(`   source: ${r.source}`)
  console.log(`   target: ${r.target}`)
}

// ─── Repo Runtime Commands ─────────────────────────────────────────────────

async function repoCmd(sub, rest) {
  const rt = await import(REPO_RUNTIME_PATH)
  const fs = await import('fs')

  if (sub === 'list') {
    const repos = rt.listRepos(AGENT_KB_ROOT)
    if (repos.length === 0) { console.log('No repos tracked.'); return }
    console.log('\nTracked Repositories:\n')
    for (const r of repos) {
      const name = r.repo_name || r.name || 'unknown'
      const status = r.status || 'unknown'
      const docs = r.markdown_file_count || r.docCount || 0
      console.log(`  ${name} [${status}]`)
      console.log(`    docs: ${docs}, last-sync: ${r.last_sync_at || r.lastSync || 'never'}`)
    }
    console.log()
    return
  }

  if (sub === 'show') {
    const name = rest[0]
    if (!name) throw new Error('Usage: kb repo show <name>')
    const repo = rt.loadRepoMetadata(AGENT_KB_ROOT, name)
    if (!repo) throw new Error(`Repo not found: ${name}`)
    console.log(JSON.stringify(repo, null, 2))
    return
  }

  if (sub === 'sync') {
    const name = rest[0]
    if (!name) throw new Error('Usage: kb repo sync <name> [--token <pat>]')
    const tokenIdx = rest.indexOf('--token')
    const token = tokenIdx >= 0 ? rest[tokenIdx + 1] : process.env.GITHUB_PAT
    console.log(`\n📦 Syncing repo: ${name}...`)
    const result = await rt.syncRepo(AGENT_KB_ROOT, name, { token })
    if (result.errors?.length) {
      console.error(`❌ Sync failed: ${result.errors[0].message}`)
      process.exit(1)
    }
    console.log(`✅ Sync complete`)
    console.log(`   Created: ${result.created?.length || 0}`)
    console.log(`   Updated: ${result.updated?.length || 0}`)
    console.log(`   Archived: ${result.archived?.length || 0}`)
    console.log(`   Commit SHA: ${result.commit_sha || 'unknown'}`)
    return
  }

  if (sub === 'sync-all') {
    const tokenIdx = rest.indexOf('--token')
    const token = tokenIdx >= 0 ? rest[tokenIdx + 1] : process.env.GITHUB_PAT
    console.log('\n📦 Syncing all active repos...')
    const repos = rt.listRepos(AGENT_KB_ROOT)
    const active = repos.filter(r => r.status === 'active')
    for (const r of active) {
      const name = r.repo_name || r.name
      console.log(`  syncing ${name}...`)
      await rt.syncRepo(AGENT_KB_ROOT, name, { token })
    }
    console.log(`✅ All ${active.length} repos synced`)
    return
  }

  if (sub === 'search') {
    const name = rest[0]
    const query = rest.slice(1).join(' ')
    if (!name || !query) throw new Error('Usage: kb repo search <name> <query>')
    const results = await rt.searchRepoDocs(AGENT_KB_ROOT, name, query)
    if (results.length === 0) { console.log(`No results for "${query}" in ${name}`); return }
    console.log(`\n🔍 ${results.length} results in ${name}:\n`)
    for (const r of results) {
      console.log(`  ${r.path}`)
      console.log(`    ${(r.snippet || '').slice(0, 120)}...`)
    }
    console.log()
    return
  }

  if (sub === 'status') {
    const name = rest[0]
    if (!name) throw new Error('Usage: kb repo status <name>')
    const repo = rt.loadRepoMetadata(AGENT_KB_ROOT, name)
    if (!repo) throw new Error(`Repo not found: ${name}`)
    console.log(`\nRepo: ${name}`)
    console.log(`  Status: ${repo.status || 'unknown'}`)
    console.log(`  Last SHA: ${repo.lastSHA || 'never synced'}`)
    console.log(`  Doc Count: ${repo.docCount || 0}`)
    console.log(`  Last Sync: ${repo.lastSync || 'never'}`)
    console.log()
    return
  }

  if (sub === 'docs') {
    const name = rest[0]
    const sectionIdx = rest.indexOf('--section')
    const section = sectionIdx >= 0 ? rest[sectionIdx + 1] : null
    if (!name) throw new Error('Usage: kb repo docs <name> [--section <s>]')
    const docs = rt.listRepoDocs(AGENT_KB_ROOT, name, section)
    if (docs.length === 0) { console.log(`No docs for ${name}`); return }
    console.log(`\n📄 Docs in ${name}${section ? ' (' + section + ')' : ''}:\n`)
    for (const d of docs) {
      console.log(`  ${d.path} (${d.bytes}B)`)
    }
    console.log()
    return
  }

  if (sub === 'progress') {
    const name = rest[0]
    if (!name) throw new Error('Usage: kb repo progress <name>')
    const progPath = pathMod.join(AGENT_KB_ROOT, 'wiki', 'repos', name, 'progress.md')
    if (!fs.existsSync(progPath)) { console.log(`No progress file for ${name}`); return }
    const content = fs.readFileSync(progPath, 'utf8')
    console.log(content)
    return
  }

  if (sub === 'close-task') {
    const name = rest[0]
    const agentId = rest[1]
    const payloadIdx = rest.indexOf('--payload')
    const dryRun = rest.includes('--dry-run')
    if (!name || !agentId) throw new Error('Usage: kb repo close-task <name> <agent> --payload <file.json> [--dry-run]')

    const agentRt = await import(AGENT_RUNTIME_PATH)
    const contract = agentRt.loadContract(AGENT_KB_ROOT, agentId)
    if (!contract) throw new Error(`Unknown agent contract: ${agentId}`)

    let payload
    if (payloadIdx >= 0) {
      payload = JSON.parse(fs.readFileSync(rest[payloadIdx + 1], 'utf8'))
    } else {
      const entry = rest.slice(2).filter(arg => arg !== '--dry-run')
      if (!entry.length) throw new Error('Usage: kb repo close-task <name> <agent> --payload <file.json> [--dry-run]')
      payload = { taskLogEntry: entry.join(' ') }
    }

    if (dryRun) {
      const plan = rt.dryRunCloseRepoTask(AGENT_KB_ROOT, name, contract, payload)
      console.log(`\n--- Dry run for ${name}/${agentId} repo close-task ---`)
      console.log(`Would succeed: ${plan.wouldSucceed}`)
      console.log(`Total ops: ${plan.summary.total} (${plan.summary.file_writes} file, ${plan.summary.bus_publishes} bus)`)
      if (plan.rejected.length) {
        console.log(`\nREJECTED (${plan.rejected.length}):`)
        for (const r of plan.rejected) console.log(`  ✗ [${r.op}] ${r.path} — ${r.reason}`)
      }
      console.log(`\nPLAN:`)
      for (const p of plan.planned) {
        const ok = p.allowed ? '✓' : '✗'
        console.log(`  ${ok} [${p.op}] ${p.path}`)
      }
      return
    }

    const result = rt.closeRepoTask(AGENT_KB_ROOT, name, contract, payload)
    if (!result.ok) {
      const rejected = result.rejected || result.trace?.writes_rejected || []
      console.error(`❌ Repo close rejected (${rejected.length} rejections):`)
      for (const r of rejected) console.error(`  ${r.path || 'policy'} — ${r.reason}`)
      if (result.trace?.rollback) {
        console.error(`  rollback: ${result.trace.rollback.rolledBack} actions, ${result.trace.rollback.errors.length} errors`)
      }
      process.exit(2)
    }
    console.log(`✅ Repo task closed for ${agentId} in ${name}.`)
    console.log(`   Writes committed: ${result.trace.writes_committed.length}`)
    console.log(`   Bus items published: ${result.trace.bus_items.length}`)
    for (const w of result.trace.writes_committed) console.log(`   [${w.op}] ${w.path}`)
    for (const b of result.trace.bus_items) console.log(`   [bus:${b.channel}] ${b.id}`)
    return
  }

  throw new Error(`Unknown repo subcommand: ${sub}`)
}

async function busCmd(sub, rest) {
  const rt = await import(REPO_RUNTIME_PATH)

  if (sub === 'list') {
    const [name, channel] = rest
    if (!name || !channel) throw new Error('Usage: kb bus list <name> <channel>')
    const items = rt.listRepoBusItems(AGENT_KB_ROOT, name, channel)
    if (items.length === 0) { console.log(`No items in ${name}/${channel}`); return }
    console.log(`\n📨 Bus items in ${name}/${channel}:\n`)
    for (const it of items) {
      console.log(`  ${it.id} [${it.status}] from=${it.from}`)
      console.log(`    ${(it.body || '').trim().split('\n')[0].slice(0, 100)}`)
    }
    console.log()
    return
  }

  if (sub === 'publish') {
    const [name, channel] = rest
    const fromIdx = rest.indexOf('--from')
    const bodyIdx = rest.indexOf('--body')
    const from = fromIdx >= 0 ? rest[fromIdx + 1] : null
    const body = bodyIdx >= 0 ? rest.slice(bodyIdx + 1).join(' ') : null
    if (!name || !channel || !from || !body) throw new Error('Usage: kb bus publish <name> <channel> --from <id> --body <text>')
    const id = rt.publishRepoBusItem(AGENT_KB_ROOT, name, { channel, from, body })
    console.log(`✅ Published to ${name}/${channel}`)
    console.log(`   ID: ${id}`)
    return
  }

  if (sub === 'transition') {
    const [name, channel, id, status] = rest
    if (!name || !channel || !id || !status) throw new Error('Usage: kb bus transition <name> <channel> <id> <status>')
    rt.transitionRepoBusItem(AGENT_KB_ROOT, name, channel, id, status)
    console.log(`✅ Transitioned ${id} to ${status}`)
    return
  }

  throw new Error(`Unknown bus subcommand: ${sub}`)
}

async function rewriteCmd(sub, rest) {
  const rt = await import(REPO_RUNTIME_PATH)

  if (sub === 'list') {
    const name = rest[0]
    if (!name) throw new Error('Usage: kb rewrite list <name>')
    const rewrites = rt.listRepoRewrites(AGENT_KB_ROOT, name)
    if (rewrites.length === 0) { console.log(`No rewrites for ${name}`); return }
    console.log(`\n✏️  Rewrites for ${name}:\n`)
    for (const r of rewrites) {
      console.log(`  ${r.path} [${r.status}]`)
      console.log(`    type: ${r.type}, project: ${r.project}`)
    }
    console.log()
    return
  }

  throw new Error(`Unknown rewrite subcommand: ${sub}`)
}

async function canonicalCmd(sub, rest) {
  const rt = await import(REPO_RUNTIME_PATH)

  if (sub === 'list') {
    const name = rest[0]
    if (!name) throw new Error('Usage: kb canonical list <name>')
    const docs = rt.listRepoCanonical(AGENT_KB_ROOT, name)
    if (docs.length === 0) { console.log(`No canonical docs for ${name}`); return }
    console.log(`\n📋 Canonical docs for ${name}:\n`)
    for (const d of docs) {
      console.log(`  ${d.name}`)
      console.log(`    ${d.title || d.name}`)
    }
    console.log()
    return
  }

  if (sub === 'show') {
    const [name, doc] = rest
    if (!name || !doc) throw new Error('Usage: kb canonical show <name> <doc>')
    const content = rt.readRepoCanonical(AGENT_KB_ROOT, name, doc)
    if (!content) { console.log(`Not found: ${name}/${doc}`); return }
    console.log(content)
    return
  }

  throw new Error(`Unknown canonical subcommand: ${sub}`)
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
  } else if (command === 'ingest-file') {
    if (!positional[0]) { console.error('Usage: kb ingest-file <path> [--dir <raw-subdir>]'); process.exit(1) }
    await ingestFile(positional[0], opts)
  } else if (command === 'reindex') {
    await reindex(opts.pin)
  } else if (command === 'agent') {
    await agentCmd(args[1], args.slice(2))
  } else if (command === 'bus') {
    if (args[1] === 'list' || args[1] === 'publish' || args[1] === 'transition') {
      // New repo-aware bus commands
      await busCmd(args[1], args.slice(2))
    } else {
      // Legacy agent bus commands
      await (await import(AGENT_RUNTIME_PATH)).busCmd?.(args[1], args.slice(2)) ||
        console.error('Unknown bus subcommand')
    }
  } else if (command === 'promote') {
    await promoteCmd(args.slice(1))
  } else if (command === 'repo') {
    await repoCmd(args[1], args.slice(2))
  } else if (command === 'rewrite') {
    await rewriteCmd(args[1], args.slice(2))
  } else if (command === 'canonical') {
    await canonicalCmd(args[1], args.slice(2))
  } else {
    console.error(`Unknown command: ${command}`)
    usage()
    process.exit(1)
  }
} catch (err) {
  console.error(`❌ ${err.message}`)
  process.exit(1)
}
