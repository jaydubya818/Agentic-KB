/**
 * Audit log — append-only JSONL at logs/audit.log
 * Tracks every query, ingest, compile, lint operation with timestamps.
 */
import fs from 'fs'
import path from 'path'
import { DEFAULT_KB_ROOT } from '@/lib/articles'

const LOGS_DIR = path.join(DEFAULT_KB_ROOT, 'logs')
const AUDIT_FILE = path.join(LOGS_DIR, 'audit.log')

export interface AuditEntry {
  ts: string
  op: 'query' | 'ingest' | 'compile' | 'lint' | 'webhook'
  vault?: string
  user?: string
  [key: string]: unknown
}

export function appendAuditLog(entry: Omit<AuditEntry, 'ts'>): void {
  try {
    fs.mkdirSync(LOGS_DIR, { recursive: true })
    const line = JSON.stringify({ ts: new Date().toISOString(), ...entry })
    fs.appendFileSync(AUDIT_FILE, line + '\n')
  } catch {
    // non-fatal — never let audit logging break the main flow
  }
}

export function readAuditLog(limit = 100): AuditEntry[] {
  try {
    const content = fs.readFileSync(AUDIT_FILE, 'utf8')
    const lines = content.trim().split('\n').filter(Boolean)
    return lines
      .slice(-limit)
      .map(l => JSON.parse(l) as AuditEntry)
      .reverse()
  } catch {
    return []
  }
}
