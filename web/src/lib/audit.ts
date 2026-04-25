/**
 * Audit log — append-only JSONL at logs/audit.log
 * Tracks every query, ingest, compile, lint operation with timestamps.
 */
import fs from 'fs'
import path from 'path'
import { appendAudit } from '../../../lib/agent-runtime/audit.mjs'
import { DEFAULT_KB_ROOT } from '@/lib/articles'

const AUDIT_FILE = path.join(DEFAULT_KB_ROOT, 'logs', 'audit.log')

type AuditOp = 'query' | 'query-save' | 'ingest' | 'compile' | 'lint' | 'webhook'

export interface AuditEntry {
  ts: string
  op: AuditOp
  vault?: string
  user?: string
  [key: string]: unknown
}

export function appendAuditLog(entry: Omit<AuditEntry, 'ts'>): void {
  try {
    appendAudit(DEFAULT_KB_ROOT, entry)
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
