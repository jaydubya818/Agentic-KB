---
id: 01KNNVX2RB039JT4HNMAEWTWDR
title: Code Reviewer Agent
type: summary
source_file: raw/my-agents/code-reviewer.md
author: Jay West
date_ingested: 2026-04-04
tags: [agentic, claude-code, agent-definition, code-review, quality, superpowers]
key_concepts: [severity-levels, six-review-dimensions, plan-alignment, structured-feedback]
confidence: high
---

# Code Reviewer Agent

## Key Purpose

Two distinct code reviewer agents exist in Jay's setup:

1. **`code-reviewer`** (simple) — Expert code reviewer for post-feature, pre-PR review. Reviews for correctness, security, performance, maintainability, testing, and conventions. Returns structured feedback with severity levels.

2. **`superpowers-code-reviewer`** — Plan-alignment reviewer. Called after a logical chunk of work is completed, comparing implementation against the original planning document. More process-aware than quality-aware.

## Tools Granted

Both: `model` differs. `code-reviewer` uses `claude-sonnet-4-5`. `superpowers-code-reviewer` uses `model: inherit` (takes the model of its spawner). The simple reviewer is always Sonnet; the superpowers reviewer adapts to context.

## Design Decisions

### Simple Reviewer: Four Severity Levels

Every finding is tagged with a severity that determines blocking status:
- CRITICAL (must fix before merge — security risk, data loss, broken behavior)
- IMPORTANT (should fix — technical debt, subtle bug risk)
- SUGGESTION (optional — style, readability, minor optimization)
- NITPICK (very minor, not blocking)

This severity taxonomy prevents reviews from becoming undifferentiated lists where everything looks equally urgent.

### Simple Reviewer: Six Dimensions

Reviews cover: Correctness, Security, Performance, Maintainability, Testing, Conventions. Each dimension has defined scope — Security covers injection and auth checks; Performance covers N+1s, indexes, and recomputation; Conventions checks against project-established patterns (not generic style guides).

### Simple Reviewer: Positive Acknowledgment

"If the code is good, say so clearly." Explicit instruction to acknowledge good decisions. Reviews are "conversations, not attacks." The reviewer also has a `### ✅ What's Done Well` section in its output format. This prevents reviews from being purely negative.

### [[framework-superpowers]] Reviewer: Plan-Alignment Focus

The superpowers version adds a dimension the simple reviewer lacks: does the implementation align with the planning document? It checks:
- Were all planned features implemented?
- Are deviations from the plan justified improvements or problematic departures?
- Does the implementation follow planned architecture?

When significant deviations are found, it asks the coding agent to review and confirm — it doesn't unilaterally reject.

### Communication Protocol ([[framework-superpowers]])

The superpowers reviewer has an explicit protocol for different failure types:
- Implementation problems → direct guidance on fixes
- Plan deviations → ask coding agent to confirm
- Original plan issues → recommend plan updates (the plan might be wrong, not the code)

This three-way categorization prevents false positives where the plan was outdated.

## Prompt Patterns Observed

- **Output format as contract:** Both reviewers define their output format in the definition. This makes their output machine-parseable and consistent across invocations.
- **"Don't bikeshed on style issues a linter could catch"** — explicit instruction to stay focused on substantive issues, not formatting.
- **Verdict + score:** Simple reviewer ends with `APPROVE / REQUEST CHANGES` and a 1–5 quality score. Binary verdict + numeric score gives the caller a clear signal.
- **Example triggers in description:** The superpowers reviewer includes verbatim `<example>` tags with user/assistant dialogue showing when to invoke it. This is the most elaborate trigger description in Jay's agent set.

## Related Concepts

- [[wiki/summaries/summary-architect-agent]]
- [[wiki/summaries/summary-security-reviewer-agent]]
- [[wiki/personal/personal-agent-design-observations]]

## Sources

- `raw/my-agents/code-reviewer.md`
- `raw/my-agents/superpowers-code-reviewer.md`
