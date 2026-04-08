---
id: 01KNNVX2QY7A8PF0ZA5JR0PGYD
title: "Code Review Agent Pattern"
type: pattern
tags: [agents, patterns, tools, automation, workflow]
created: 2025-01-27
updated: 2025-01-27
visibility: public
confidence: high
related: [pattern-code-generation-agent, concepts/self-critique, concepts/agent-loops, concepts/system-prompt-design]
---

# Code Review Agent Pattern

A structured agent that performs automated code review across multiple quality dimensions, returning severity-categorised feedback with concrete fix suggestions.

## When to Use

- After implementing a feature, before opening a pull request
- As a gate in a CI/CD pipeline to flag high-severity issues before human review
- To provide a consistent review baseline when team bandwidth is limited
- Paired with a [code generation agent](../patterns/pattern-code-generation-agent.md) in a generate→review loop

## Structure

The agent is defined by three components:

### 1. Review Dimensions
The agent evaluates code across six explicit axes:

| Dimension | Focus |
|---|---|
| **Correctness** | All paths handled, code does what it claims |
| **Security** | Injection risks, missing auth checks, exposed data |
| **Performance** | N+1 queries, missing indexes, unnecessary recomputation |
| **Maintainability** | Readability, clarity for the next developer |
| **Testing** | Behaviour coverage, tests testing the right things |
| **Conventions** | Alignment with established project patterns |

### 2. Severity Levels
Feedback is categorised into four tiers:

- 🔴 **CRITICAL** — Must fix before merge. Security risk, data loss, or broken behaviour.
- 🟡 **IMPORTANT** — Should fix before merge. Technical debt or subtle bug risk.
- 🟢 **SUGGESTION** — Optional improvement. Style or minor optimisation.
- 💡 **NITPICK** — Very minor. Worth noting but not blocking.

### 3. Structured Output Format
Each review produces:
- Per-severity sections with file name, line number, problematic code, suggested fix, and reasoning
- A positive observations section ("What's Done Well")
- A summary verdict: `APPROVE` or `REQUEST CHANGES`, blocking issue count, and a 1–5 quality score

## Example

```
## Code Review: auth/login.ts

### 🔴 Critical
**[auth/login.ts:42]** — Password compared without constant-time function
```ts
// Current:
if (user.password === inputPassword) {

// Suggested:
if (await bcrypt.compare(inputPassword, user.password)) {
```
Reason: Timing attacks can reveal valid usernames.

### ✅ What's Done Well
- Error messages are generic and don't leak user existence.

### Summary
**Verdict**: REQUEST CHANGES  
**Blocking issues**: 1  
**Overall quality**: 3/5 — Solid structure but critical security gap.
```

## Trade-offs

| Pro | Con |
|---|---|
| Consistent coverage across all six dimensions | May flag false positives without full project context |
| Severity tiers help authors prioritise | Nitpicks can feel noisy if not filtered |
| Forces fix suggestions, not just complaints | Doesn't replace human judgment on architecture decisions |
| Acknowledges good decisions — avoids pure criticism | Cannot enforce linter-catchable style (should defer to tooling) |

**Key constraint**: The agent explicitly avoids bikeshedding on issues a linter could catch — scope it to semantic and structural concerns for best signal-to-noise ratio.

## Related Patterns

- [Pattern: Code Generation Agent](../patterns/pattern-code-generation-agent.md) — natural upstream partner; generate then review
- [Pattern: Adversarial Plan Review](../patterns/pattern-adversarial-plan-review.md) — similar critique-loop structure applied to plans
- [Pattern: Confirm Before Destructive](../patterns/pattern-confirm-before-destructive.md) — escalation pattern for CRITICAL findings
- [Concept: Self-Critique](../concepts/self-critique.md) — the underlying mechanism of agents reviewing their own or others' output
- [Concept: Human-in-the-Loop](../concepts/human-in-the-loop.md) — how to route CRITICAL findings to human reviewers

## See Also

- [Concept: Agent Failure Modes](../concepts/agent-failure-modes.md) — what happens when review agents miss issues
- [Concept: System Prompt Design](../concepts/system-prompt-design.md) — how the six-dimension structure and severity schema are encoded in the prompt
