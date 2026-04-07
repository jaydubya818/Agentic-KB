import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export const DEFAULT_VAULT = '/Users/jaywest/Agentic-KB'
export const VAULT_COOKIE = 'active_vault_path'

export async function POST(request: NextRequest) {
  const { vaultPath } = await request.json() as { vaultPath: string }

  if (!vaultPath || !fs.existsSync(vaultPath)) {
    return NextResponse.json({ error: 'Vault path not found' }, { status: 400 })
  }

  const name = path.basename(vaultPath)
  const response = NextResponse.json({ ok: true, name, path: vaultPath })
  response.cookies.set(VAULT_COOKIE, vaultPath, {
    path: '/',
    httpOnly: false,     // readable client-side for TopBar
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })
  return response
}

export async function GET(request: NextRequest) {
  const vaultPath = request.cookies.get(VAULT_COOKIE)?.value || DEFAULT_VAULT
  const name = path.basename(vaultPath)
  return NextResponse.json({ name, path: vaultPath })
}
