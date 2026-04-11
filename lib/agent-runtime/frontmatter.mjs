// Minimal frontmatter parser/serializer — no external deps so CLI/MCP can use it directly.
// gray-matter is available via web's node_modules but we keep this zero-dep for portability.

function splitInlineList(inner) {
  const parts = []
  let current = ''
  let depth = 0
  let quote = null

  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i]
    const prev = i > 0 ? inner[i - 1] : ''

    if (quote) {
      current += ch
      if (ch === quote && prev !== '\\') quote = null
      continue
    }

    if (ch === '"' || ch === "'") {
      quote = ch
      current += ch
      continue
    }

    if (ch === '[' || ch === '{') {
      depth++
      current += ch
      continue
    }

    if (ch === ']' || ch === '}') {
      depth = Math.max(0, depth - 1)
      current += ch
      continue
    }

    if (ch === ',' && depth === 0) {
      const value = current.trim()
      if (value) parts.push(value)
      current = ''
      continue
    }

    current += ch
  }

  const tail = current.trim()
  if (tail) parts.push(tail)
  return parts
}

function parseValue(raw) {
  const s = raw.trim()
  if (s === '') return ''
  if (s === 'true') return true
  if (s === 'false') return false
  if (s === 'null' || s === '~') return null
  if (/^-?\d+$/.test(s)) return parseInt(s, 10)
  if (/^-?\d+\.\d+$/.test(s)) return parseFloat(s)
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1)
  }
  if (s.startsWith('{') && s.endsWith('}')) {
    try {
      return JSON.parse(s)
    } catch {
      return s
    }
  }
  if (s.startsWith('[') && s.endsWith(']')) {
    const inner = s.slice(1, -1).trim()
    if (!inner) return []
    try {
      return JSON.parse(s)
    } catch {
      return splitInlineList(inner).map(p => parseValue(p))
    }
  }
  return s
}

export function parseFrontmatter(content) {
  if (!content.startsWith('---\n')) return { data: {}, content, raw: content }
  const end = content.indexOf('\n---', 4)
  if (end === -1) return { data: {}, content, raw: content }
  const header = content.slice(4, end)
  const body = content.slice(end + 4).replace(/^\n/, '')
  const data = {}
  const lines = header.split('\n')
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim() || line.startsWith('#')) { i++; continue }
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (!m) { i++; continue }
    const key = m[1]
    const rest = m[2]
    if (rest === '' || rest === undefined) {
      // Could be a list on following lines
      const items = []
      let j = i + 1
      while (j < lines.length && lines[j].match(/^\s+-\s+/)) {
        items.push(parseValue(lines[j].replace(/^\s+-\s+/, '')))
        j++
      }
      data[key] = items
      i = j
    } else {
      data[key] = parseValue(rest)
      i++
    }
  }
  return { data, content: body, raw: content }
}

function serializeValue(v) {
  if (v === null || v === undefined) return 'null'
  if (typeof v === 'boolean' || typeof v === 'number') return String(v)
  if (Array.isArray(v)) return '[' + v.map(serializeValue).join(', ') + ']'
  if (typeof v === 'object') return JSON.stringify(v)
  const s = String(v)
  if (/[:#\-\[\]{}'"]/.test(s) || s.includes('\n')) return JSON.stringify(s)
  return s
}

export function serializeFrontmatter(data, body = '') {
  const lines = ['---']
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) continue
    lines.push(`${k}: ${serializeValue(v)}`)
  }
  lines.push('---', '')
  return lines.join('\n') + (body || '')
}

export function updateFrontmatter(content, patch) {
  const { data, content: body } = parseFrontmatter(content)
  return serializeFrontmatter({ ...data, ...patch }, body)
}
