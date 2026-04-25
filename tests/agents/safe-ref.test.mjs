import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isSafeRef, SAFE_REF } from '../../lib/safe-ref.mjs'

test('isSafeRef accepts standard git revisions', () => {
  for (const ref of [
    'HEAD',
    'HEAD~1',
    'HEAD~10',
    'HEAD^',
    'HEAD^^',
    'HEAD^2',
    'main',
    'feat/foundry-integration',
    'release/v1.2.3',
    'v1.2.3',
    '1234567',
    'a1b2c3d4e5f6789012345678901234567890abcd',
    'origin/main',
    'tag@{0}',
    'HEAD@{1}',
  ]) {
    assert.equal(isSafeRef(ref), true, `expected accept: ${ref}`)
  }
})

test('isSafeRef rejects shell-metachar injections', () => {
  for (const ref of [
    'HEAD;rm -rf /',
    'HEAD && cat /etc/passwd',
    'HEAD || true',
    'HEAD | tee evil',
    'HEAD`whoami`',
    'HEAD$(whoami)',
    'HEAD\nrm',
    'HEAD\trm',
    'HEAD\\rm',
    "HEAD'; --",
    'HEAD"injected"',
    'HEAD>out',
    'HEAD<in',
    'HEAD*',
    'HEAD?',
    'HEAD #comment',
    '$(cat secrets)',
    '`id`',
  ]) {
    assert.equal(isSafeRef(ref), false, `expected reject: ${JSON.stringify(ref)}`)
  }
})

test('isSafeRef rejects empty / non-string / oversize', () => {
  assert.equal(isSafeRef(''), false)
  assert.equal(isSafeRef(null), false)
  assert.equal(isSafeRef(undefined), false)
  assert.equal(isSafeRef(123), false)
  assert.equal(isSafeRef({}), false)
  assert.equal(isSafeRef([]), false)
  assert.equal(isSafeRef('a'.repeat(201)), false)
  assert.equal(isSafeRef('a'.repeat(200)), true)
})

test('SAFE_REF regex is anchored', () => {
  assert.equal(SAFE_REF.source.startsWith('^'), true)
  assert.equal(SAFE_REF.source.endsWith('$'), true)
})
