import fs from 'fs'
import path from 'path'

export function todayStamp() {
  return new Date().toISOString().slice(0, 10)
}

let _tsSeq = 0
export function timestamp() {
  const base = new Date().toISOString().replace(/[:.]/g, '-')
  return `${base}-${String(++_tsSeq).padStart(4, '0')}`
}

// Generate next sequential bus id: {channel}-{YYYY-MM-DD}-{nnn}
export function nextBusId(kbRoot, channel) {
  const day = todayStamp()
  const dir = path.join(kbRoot, 'wiki', 'system', 'bus', channel)
  let max = 0
  try {
    if (fs.existsSync(dir)) {
      for (const f of fs.readdirSync(dir)) {
        const m = f.match(new RegExp(`^${channel}-${day}-(\\d{3})\\.md$`))
        if (m) max = Math.max(max, parseInt(m[1], 10))
      }
    }
  } catch {}
  const n = String(max + 1).padStart(3, '0')
  return `${channel}-${day}-${n}`
}
