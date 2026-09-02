import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (relativePath) => fs.readFileSync(path.join(REPO, relativePath), 'utf8')

function parseFrontmatter(relativePath) {
  const text = read(relativePath)
  const match = text.match(/^---\n([\s\S]*?)\n---\n/)
  assert.ok(match, `${relativePath} must start with YAML frontmatter`)
  return YAML.parse(match[1])
}

describe('repository onboarding', () => {
  it('offers valid bug and feature issue templates without a blank option', () => {
    const bug = parseFrontmatter('.github/ISSUE_TEMPLATE/bug_report.md')
    const feature = parseFrontmatter('.github/ISSUE_TEMPLATE/feature_request.md')
    const config = YAML.parse(read('.github/ISSUE_TEMPLATE/config.yml'))

    assert.equal(bug.labels, 'bug')
    assert.equal(feature.labels, 'enhancement')
    assert.equal(config.blank_issues_enabled, false)
    assert.match(read('.github/ISSUE_TEMPLATE/bug_report.md'), /redact tokens, keys, cookies/i)
  })

  it('runs the full suite before advertising a green test badge', () => {
    const workflow = read('.github/workflows/test.yml')
    const readme = read('README.md')

    assert.match(workflow, /- name: Run full test suite\n\s+run: npm test/)
    assert.match(readme, /actions\/workflows\/test\.yml\/badge\.svg/)
  })

  it('documents every command printed by CLI help and the relevant environment', () => {
    const result = spawnSync(process.execPath, [path.join(REPO, 'cli', 'kb.js'), 'help'], {
      encoding: 'utf8',
      timeout: 5000,
    })
    assert.equal(result.status, 0, result.stderr)

    const commands = result.stdout
      .split('\nExamples:', 1)[0]
      .split('\n')
      .filter((line) => /^\s{2}kb\s/.test(line))
      .map((line) => line.trim().split(/\s{2,}/)[0])

    const readme = read('README.md')
    for (const command of commands) {
      assert.ok(readme.includes(`\`${command}\``), `README is missing CLI help entry: ${command}`)
    }
    assert.match(readme, /`KB_API_URL`/)
    assert.match(readme, /`PRIVATE_PIN`/)
  })
})
