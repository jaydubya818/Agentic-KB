// Adversarial fuzzer for assertWriteAllowed — every known path-traversal trick.
// Every adversarial path MUST be rejected regardless of allowed_writes glob.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { assertWriteAllowed } from '../../lib/agent-runtime/paths.mjs'

const permissiveContract = {
  agent_id: 'fuzz',
  tier: 'worker',
  allowed_writes: [
    'wiki/agents/workers/fuzz/**',
    '**',                              // worst-case permissive — fuzzer still must block traversal
    'wiki/**/*.md',
    'logs/**',
  ],
  forbidden_paths: [],
}

// Exploit seeds. Every one targets something OUTSIDE agent sandbox.
const SEEDS = [
  '../etc/passwd',
  '../../etc/passwd',
  './../../etc/passwd',
  '/etc/passwd',
  '//etc/passwd',
  'wiki/../../etc/passwd',
  'wiki/agents/workers/fuzz/../../orchestrators/architecture-agent/hot.md',
  'wiki/agents/workers/fuzz/./../../../../etc/passwd',
  'wiki/agents/workers/fuzz/..%2f..%2fpwn.md',           // url-encoded ..
  'wiki/agents/workers/fuzz/%2e%2e/%2e%2e/pwn.md',       // url-encoded dot
  'wiki/agents/workers/fuzz/\u002e\u002e/pwn.md',        // unicode dots
  'wiki/agents/workers/fuzz/..\\..\\pwn.md',             // backslash traversal
  'wiki\\..\\..\\etc\\passwd',                           // full backslash
  'wiki/agents/workers/fuzz/\0/pwn.md',                  // null byte
  'wiki/agents/workers/fuzz/\n../pwn.md',                // newline
  '',                                                     // empty
  '.',                                                    // dot
  '..',                                                   // parent
  'wiki///agents/workers/fuzz/pwn.md',                   // triple slash
  'wiki/./agents/workers/fuzz/./pwn.md',                 // dot-segments
  '\\wiki\\agents\\workers\\fuzz\\pwn.md',               // leading backslash
  'C:/wiki/agents/workers/fuzz/pwn.md',                  // windows drive
  'file:///etc/passwd',                                   // file url
  '~/wiki/agents/workers/fuzz/pwn.md',                   // home expansion attempt
  'wiki/agents/workers/fuzz/../../../..',
]

test('fuzz: every exploit seed is rejected', () => {
  for (const seed of SEEDS) {
    const r = assertWriteAllowed(seed, permissiveContract, { project: 'p', domain: 'd', agent: 'fuzz' })
    assert.equal(r.allowed, false, `LEAK: path allowed through: ${JSON.stringify(seed)} → ${JSON.stringify(r)}`)
  }
})

test('fuzz: randomized mutations never allow traversal out of sandbox', () => {
  const mutators = [
    s => '../' + s,
    s => s + '/../../../etc/passwd',
    s => s.replace(/\//g, '\\'),
    s => s.replace(/\./g, '%2e'),
    s => '/' + s,
    s => s + '\0',
    s => s + '/..',
    s => s.replace('wiki', 'wiki/../wiki'),
    s => s + '//',
    s => s.split('').map(c => Math.random() < 0.1 ? '\\' + c : c).join(''),
  ]
  const safeSeed = 'wiki/agents/workers/fuzz/hot.md'
  let leaks = 0
  let tried = 0
  for (let i = 0; i < 2000; i++) {
    let s = safeSeed
    const passes = 1 + (i % 3)
    for (let p = 0; p < passes; p++) s = mutators[(i + p) % mutators.length](s)
    if (!s.includes('..') && !s.startsWith('/') && !s.includes('//') && !s.includes('\\') && !s.includes('\0')) continue
    tried++
    const r = assertWriteAllowed(s, permissiveContract, { project: 'p', domain: 'd', agent: 'fuzz' })
    if (r.allowed) leaks++
  }
  assert.equal(leaks, 0, `${leaks}/${tried} mutated paths leaked`)
})

test('fuzz: legitimate in-sandbox writes still work', () => {
  const goodContract = {
    agent_id: 'fuzz',
    tier: 'worker',
    allowed_writes: ['wiki/agents/workers/fuzz/**'],
    forbidden_paths: [],
  }
  const legit = [
    'wiki/agents/workers/fuzz/hot.md',
    'wiki/agents/workers/fuzz/task-log.md',
    'wiki/agents/workers/fuzz/rewrites/spec/p-20260420.md',
  ]
  for (const p of legit) {
    const r = assertWriteAllowed(p, goodContract, { project: 'p', agent: 'fuzz' })
    assert.equal(r.allowed, true, `FALSE NEGATIVE: ${p} rejected: ${r.reason}`)
  }
})

test('fuzz: forbidden_paths still blocks even when allowed_writes matches', () => {
  const c = {
    agent_id: 'fuzz',
    tier: 'worker',
    allowed_writes: ['**'],
    forbidden_paths: ['wiki/system/**', 'config/**'],
  }
  const blocked = [
    'wiki/system/policies/tier-loading-policy.md',
    'config/agents/gsd-executor.yaml',
  ]
  for (const p of blocked) {
    const r = assertWriteAllowed(p, c, {})
    assert.equal(r.allowed, false, `forbidden_paths leak: ${p}`)
  }
})
