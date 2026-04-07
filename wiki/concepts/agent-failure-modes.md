---
title: "Agent Failure Modes"
type: concept
tags: [agents, safety, architecture, workflow]
updated: 2025-01-30
visibility: public
related: [patterns/pattern-adversarial-plan-review.md, concepts/human-in-the-loop.md, concepts/guardrails.md]
---

# Agent Failure Modes

> **Note:** This page was updated to incorporate the error taxonomy and shadow-path model from the Plan Review Agent pattern.

## Definition

Agent failure modes are the distinct ways an agentic system can produce wrong, harmful, incomplete, or unrecoverable outcomes. Failures occur at multiple levels: bad inputs, logic errors, external service failures, data persistence issues, and silent swallowing of exceptions.

## Why It Matters

Agents operating in multi-step pipelines can compound errors — a failure in step 2 that is silently swallowed corrupts steps 3–N without any visible signal. Cataloguing failure modes in advance is the primary defense.

## Taxonomy of Failure Modes

### 1. Error Handling Gaps
- `catch (error)` without type narrowing — catches everything, handles nothing specifically
- `console.error` alone — logs but does not recover or inform the user
- Swallow-and-continue — error is caught and execution proceeds as if nothing happened
- Missing retry logic on transient failures (network timeouts, DB connection drops)

### 2. Data Flow Shadow Paths
At every node in a data pipeline (input → validation → transform → persist → output), shadow paths can diverge from the happy path:
- **Input**: null, undefined, empty string, wrong type
- **Validation**: too long, wrong format, missing required fields
- **Transform**: throws unexpectedly, OOM, timeout
- **Persist**: conflict, duplicate key, row lock
- **Output**: stale data, partial write, encoding error

### 3. LLM-Specific Failures
For agents that call LLMs as sub-components:
- Malformed response (not valid JSON when JSON is expected)
- Empty response
- Model refusal (safety filter triggered)
- Truncated output (context window overflow)
- Hallucinated tool calls or arguments

### 4. Interaction Edge Cases
- Double-submit (user clicks twice before response)
- Stale state (form submitted after data changed server-side)
- User navigates away mid-operation
- Operation times out with no user feedback
- Retry while a prior attempt is still in-flight
- Framework-level double invocation (e.g., React 18 Strict Mode server actions)

### 5. Scope & Premise Failures
- Solving the wrong problem (architecture correct but goal mis-specified)
- Rebuilding existing code that could have been refactored
- Over-engineering (introducing unnecessary services/modules)
- Under-scoping (deferring required changes, creating debt)

## Recovery Principles

Every caught error must do one of:
1. **Retry with backoff** — for transient failures
2. **Degrade gracefully** — serve a reduced experience with a user-visible message
3. **Re-throw with context** — add what was being attempted, with what arguments, for which user

Swallow-and-continue is never acceptable.

## Example

Using an Error & Rescue Map (from the [Adversarial Plan Review pattern](../patterns/pattern-adversarial-plan-review.md)):

```
ERROR TYPE                    | CAUGHT? | RECOVERY ACTION        | USER SEES
------------------------------|---------|------------------------|------------------
PrismaClientKnownRequestError | Y       | Retry 1x, then 503     | "Try again shortly"
ZodError                      | Y       | Return 400 + fields    | Form field errors
AuthError                     | N ← GAP | —                      | 500 ← BAD
TooManyRequestsError          | N ← GAP | —                      | 500 ← BAD
```

GAPs are explicit — they are not silently absent but flagged and assigned a required fix.

## See Also

- [Adversarial Plan Review Pattern](../patterns/pattern-adversarial-plan-review.md)
- [Human-in-the-Loop](../concepts/human-in-the-loop.md)
- [Guardrails](../concepts/guardrails.md)
- [Trajectory Evaluation](../concepts/trajectory-evaluation.md)
