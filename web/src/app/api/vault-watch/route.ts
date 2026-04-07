import { NextRequest } from 'next/server'
import fs from 'fs'
import { DEFAULT_KB_ROOT } from '@/lib/articles'

export const dynamic = 'force-dynamic'

// SSE endpoint: streams a 'change' event whenever any .md file in the
// active vault directory is created, modified, or renamed.
// Client connects once; server sends keep-alive pings every 15s and
// a 'change' event whenever fs.watch fires on a .md file.

export async function GET(request: NextRequest): Promise<Response> {
  const vaultRoot = request.cookies.get('active_vault_path')?.value || DEFAULT_KB_ROOT

  const encoder = new TextEncoder()
  let watcher: fs.FSWatcher | null = null
  let closed = false

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: object) => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch { /* stream already closed */ }
      }

      // Send initial connected event
      send({ type: 'connected', vault: vaultRoot })

      // Keep-alive ping every 15 seconds
      const pingInterval = setInterval(() => send({ type: 'ping' }), 15_000)

      // Watch vault directory recursively for .md file changes
      try {
        watcher = fs.watch(vaultRoot, { recursive: true }, (event, filename) => {
          if (filename && filename.endsWith('.md')) {
            send({ type: 'change', event, filename })
          }
        })

        watcher.on('error', () => {
          // Vault might have been moved/deleted — just close gracefully
          if (!closed) controller.close()
        })
      } catch {
        // fs.watch not supported or vault not accessible
        send({ type: 'error', message: 'Could not watch vault directory' })
      }

      // Cleanup when client disconnects
      request.signal.addEventListener('abort', () => {
        closed = true
        clearInterval(pingInterval)
        watcher?.close()
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
