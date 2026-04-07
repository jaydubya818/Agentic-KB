---
title: GSD Verifier Agent
type: summary
source_file: raw/my-agents/gsd-verifier.md
author: Jay West
date_ingested: 2026-04-04
tags: [agentic, claude-code, agent-definition, gsd, verification, goal-backward, stub-detection, data-flow]
key_concepts: [goal-backward-verification, four-level-artifact-check, stub-detection, data-flow-trace, behavioral-spot-checks, re-verification-mode, gap-structure]
confidence: high
---

# GSD Verifier Agent

## Key Purpose

Verifies that a phase achieved its **GOAL**, not just that its tasks were completed. The critical distinction: a task "create chat component" can be marked complete when the component is a placeholder. The task is done; the goal "working chat interface" is not. Spawned by `/gsd:verify-work`.

**Core mindset:** Do NOT trust SUMMARY.md claims. SUMMARYs document what Claude SAID it did. The verifier checks what ACTUALLY exists in the code.

## Tools Granted

`Read, Write, Bash, Grep, Glob` — Color: green. No Write of code (only writes the VERIFICATION.md report). Does NOT commit — orchestrator handles that.

## Design Decisions

### Goal-Backward Methodology

Start from what the phase SHOULD deliver, work backwards:
1. What must be TRUE for the goal to be achieved? (Observable truths)
2. What must EXIST for those truths to hold? (Artifacts)
3. What must be WIRED for those artifacts to function? (Key links)
4. Does real data actually flow through those links? (Data-flow trace)

Must-haves come from one of three sources (in priority order): PLAN.md `must_haves` frontmatter → ROADMAP.md Success Criteria → derived from phase goal text.

### Four-Level Artifact Verification

Each artifact is checked at four progressive levels:

| Level | Check | Status |
|-------|-------|--------|
| 1 | File exists | MISSING if not |
| 2 | File is substantive (not a stub) | STUB if placeholder |
| 3 | File is imported/used somewhere | ORPHANED if not |
| 4 | Real data flows through it (for rendering components) | HOLLOW if hardcoded |

The Level 4 data-flow trace is the most novel addition: it traces the actual data variable, finds where it's populated, checks if a real DB query/fetch exists, and flags components with props hardcoded to `[]` or `{}` at the call site.

### Stub Detection Patterns

The verifier has explicit grep patterns for common stub indicators:
- React stubs: `return null`, `return <div>Placeholder</div>`, `onClick={() => {}}`
- API stubs: `return Response.json([])` with no DB query above it
- Wiring red flags: `fetch('/api/...')` with no `.then()` or `await`, `await prisma.X.findMany()` followed by `return Response.json({ ok: true })` (query result ignored)
- Hardcoded empty props: `items={[]}`, `data={{}}` at call sites

**Key nuance:** A grep match is a STUB only when the value flows to rendering AND no other code path populates it. A test helper or initial state that gets overwritten by a fetch is NOT a stub.

### Re-Verification Mode

If a previous VERIFICATION.md exists with a `gaps:` section, the verifier enters re-verification mode:
- Only failed items get full 4-level verification
- Previously passed items get quick regression check (existence + basic sanity)
- Output includes `gaps_closed`, `gaps_remaining`, and `regressions` sections

This makes iterative fix-and-verify cycles efficient — don't re-examine what already passed.

### Behavioral Spot-Checks (Step 7b)

Beyond static analysis, the verifier runs behavioral checks on runnable code:
- Curl API endpoints and verify non-empty response
- Run CLI `--help` and grep for expected subcommands
- Check build output files exist
- Run test suites matching phase patterns

Constraints: each check < 10 seconds, no server startup, no state mutations.

### Gap Output Structure

Gaps are structured in YAML frontmatter for machine consumption by `/gsd:plan-phase --gaps`:

```yaml
gaps:
  - truth: "Observable truth that failed"
    status: failed
    reason: "Brief explanation"
    artifacts:
      - path: "src/path/to/file.tsx"
        issue: "What's wrong"
    missing:
      - "Specific thing to add/fix"
```

This closes the loop: verifier failures automatically feed into planner's gap-closure mode.

### Verification vs. Checking

The verifier's sibling `gsd-plan-checker` does the same goal-backward analysis but on PLANS (before execution) rather than CODE (after execution). Same methodology, different timing, different subject matter. Together they form a pre/post quality gate.

## Prompt Patterns Observed

- **"Do NOT trust SUMMARY claims"** — stated in role definition and repeated in critical_rules. Strong emphasis signals this was a real failure mode in practice.
- **Structured evidence tables:** Every verification step produces a specific table format (`✓ VERIFIED`, `✗ FAILED`, `? UNCERTAIN`) — standardized output enables downstream automation.
- **Step numbering with bash commands:** Each verification step includes exact bash commands to run. The verifier doesn't wing it — it has a defined grep repertoire.
- **Status determination by elimination:** Overall status is `passed` only if ALL truths verified AND no blocker anti-patterns. Any single failure flips status to `gaps_found`.

## Related Concepts

- [[patterns/pattern-plan-execute-verify]]
- [[wiki/summaries/summary-gsd-executor]]
- [[wiki/summaries/summary-gsd-planner]]

## Sources

- `raw/my-agents/gsd-verifier.md`
