// Module-resolution hooks that let `node --test` import web/src/*.ts directly.
//
// Node 24 strips TypeScript types natively, but it does not know two things
// the Next/TypeScript toolchain takes for granted:
//   1. the `@/` path alias declared in tsconfig.json (`@/*` -> `./src/*`)
//   2. extensionless relative imports (`./safe-path` -> `./safe-path.ts`)
// This hook fills in both so a pure-logic module such as src/lib/rbac.ts can
// be tested without a bundler, a transpiler dependency, or a running server.
// It is registered by tests/register.mjs; see the `test` script in package.json.
import { existsSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const SRC = new URL('../src/', import.meta.url)
const EXTS = ['.ts', '.tsx', '.mts', '.js', '.mjs']

function withExtension(url) {
  const file = fileURLToPath(url)
  if (existsSync(file) && statSync(file).isFile()) return url
  for (const ext of EXTS) {
    if (existsSync(file + ext)) return url + ext
  }
  for (const ext of EXTS) {
    if (existsSync(path.join(file, 'index' + ext))) return url + '/index' + ext
  }
  return null
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const aliased = new URL(specifier.slice(2), SRC)
    const resolved = withExtension(aliased.href)
    if (resolved) return nextResolve(resolved, context)
    return nextResolve(aliased.href, context)
  }
  if ((specifier.startsWith('./') || specifier.startsWith('../')) && context.parentURL && !path.extname(specifier)) {
    const resolved = withExtension(new URL(specifier, context.parentURL).href)
    if (resolved) return nextResolve(resolved, context)
  }
  return nextResolve(specifier, context)
}

// web/package.json has no `"type"` field (postcss/tailwind configs are CJS),
// so tell the loader explicitly that src/*.ts is TypeScript ESM instead of
// letting it fall back to the slower "reparse as ESM" path with a warning.
export async function load(url, context, nextLoad) {
  if (url.startsWith(SRC.href) && /\.m?ts$/.test(url)) {
    return nextLoad(url, { ...context, format: 'module-typescript' })
  }
  return nextLoad(url, context)
}
