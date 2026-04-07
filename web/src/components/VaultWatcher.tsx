'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

// Debounce delay — wait for Obsidian to finish writing before refreshing
const DEBOUNCE_MS = 600

export default function VaultWatcher(): null {
  const router = useRouter()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const esRef = useRef<EventSource | null>(null)
  const [, setChangeCount] = useState(0)

  useEffect(() => {
    let es: EventSource

    function connect() {
      es = new EventSource('/api/vault-watch')
      esRef.current = es

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as { type: string; filename?: string }

          if (data.type === 'change') {
            // Debounce rapid saves (Obsidian writes in bursts)
            if (debounceRef.current) clearTimeout(debounceRef.current)
            debounceRef.current = setTimeout(() => {
              router.refresh()
              setChangeCount(c => c + 1)
            }, DEBOUNCE_MS)
          }
        } catch { /* ignore parse errors */ }
      }

      es.onerror = () => {
        // SSE connection dropped — reconnect after 3s
        es.close()
        setTimeout(connect, 3_000)
      }
    }

    connect()

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      esRef.current?.close()
    }
  }, [router])

  return null
}
