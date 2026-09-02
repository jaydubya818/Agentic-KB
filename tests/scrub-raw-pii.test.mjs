// Coverage probe for scripts/scrub-raw-pii.mjs's report-only deny-list.
//
// The scrubber's documented exit-code contract is that 0 means "nothing
// blocking a commit". It can only honour that if every non-contact pattern in
// scripts/hooks/pre-commit has a counterpart in the scrubber's REPORT_ONLY
// list; otherwise the scrubber prints "safe to commit" for a file the hook
// then rejects, and raw/ deadlocks — the failure this script exists to break.
//
// All fixtures are SYNTHETIC. Do not paste real note titles, real names or
// real numbers in here. This file carries a narrow exemption in the hook's
// WHITELIST_FILES (added 2026-08-30, same category as tests/pii-pattern-probe.sh:
// a probe asserting "this string is blocked" must contain that string), and
// that exemption is only defensible while the fixtures stay invented.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { findReportOnly, findRedactable } from '../scripts/scrub-raw-pii.mjs'

// Each case is a string the pre-commit hook blocks. `want` names the
// REPORT_ONLY entry that must catch it.
const HOOK_BLOCKED = [
  ['named person', 'Michelle Rodriguez, VP of Product, on the vendor page.', 'named-person'],
  ['hiring manager interview', 'The hiring manager interview is on Thursday.', 'hiring-manager-interview'],
  ['company + interview', 'adobe interview loop scheduled for next week', 'company-interview'],
  ['comp negotiation', 'Salary negotiation guidance is included in the offer range.', 'compensation-negotiation'],
  ['bare spouse', 'The founder and her spouse built it in a garage.', 'family-relation'],
  ['bare wife', 'His wife runs the support desk.', 'family-relation'],
  ['bare husband', 'Her husband uses it too.', 'family-relation'],
  ['partner + household', 'my partner and I are raising a family on it', 'partner-household'],
  ['therapy attendance', 'She went back in therapy after the launch.', 'therapy-attendance'],
  ['therapist contact', 'He talked to a therapist about the burnout.', 'therapy-contact'],
  ['therapy session', 'A therapy session costs less than the tool.', 'therapy-session'],
]

test('every non-contact pattern the hook blocks is reported by the scrubber', () => {
  for (const [label, fixture, want] of HOOK_BLOCKED) {
    const triggers = findReportOnly(fixture)
    assert.ok(
      triggers.includes(want),
      `${label}: expected trigger "${want}", got [${triggers.join(', ')}] for ${JSON.stringify(fixture)}`,
    )
  }
})

test('a report-only hit is enough to make the scrubber non-silent', () => {
  // The consequence that matters: main() pushes any file with a report-only
  // trigger onto `flagged` and exits 2, even when it carries no contact PII
  // findRedactable would pick up. Before 2026-08-30 these fixtures produced
  // neither, so the scrubber exited 0 on a file the hook rejects.
  for (const [label, fixture] of HOOK_BLOCKED) {
    assert.equal(findRedactable(fixture).length, 0, `${label}: fixture should carry no contact PII`)
    assert.ok(findReportOnly(fixture).length > 0, `${label}: fixture must flag`)
  }
})

test('ordinary captured prose is not flagged', () => {
  // The cost of mirroring the hook is false positives; these are the shapes
  // that must stay clean so the scrubber does not become noise.
  const benign = [
    'The partner ecosystem now spans forty integrations.',
    'Our engineering interview loop is documented publicly.',
    'Therapy is one of the verticals this platform serves.',
    'The compensation module tracks headcount by department.',
  ]
  for (const text of benign) {
    assert.deepEqual(findReportOnly(text), [], `should not flag: ${JSON.stringify(text)}`)
  }
})

test('contact PII is still detected and is separate from report-only', () => {
  const withPhone = 'Contact sales at 555-123-4567 for a demo.'
  assert.deepEqual(findRedactable(withPhone), [{ name: 'us-phone', count: 1 }])
  assert.deepEqual(findReportOnly(withPhone), [])

  const withEmail = 'Reach the team at sales@example.com any time.'
  assert.deepEqual(findRedactable(withEmail), [{ name: 'email', count: 1 }])
})

test('importing the module does not run the CLI', () => {
  // The entry-point guard: if main() ran on import, this file would never
  // reach here — it would have exited the test runner.
  assert.equal(typeof findReportOnly, 'function')
})
