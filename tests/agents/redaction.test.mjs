// Redaction layer tests.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { redact, redactDefault, _DEFAULT_RULES } from '../../lib/agent-runtime/redaction.mjs'

test('redaction: emails scrubbed', () => {
  const r = redactDefault('Contact me at jay@example.com or jay+work@acme.io anytime.')
  assert.equal(r.redacted.includes('jay@example.com'), false)
  assert.equal(r.redacted.includes('jay+work@acme.io'), false)
  assert.equal(r.hits.find(h => h.rule === 'email').count, 2)
})

test('redaction: phone us format scrubbed', () => {
  const r = redactDefault('Call 555-123-4567 or (415) 555 9000.')
  assert.equal(r.redacted.includes('555-123-4567'), false)
  assert.ok(r.hits.find(h => h.rule === 'phone-us').count >= 1)
})

test('redaction: SSN scrubbed', () => {
  const r = redactDefault('SSN: 123-45-6789.')
  assert.equal(r.redacted.includes('123-45-6789'), false)
  assert.equal(r.hits.find(h => h.rule === 'ssn').count, 1)
})

test('redaction: JWT scrubbed', () => {
  const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqYXkiLCJpYXQiOjEifQ.aaaaaaaaaaaaaaaaaaaa'
  const r = redactDefault(`token=${jwt}`)
  assert.equal(r.redacted.includes(jwt), false)
})

test('redaction: AWS key prefix scrubbed', () => {
  const r = redactDefault('key=AKIAIOSFODNN7EXAMPLE')
  assert.equal(r.redacted.includes('AKIAIOSFODNN7EXAMPLE'), false)
})

test('redaction: PEM private key scrubbed', () => {
  const block = '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----'
  const r = redactDefault(`leaked: ${block}`)
  assert.equal(r.redacted.includes('BEGIN RSA PRIVATE KEY'), false)
  assert.equal(r.redacted.includes('[PRIVATE_KEY]'), true)
})

test('redaction: hits never contain redacted content', () => {
  const r = redactDefault('jay@example.com 555-123-4567 123-45-6789')
  for (const h of r.hits) {
    assert.equal(typeof h.rule, 'string')
    assert.equal(typeof h.count, 'number')
    // hit objects should not leak content
    assert.equal(Object.keys(h).sort().join(','), 'count,rule')
  }
})

test('redaction: clean content untouched', () => {
  const r = redactDefault('Decision: pivot to Q3 onboarding. Owner: jay.')
  assert.equal(r.total, 0)
  assert.equal(r.redacted, 'Decision: pivot to Q3 onboarding. Owner: jay.')
})

test('redaction: custom rule via redact()', () => {
  const rules = [{ id: 'project-codename', re: /\bACME-X\b/g, replacement: '[CODENAME]' }]
  const r = redact('Project ACME-X launched.', rules)
  assert.equal(r.redacted.includes('ACME-X'), false)
  assert.equal(r.hits[0].rule, 'project-codename')
})

test('redaction: default rules list is non-empty', () => {
  assert.ok(_DEFAULT_RULES.length >= 5)
})
