/**
 * themeHasPage — bare theme slugs must match dir-qualified page keys.
 * Regression for the 2026-09-02 finding that every PROMOTE theme printed
 * `[new]` because `guardrails` was compared against `concepts/guardrails`.
 *
 * Run with: node --test tests/compile-gate-has-page.test.mjs
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { themeHasPage, classify } from '../scripts/lib/compile-gate-core.mjs'

const pages = new Set([
  'concepts/guardrails',
  'patterns/pattern-plan-execute-verify',
  'patterns/llm-wiki-pattern',
  'frameworks/framework-mcp',
  'recipes/recipe-build-tool-agent',
])

describe('themeHasPage', () => {
  it('matches a bare slug against concepts/', () => {
    assert.equal(themeHasPage('guardrails', pages), true)
  })
  it('matches a bare slug against a pattern- prefixed file', () => {
    assert.equal(themeHasPage('plan-execute-verify', pages), true)
  })
  it('matches an unprefixed pattern file', () => {
    assert.equal(themeHasPage('llm-wiki-pattern', pages), true)
  })
  it('matches framework- and recipe- prefixed files', () => {
    assert.equal(themeHasPage('mcp', pages), true)
    assert.equal(themeHasPage('build-tool-agent', pages), true)
  })
  it('matches a dir-qualified theme exactly', () => {
    assert.equal(themeHasPage('concepts/guardrails', pages), true)
  })
  it('does not match a theme with no page', () => {
    assert.equal(themeHasPage('compression-adjudication-conflict', pages), false)
  })
})

describe('classify hasPage', () => {
  it('marks a 2-source theme with an existing page as update, not new', () => {
    const themes = new Map([
      ['guardrails', new Set(['s1', 's2'])],
      ['brand-new-theme', new Set(['s1', 's2'])],
    ])
    const { promote } = classify(themes, new Set(), pages)
    const byTheme = Object.fromEntries(promote.map((p) => [p.theme, p.hasPage]))
    assert.equal(byTheme['guardrails'], true)
    assert.equal(byTheme['brand-new-theme'], false)
  })
})
