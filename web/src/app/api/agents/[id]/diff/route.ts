import { NextRequest, NextResponse } from 'next/server'
import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { DEFAULT_KB_ROOT } from '@/lib/articles'
import { parse as yamlParse } from 'yaml'

export const dynamic = 'force-dynamic'

// Restrict ref to characters valid in git revision names. Blocks shell metachars
// even though we use execFileSync (no shell) — defense in depth.
const SAFE_REF = /^[A-Za-z0-9_./~^@-]{1,200}$/

/**
 * GET /api/agents/[id]/diff?ref=HEAD~1
 *
 * Returns parsed before/after of config/agents/[id].yaml at the given git ref
 * vs working tree, plus an effective-policy diff for the most-watched fields.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const ref = searchParams.get('ref') || 'HEAD~1'

  const safeId = id.replace(/[^a-z0-9-]/g, '')
  if (safeId !== id) {
    return NextResponse.json({ error: 'invalid agent id' }, { status: 400 })
  }

  if (!SAFE_REF.test(ref)) {
    return NextResponse.json({ error: 'invalid ref' }, { status: 400 })
  }

  const file = `config/agents/${safeId}.yaml`

  let beforeRaw = ''
  try {
    beforeRaw = execFileSync('git', ['-C', DEFAULT_KB_ROOT, 'show', `${ref}:${file}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
  } catch {
    return NextResponse.json({ error: `no version of ${file} at ${ref}` }, { status: 404 })
  }

  let afterRaw = ''
  try {
    afterRaw = fs.readFileSync(path.join(DEFAULT_KB_ROOT, file), 'utf8')
  } catch {
    return NextResponse.json({ error: `working-tree ${file} not readable` }, { status: 404 })
  }

  const before = yamlParse(beforeRaw) || {}
  const after = yamlParse(afterRaw) || {}

  const fields = ['tier', 'domain', 'team', 'allowed_writes', 'forbidden_paths', 'vault_writes']
  const fieldDiffs: Record<string, { before: unknown; after: unknown }> = {}
  for (const f of fields) {
    const a = JSON.stringify(before[f])
    const b = JSON.stringify(after[f])
    if (a !== b) fieldDiffs[f] = { before: before[f], after: after[f] }
  }

  // Context policy: include rule count diff (cheap signal)
  const ipBefore = (before.context_policy?.include || []).length
  const ipAfter = (after.context_policy?.include || []).length
  const policyDiff = {
    budget_bytes: { before: before.context_policy?.budget_bytes, after: after.context_policy?.budget_bytes },
    include_rule_count: { before: ipBefore, after: ipAfter },
  }

  return NextResponse.json({
    agent_id: id,
    ref,
    file,
    field_diffs: fieldDiffs,
    policy_diff: policyDiff,
    raw_before: beforeRaw,
    raw_after: afterRaw,
  })
}
