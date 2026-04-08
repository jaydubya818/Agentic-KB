---
id: 01KNNVX2QX5HM4EFY3ABT7Y2X5
title: "Adversarial Plan Review"
type: pattern
tags: [agents, patterns, workflow, safety, architecture]
created: 2025-01-30
updated: 2025-01-30
visibility: public
confidence: high
related: [concepts/agent-failure-modes.md, concepts/task-decomposition.md, concepts/human-in-the-loop.md, patterns/pattern-confirm-before-destructive.md]
---

# Adversarial Plan Review

A structured review pattern that sits **between architecture design and planning/implementation**. Rather than rubber-stamping what the architecture agent produced, this pattern actively challenges premises, maps failure modes, traces error paths, and forces deployment thinking before any code is written.

## When to Use

- Before any multi-step implementation plan is executed
- When the architecture output touches >5 files or introduces new services
- When the cost of a wrong plan is high (irreversible changes, production systems)
- In multi-agent pipelines where a planner agent follows an architect agent

## Structure

The review proceeds through gated stages. Each stage ends with a **STOP** — the agent presents findings and does not proceed until the user responds. This is a hard [human-in-the-loop](../concepts/human-in-the-loop.md) requirement.

### Pre-Review: System Audit
Before reviewing the plan, gather context on current system state:
- Recent git history, open diffs, stashes
- Existing TODOs, FIXMEs, pain points in affected files
- In-flight work (open PRs, branches)

This prevents the review from operating in a vacuum and catches conflicts with in-flight work.

### Stage 0: Premise Challenge
Three sub-checks:
1. **Is this the right problem?** Could a different framing yield a simpler solution? What happens if we do nothing?
2. **Existing code leverage** — map every sub-problem to existing code before proposing new code
3. **Scope check** — if >8 files or >2 new services, challenge whether fewer moving parts can achieve the goal

After Stage 0, the user chooses a scope mode:
- **SCOPE EXPANSION** — push scope up, build the ideal solution
- **HOLD SCOPE** — scope is right, make it bulletproof
- **SCOPE REDUCTION** — strip to minimum viable, defer the rest

### Stage 1: Error & Rescue Map
For every new API route, server action, or data flow, produce a two-part table:
1. What can go wrong per codepath (typed errors, not generic `catch(error)`)
2. For each error type: is it caught? What is the recovery action? What does the user see?

**Key rules enforced:**
- `catch (error)` without type narrowing is always a smell
- `console.error` alone is insufficient — log what was attempted, with what arguments, for which user
- Every caught error must retry with backoff, degrade gracefully, or re-throw with context — swallow-and-continue is never acceptable
- LLM/AI calls require explicit handling for: malformed response, empty response, invalid JSON, model refusal

### Stage 2: Data Flow Shadow Paths
For every new data flow, trace the happy path AND all shadow paths at each node:

```
INPUT → VALIDATION → TRANSFORM → PERSIST → OUTPUT
  ↓          ↓            ↓           ↓         ↓
[null?]  [invalid?]   [throws?]  [conflict?] [stale?]
[empty?] [too long?]  [timeout?] [dup key?]  [partial?]
```

Also covers interaction edge cases: double-submit, stale state, user navigating away mid-operation, React 18 double-invocation of server actions, zero/10k results in lists.

### Stage 3: Security & Deployment
- New attack surface (endpoints, params, file paths, background jobs)
- Input validation and sanitization on all new user inputs
- Authorization scoping — direct object reference vulnerabilities
- Secrets management — new env vars, no hardcoding
- Injection vectors: SQL (raw queries), XSS, CSRF, prompt injection

## Example

In a pipeline with `Architecture Agent (01) → Plan Review Agent (02) → Planning Agent (03)`, the review agent receives the architecture output and original spec, then works through the four stages above before the planner is permitted to produce tasks.

## Trade-offs

| Pro | Con |
|-----|-----|
| Catches landmines before code is written | Adds latency to the pipeline |
| Forces explicit error handling design | Requires multiple human checkpoints |
| Prevents scope creep or over-engineering | Can be overly conservative on greenfield work |
| Documents failure modes as a by-product | Requires a capable, opinionated agent |

## Related Patterns

- [Confirm Before Destructive](../patterns/pattern-confirm-before-destructive.md) — same principle of stopping before irreversible actions
- [Fan-Out Worker](../patterns/pattern-fan-out-worker.md) — common pipeline this review step sits inside
- [Pipeline Pattern](../patterns/pattern-pipeline.md) — the broader pipeline context

## See Also

- [Agent Failure Modes](../concepts/agent-failure-modes.md)
- [Human-in-the-Loop](../concepts/human-in-the-loop.md)
- [Task Decomposition](../concepts/task-decomposition.md)
- [Guardrails](../concepts/guardrails.md)
