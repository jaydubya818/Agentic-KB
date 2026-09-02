import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (relativePath) => fs.readFileSync(path.join(REPO, relativePath), 'utf8')

describe('Node version configuration', () => {
  it('keeps local, package, CI, and README requirements aligned', () => {
    const major = read('.nvmrc').trim()
    const manifests = ['package.json', 'cli/package.json', 'mcp/package.json', 'web/package.json']

    assert.equal(major, '24')
    for (const manifest of manifests) {
      const pkg = JSON.parse(read(manifest))
      assert.equal(pkg.engines?.node, `${major}.x`, `${manifest} must match .nvmrc`)
    }

    assert.match(read('.github/workflows/test.yml'), new RegExp(`node-version: ${major}\\b`))
    assert.match(read('README.md'), new RegExp(`Requires Node ${major}\\.x`))
  })
})
