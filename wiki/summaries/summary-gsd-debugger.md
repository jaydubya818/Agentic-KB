---
title: GSD Debugger Agent
type: summary
source_file: raw/my-agents/gsd-debugger.md
author: Jay West
date_ingested: 2026-04-04
tags: [agentic, claude-code, agent-definition, debugging, scientific-method, hypothesis-testing]
key_concepts: [scientific-debugging, cognitive-bias-avoidance, hypothesis-falsifiability, investigation-techniques, persistent-debug-state, reporter-investigator-division]
confidence: high
---

# GSD Debugger Agent

## Key Purpose

Investigates bugs using the scientific method, maintains persistent debug session state, and handles checkpoints when user input is unavoidable. Spawned by `/gsd:debug` or parallel UAT diagnosis workflows. Finds root causes — does not guess or apply symptomatic fixes.

## Tools Granted

`Read, Write, Edit, Bash, Grep, Glob, WebSearch` — Color: orange. Has web search (unlike executor), reflecting that debugging often requires looking up error messages, library behavior, or known issues.

## Design Decisions

### User = Reporter, Claude = Investigator

Explicit division of epistemic labor:
- User knows: symptoms, expected behavior, error messages, when it started
- User does NOT know: root cause, which file has the problem, what the fix should be

The agent is instructed never to ask the user diagnostic questions — that's its job. It asks about experience, not implementation.

### Meta-Debugging Protocol

When debugging code the agent itself wrote, additional discipline is required:
- Treat code as foreign — read it as if someone else wrote it
- Question design decisions — implementation choices are hypotheses, not facts
- Admit mental model might be wrong — "The code's behavior is truth; your model is a guess"
- Prioritize code you touched — if you modified 100 lines and something breaks, those are prime suspects

### Falsifiability Requirement for Hypotheses

Bad hypotheses: "Something is wrong with the state" (unfalsifiable)
Good hypotheses: "User state is reset because component remounts when route changes" (specific, testable claim)

The difference is specificity. Every hypothesis must be falsifiable — if you can't design an experiment to disprove it, it's not useful.

### Cognitive Bias Mitigation Table

Four biases are explicitly named with antidotes:
- **Confirmation bias** → Actively seek disconfirming evidence ("What would prove me wrong?")
- **Anchoring bias** → Generate 3+ independent hypotheses before investigating any
- **Availability bias** → Treat each bug as novel until evidence suggests otherwise
- **Sunk cost** → Every 30 min: "If I started fresh, is this still the path I'd take?"

### Investigation Techniques Arsenal

Seven named techniques with when-to-use guidance:
1. **Binary search / divide and conquer** — large codebase, many failure points
2. **Rubber duck debugging** — stuck, mental model doesn't match reality
3. **Minimal reproduction** — strip away everything until smallest code reproduces bug
4. **Working backwards** — know correct output, don't know why you're not getting it
5. **Differential debugging** — worked before, broken now; or works in dev not prod
6. **Observability first** — add logging before changing behavior (always)
7. **Follow the indirection** — paths/URLs/keys constructed from variables that may not resolve correctly

The "Follow the indirection" technique is the most specific to agentic systems — it targets bugs where code constructs paths (like hook directories) that diverge between the writer and the checker.

### Restart Protocol

Five conditions trigger a full restart (not just a new hypothesis):
1. 2+ hours with no progress
2. 3+ fixes that didn't work
3. Can't explain current behavior
4. Debugging the debugger
5. Fix works but you don't know why

Restart means: close all files, write down certainties, write down ruled-out causes, form new (different) hypotheses, begin from Phase 1.

### Multiple Hypotheses Strategy

Never fall in love with the first hypothesis. The agent generates competing hypotheses and designs experiments that differentiate between them in a single test. Example code shows a staged logging pattern where one test run differentiates four competing hypotheses (network timeout, validation, race condition, rate limiting).

### Persistent Debug State

The debugger maintains debug files that survive context resets — enabling multi-session debugging investigations without losing prior work.

## Prompt Patterns Observed

- **Philosophy section before process:** The `<philosophy>` section comes before `<hypothesis_testing>` and `<investigation_techniques>`. Mindset is established before methods.
- **Named cognitive biases with antidotes:** Naming biases gives the agent vocabulary to recognize when it's falling into a trap.
- **"The fix works but you don't know why"** — explicitly listed as a restart trigger. This prevents false resolution — where a bug appears fixed but the root cause is unknown.
- **Longest agent definition by line count (1373 lines):** The debugger is the most complex single agent in Jay's set. Debugging is treated as a discipline requiring more structure than any other operation.

## Related Concepts

- [[wiki/summaries/summary-gsd-verifier]]
- [[wiki/summaries/summary-gsd-executor]]

## Sources

- `raw/my-agents/gsd-debugger.md`
