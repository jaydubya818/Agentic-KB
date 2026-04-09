import { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'
import { DEFAULT_KB_ROOT } from '@/lib/articles'

export const dynamic = 'force-dynamic'

// SSE endpoint: streams change events for both the wiki/ and raw/ directories.
//
// Wiki changes → { type: 'change', event, filename } — triggers live reload
// Raw changes  → { type: 'raw_change', filename } — signals new source material
//               When a new .md file lands in raw/ the client receives a
//               'raw_pending' event prompting the user to run kb compile.
//
// Client connects once; server sends keep-alive pings every 15s.

// Track which raw files we've already seen to detect truly new additions
const _seenRawFiles = new Set<string>()
function initSeenRaw(rawRoot: string) {
  if (!fs.existsSync(rawRoot)) return
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.md') && !entry.name.startsWith('.')) _seenRawFiles.add(full)
    }
  }
  walk(rawRoot)
}

export async function GET(request: NextRequest): Promise<Response> {
  const vaultRoot = request.cookies.get('active_vault_path')?.value || DEFAULT_KB_ROOT
  const rawRoot = path.join(vaultRoot, 'raw')

  const encoder = new TextEncoder()
  let wikiWatcher: fs.FSWatcher | null = null
  let rawWatcher: fs.FSWatcher | null = null
  let closed = false

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: object) => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch { /* stream already closed */ }
      }

      // Seed the seen-set with files already present at connect time
      initSeenRaw(rawRoot)

      send({ type: 'connected', vault: vaultRoot })

      // Keep-alive ping every 15 seconds
      const pingInterval = setInterval(() => send({ type: 'ping' }), 15_000)

      // Watch wiki/ for .md changes → live reload
      try {
        wikiWatcher = fs.watch(vaultRoot, { recursive: true }, (event, filename) => {
          if (!filename) return
          // Ignore raw/ changes here — handled by rawWatcher below
          if (filename.startsWith('raw/') || filename.startsWith('raw\\')) return
          if (filename.endsWith('.md')) send({ type: 'change', event, filename })
        })
        wikiWatcher.on('error', () => { if (!closed) controller.close() })
      } catch {
        send({ type: 'error', message: 'Could not watch vault directory' })
      }

      // Watch raw/ for new .md files → signal pending compile
      if (fs.existsSync(rawRoot)) {
        try {
          rawWatcher = fs.watch(rawRoot, { recursive: true }, (event, filename) => {
            if (!filename || !filename.endsWith('.md') || filename.startsWith('.')) return
            const absPath = path.join(rawRoot, filename)
            if (!_seenRawFiles.has(absPath)) {
              _seenRawFiles.add(absPath)
              send({ type: 'raw_pending', filename, message: `New raw file detected: ${filename}. Run kb compile to ingest.` })
            }
          })
          rawWatcher.on('error', () => { /* raw/ watch failure is non-fatal */ })
        } catch { /* raw/ watch not supported */ }
      }

      // Cleanup when client disconnects
      request.signal.addEventListener('abort', () => {
        closed = true
        clearInterval(pingInterval)
        wikiWatcher?.close()
        rawWatcher?.close()
        try { controller.close() } catch { /* already closed */ }
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
