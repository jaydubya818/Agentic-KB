---
id: 01KNNVX2QWYX4MY0B3W57ZRH7Z
title: Superpowers
type: framework
vendor: Jay West (personal)
version: "5.0.6"
language: any
license: proprietary
github: ""
tags: [superpowers, tdd, verification, high-stakes, claude-code, jay-west, iron-laws]
last_checked: 2026-04-04
jay_experience: extensive
---

## Overview

[[framework-superpowers]] is Jay West's TDD-first, verification-driven agentic framework for high-stakes features where mistakes are costly. Where GSD optimizes for speed and iteration, [[framework-superpowers]] optimizes for correctness and auditability. It applies to any feature where an edge case is expensive: authentication systems, payment processing, agentic systems with real-world side effects, security-sensitive code.

[[framework-superpowers]] is implemented as a set of skills (slash commands) in `~/.claude/skills/superpowers/` plus a specialized code reviewer agent (`superpowers-code-reviewer`). It is a workflow framework — the discipline is in the process, not in a library.

Version 5.0.6. Jay uses it alongside GSD (GSD for MVP, [[framework-superpowers]] for hardening) and alongside [[framework-bmad]] ([[framework-bmad]] for planning, [[framework-superpowers]] for implementation of risky modules).

---

## Iron Laws (Non-Negotiable)

These four rules are enforced as workflow discipline. Violating them voids the framework's guarantees:

### Law 1: No Production Code Without a Failing Test First
Write the test. Run it. Watch it fail (for the right reason). Then write the implementation.
- If you wrote code before the test: delete the code, write the test first, then re-implement.
- "I'll add tests later" is failure mode #1. There is no later.

### Law 2: No Fixes Without Root Cause Investigation
When something breaks, the symptom is not the problem. The root cause is.
- Use `superpowers:systematic-debugging` before touching any code
- Document the root cause in a comment or MEMORY.md before fixing
- Fixing a symptom without understanding the cause guarantees recurrence

### Law 3: No Completion Claims Without Fresh Verification Evidence
Before claiming "done", run the verification command in this message — not from memory.
- "Tests pass" means they passed when you ran them just now, not yesterday
- Evidence must be fresh — produced in the current session turn
- Stale evidence is not evidence

### Law 4: If a Skill Might Apply (Even 1% Chance), Invoke It
No rationalization. No "this is simple enough to skip the brainstorm". If the skill is relevant, use it.
- The cost of using a skill unnecessarily is low
- The cost of skipping a relevant skill is hidden and often catastrophic
- Uncertainty itself is the signal to invoke

---

## Core Workflow

```
brainstorming
    │
    ▼
writing-plans (design doc)
    │
    ▼
subagent-driven-development (per task: implement → spec review → quality review)
    │
    ▼ (each task)
    ├── test-driven-development (failing test → implementation → green)
    ├── spec review (does this match the design doc?)
    └── quality review (superpowers-code-reviewer)
    │
    ▼
verification-before-completion (fresh evidence, full suite)
    │
    ▼
finishing-a-development-branch (cleanup, changelog, PR)
```

Every step is a skill invocation — not a suggestion, an invocation.

---

## Skills

All skills live in `~/.claude/skills/superpowers/`:

| Skill | Trigger | Purpose |
|-------|---------|---------|
| `superpowers:brainstorming` | Before any creative/feature work | Structured ideation; surface alternatives before committing |
| `superpowers:writing-plans` | After spec, before any code | Produce a detailed design doc with edge cases, error states, success criteria |
| `superpowers:test-driven-development` | Any new feature or bugfix | Red → Green → Refactor cycle with explicit steps |
| `superpowers:systematic-debugging` | Any bug or unexpected behavior | Root cause first, fix second |
| `superpowers:subagent-driven-development` | Executing plans with independent tasks | [[pattern-fan-out-worker]] to sub-agents per task, two-stage review per task |
| `superpowers:dispatching-parallel-agents` | 2+ independent failures or tasks | Parallel agent dispatch with result collection |
| `superpowers:verification-before-completion` | Before any "done" claim or PR | Fresh verification evidence, full test suite |
| `superpowers:finishing-a-development-branch` | After all tests pass | Cleanup, changelog, commit, PR prep |
| `superpowers:using-git-worktrees` | Risky/isolated changes | Sandboxed branch; main stays clean |
| `superpowers:requesting-code-review` | After implementation | Structured review request with context |
| `superpowers:receiving-code-review` | When review feedback arrives | Structured response to review comments |

---

## Two-Stage Review per Task
[[framework-superpowers]] mandates a two-stage review for every task in `subagent-driven-development`:

**Stage 1 — Spec Review**: Does the implementation match what the design doc specified?
- Mechanical comparison: spec says X, does the code do X?
- Missing behaviors, wrong error codes, incorrect state transitions

**Stage 2 — Quality Review**: Is the code production-ready independent of the spec?
- Type safety, error handling, security implications
- Test coverage quality (not just coverage %, but test value)
- Code clarity and maintainability
- Invokes `superpowers-code-reviewer` agent

Both reviews must pass before a task is marked complete.

---

## TDD Cycle Detail (`superpowers:test-driven-development`)

```
1. Read the design doc for this task
2. Write one failing test that captures the core behavior
   - Name it: "should <expected behavior> when <condition>"
   - Run it: confirm it fails for the RIGHT reason (not syntax error)
3. Write the minimal implementation to make the test pass
   - No extra functionality beyond what the test requires
4. Run all tests: confirm new test passes, no regressions
5. Refactor: clean up without breaking tests
6. Repeat for next behavior
```

Discipline detail: the test must fail for the right reason. A test that fails because of a missing import is not a meaningful failing test. It fails for the wrong reason.

---

## Architecture

```
Superpowers Framework
    │
    ├── Skills (workflow enforcement via prompts)
    │   └── ~/.claude/skills/superpowers/
    │       ├── brainstorming/
    │       ├── test-driven-development/
    │       ├── systematic-debugging/
    │       ├── writing-plans/
    │       ├── subagent-driven-development/
    │       ├── dispatching-parallel-agents/
    │       ├── verification-before-completion/
    │       ├── finishing-a-development-branch/
    │       ├── using-git-worktrees/
    │       ├── requesting-code-review/
    │       ├── receiving-code-review/
    │       └── using-superpowers/   ← meta-skill: when to invoke others
    │
    ├── Agent
    │   └── ~/.claude/agents/superpowers-code-reviewer.md
    │
    └── Hooks (implicit enforcement via CLAUDE.md discipline)
        └── Iron laws enforced via session memory + GSD prompt guard
```

---

## Strengths

- **Iron laws eliminate whole failure categories**: when you can't ship without a passing test, you can't ship broken auth
- **Two-stage review catches different bugs**: spec review catches "wrong behavior", quality review catches "right behavior, bad code"
- **Systematic debugging prevents symptom-fixing**: root cause discipline reduces recurrence rates dramatically
- **Verification-before-completion is a circuit breaker**: prevents the "I think it works" claim that causes production incidents
- **Composable with GSD**: use GSD for the MVP, [[framework-superpowers]] for the auth layer — they don't conflict
- **Worktree isolation for risky work**: `using-git-worktrees` means dangerous refactors can't corrupt main

---

## Weaknesses

- **Slower than GSD**: the full workflow (brainstorm → plan → TDD → two reviews → verification) takes 2-4x longer than just writing the code
- **Overkill for low-stakes work**: writing tests before a CSS utility class is waste
- **Requires discipline to maintain**: iron laws only work if they're actually followed; self-enforcement is hard under deadline pressure
- **No external enforcement**: unlike a CI gate, the iron laws are protocol, not code
- **Not for exploration**: if you don't know what you're building yet, the upfront design doc is premature

---

## Minimal Working Example

Sequence of skill invocations for adding a new payment webhook handler:

```
# Step 1: Before writing anything
/superpowers:brainstorming
> Topic: Stripe webhook handler for subscription events
> Output: 4 approaches considered, edge cases surfaced, approach chosen

# Step 2: Design document
/superpowers:writing-plans
> Based on brainstorm: write full design doc
> Output: DESIGN.md with endpoint spec, error codes, test cases, success criteria

# Step 3: Implement with TDD (per task from the design)
/superpowers:test-driven-development
> Task: signature validation middleware
> Red: write test → fails (no implementation)
> Green: implement → test passes
> Refactor: clean up
> Repeat for each spec behavior

# Step 4: Two-stage review
/superpowers:requesting-code-review
> Spec review: does implementation match DESIGN.md?
> Quality review (superpowers-code-reviewer agent)

# Step 5: Verify
/superpowers:verification-before-completion
> Run full test suite NOW (not from memory)
> Output: evidence block with timestamp and test results

# Step 6: Ship
/superpowers:finishing-a-development-branch
> Cleanup, changelog entry, commit message, PR prep
```

---

## When to Use [[framework-superpowers]] vs GSD vs [[framework-bmad]]

| Scenario | Framework |
|----------|-----------|
| Building an auth system | [[framework-superpowers]] (iron laws for security) |
| Integrating Stripe payments | [[framework-superpowers]] (financial correctness) |
| Building an agentic pipeline that takes real-world actions | [[framework-superpowers]] (side effects are expensive) |
| MVP feature that may be thrown away | GSD |
| Experimental UI exploration | GSD |
| Client deliverable with locked spec | [[framework-bmad]] |
| Hardening a GSD MVP | [[framework-superpowers]] on top of GSD |

---

## Integration Points

- **[[frameworks/framework-claude-code]]**: [[framework-superpowers]] skills are invoked within [[framework-claude-code]]; two-stage review uses the Agent tool to spawn the code-reviewer agent
- **[[frameworks/framework-gsd]]**: Hybrid pattern: GSD for MVP, [[framework-superpowers]] for hardening; frameworks are composable
- **[[frameworks/framework-bmad]]**: [[framework-bmad]] plans the spec-locked module; [[framework-superpowers]] implements it with TDD
- **[[entities/jay-west-agent-stack]]**: [[framework-superpowers]] is the stability layer of Jay's stack
- **[[patterns/pattern-fan-out-worker]]**: `subagent-driven-development` uses [[pattern-fan-out-worker]] for parallel task implementation

---

## Jay's Experience

Jay uses [[framework-superpowers]] as the reliability layer for anything that touches auth, payments, or agentic side-effects. Key validated findings:

1. **Iron Law 1 (TDD) eliminates the entire class of "I forgot to handle the error"**: when you write the test first, you enumerate failure modes by definition
2. **Iron Law 3 (fresh verification) catches surprising regressions**: more than once, running tests fresh revealed a passing test that had become broken by an unrelated change
3. **The brainstorm step has a 10:1 ROI**: 30 minutes of brainstorming before a design doc catches architectural mistakes that would take days to unwind
4. **Law 4 (invoke at 1%)**: the "this is too simple for a skill" rationalization is almost always wrong. The cost of wrongly skipping a skill is always higher than wrongly using one.

The framework's weakness in Jay's experience: it requires conscious activation. Under deadline pressure, the temptation to skip to direct implementation is real. The hooks help (gsd-prompt-guard blocks some bad behaviors) but iron law compliance ultimately requires human discipline.

---

## Version Notes

- **5.0.6**: current version; skill directory structure stable
- Skills organized as directories with `SKILL.md` files: `~/.claude/skills/superpowers/<skill-name>/`
- Separate from `~/.claude/skills/bmad/` — these are two distinct skill namespaces

---

## Sources

- Jay's `~/.claude/CLAUDE.md` (iron laws and workflow)
- Jay's `~/.claude/skills/superpowers/` (skill directory)
- Jay's `~/.claude/agents/superpowers-code-reviewer.md`
- [[entities/jay-west-agent-stack]]
- [[frameworks/framework-gsd]]
