import { NextResponse } from 'next/server'

// Trigger processing of all pending files (used by nightly cron)
export async function POST(): Promise<NextResponse> {
  try {
    // Get pending files
    const pendingRes = await fetch('http://localhost:3002/api/process/pending')
    const { files } = await pendingRes.json() as { files: Array<{ path: string; alreadyIngested: boolean }> }
    const pending = files.filter(f => !f.alreadyIngested)

    if (pending.length === 0) {
      return NextResponse.json({ message: 'No pending files', processed: 0 })
    }

    const results: Array<{ path: string; success: boolean; error?: string }> = []

    for (const file of pending) {
      try {
        const res = await fetch('http://localhost:3002/api/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath: file.path }),
        })

        // Drain the SSE stream and check for done/error
        const reader = res.body?.getReader()
        if (!reader) { results.push({ path: file.path, success: false, error: 'No stream' }); continue }

        let success = false
        const decoder = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const text = decoder.decode(value)
          if (text.includes('"type":"done"')) { success = true; break }
          if (text.includes('"type":"error"')) { success = false; break }
        }
        results.push({ path: file.path, success })
      } catch (err) {
        results.push({ path: file.path, success: false, error: String(err) })
      }
    }

    const succeeded = results.filter(r => r.success).length
    return NextResponse.json({
      message: `Processed ${succeeded}/${pending.length} files`,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
