---
id: 01KQ2XM79F3FJ1X8PGMCZPJ43K
title: "GSD Nyquist Auditor — Agent Profile"
type: entity
tags: [agents, workflow, automation, patterns]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [agents/workers/gsd-executor/profile.md, concepts/agent-loops.md]
---

# GSD Nyquist Auditor

A specialist worker agent spawned by `/gsd:validate-phase` to fill validation gaps in completed phases. Its sole responsibility is ensuring that every requirement in a completed phase has a corresponding passing automated test.

## Role

The Nyquist Auditor bridges the gap between "implementation complete" and "requirements verifiably met." It is named after the Nyquist sampling theorem — the idea that you must sample (test) at sufficient frequency to faithfully reconstruct (verify) a signal (requirement).

**Key constraint:** Implementation files are READ-ONLY. The auditor only creates or modifies test files, fixtures, and `VALIDATION.md`. If a gap reveals an implementation bug, the agent escalates rather than patches.

## Tools

`Read`, `Write`, `Edit`, `Bash`, `Glob`, `Grep`

## Execution Flow

1. **load_context** — Reads all files listed in `<files_to_read>`: implementation exports, PLANs, SUMMARYs, test infrastructure config, and any existing `VALIDATION.md`.
2. **analyze_gaps** — For each gap in `<gaps>`, identifies observable behavior, classifies the required test type (unit / integration / smoke), and maps to a test file path.
3. **generate_tests** — Discovers project test conventions (framework, file pattern, runner, assert style). Writes one focused behavioral test per requirement gap.
4. **run_and_verify** — Executes every test. Never marks an untested test as passing.
5. **debug_loop** — Up to 3 iterations per failing test. Fixes test-side errors (import, syntax, wrong assertion). Escalates implementation bugs or environment errors immediately.
6. **report** — Returns structured results: resolved gaps (green) and escalated gaps with debug history.

## Gap Classification

| Gap Type | Action |
|---|---|
| `no_test_file` | Create test file |
| `test_fails` | Diagnose and fix the test (not impl) |
| `no_automated_command` | Determine command, update verification map |

## Test Framework Support

| Framework | File Pattern | Runner | Assert Style |
|---|---|---|---|
| pytest | `test_{name}.py` | `pytest {file} -v` | `assert result == expected` |
| jest | `{name}.test.ts` | `npx jest {file}` | `expect(result).toBe(expected)` |
| vitest | `{name}.test.ts` | `npx vitest run {file}` | `expect(result).toBe(expected)` |
| go test | `{name}_test.go` | `go test -v -run {Name}` | `if got != want { t.Errorf(...) }` |

## Debug Escalation Rules

| Failure Type | Action |
|---|---|
| Import / syntax / fixture error | Fix test, re-run |
| Assertion: actual matches impl but violates requirement | **ESCALATE — implementation bug** |
| Assertion: test expectation wrong | Fix assertion, re-run |
| Environment / runtime error | **ESCALATE** |

After 3 failed iterations with no resolution, escalate with: requirement, expected vs actual behavior, and implementation file reference.

## Output Formats

- **GAPS FILLED** — All gaps resolved. Includes test file table, verification map updates, and file list for commit.
- **PARTIAL** — Some gaps resolved, some escalated.
- **ESCALATED** — No gaps could be resolved without implementation changes.

## See Also

- [GSD Executor Profile](../gsd-executor/profile.md)
- [Agent Loops](../../concepts/agent-loops.md)
- [Human-in-the-Loop](../../concepts/human-in-the-loop.md)
- [Agent Failure Modes](../../concepts/agent-failure-modes.md)
