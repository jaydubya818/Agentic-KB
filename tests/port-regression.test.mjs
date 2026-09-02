import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (relativePath) => fs.readFileSync(path.join(REPO, relativePath), 'utf8')

describe('KB API port configuration', () => {
  it('keeps the CLI, MCP server, web dev server, docs, and daily lint aligned', () => {
    const cli = read('cli/kb.js')
    const mcp = read('mcp/server.js')
    const webPackageRaw = read('web/package.json')
    const webPackage = JSON.parse(webPackageRaw)
    const readme = read('README.md')
    const dailyLint = read('scripts/daily-lint.sh')

    const cliPort = cli.match(/KB_API_URL \|\| 'http:\/\/localhost:(\d+)'/)?.[1]
    const mcpPort = mcp.match(/KB_API_URL \|\| 'http:\/\/localhost:(\d+)'/)?.[1]
    const webPort = webPackage.scripts.dev.match(/(?:^|\s)-p\s+(\d+)(?:\s|$)/)?.[1]

    assert.equal(cliPort, '3002')
    assert.equal(mcpPort, cliPort)
    assert.equal(webPort, cliPort)
    assert.match(readme, /http:\/\/localhost:3002/)
    assert.doesNotMatch(readme, /localhost:3009/)
    assert.match(dailyLint, /KB_PORT:-3002/)
    assert.ok(webPackageRaw.endsWith('\n'), 'web/package.json must end with a newline')
  })

  it('explains how to recover when the CLI cannot reach the API', () => {
    const result = spawnSync(process.execPath, [path.join(REPO, 'cli', 'kb.js'), 'search', 'connection-test'], {
      encoding: 'utf8',
      env: {
        ...process.env,
        KB_API_URL: 'http://127.0.0.1:1',
        KB_API_TIMEOUT_MS: '1000',
      },
      timeout: 5000,
    })

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /Cannot reach the KB API at http:\/\/127\.0\.0\.1:1/)
    assert.match(result.stderr, /Set KB_API_URL to override/)
  })
})
