---
id: 01KNNVX2R40KF5QX3WX54GFBA7
title: "Task Validation Agent Pattern"
type: pattern
tags: [agents, workflow, evaluation, patterns, automation]
created: 2025-01-25
updated: 2025-01-25
visibility: public
confidence: high
related: [pattern-pipeline, concepts/trajectory-evaluation, concepts/agent-failure-modes, concepts/guardrails]
---

# Task Validation Agent Pattern

A skeptical, gate-keeping agent that verifies completed work against its original acceptance criteria before allowing the pipeline to advance. Runs after every code-generation step and either passes the task or returns a structured FAIL report to the upstream agent.

## When to Use

- In multi-step pipelines where one agent generates code and another must verify it before the next stage begins
- Whenever task specifications carry explicit acceptance criteria that must all be satisfied
- To prevent error compounding — catching problems early is far cheaper than discovering them three steps later
- In agentic CI-style loops where a Code Generation Agent feeds downstream Runtime / Deployment agents

## Structure

```
[Task Spec + Acceptance Criteria]
         │
         ▼
 [Code Generation Agent (06)]
         │
         ▼
 [Task Validation Agent] ◄──── loops back on FAIL
         │
    PASS │ FAIL
    ▼         ▼
[Next     [Code Gen Agent
 Stage]    gets FAIL report only]
```

**Inputs required:**
1. Task spec (from a Task Breakdown Agent), including acceptance criteria
2. Code output (from Code Generation Agent)
3. Read access to the current codebase state

**Output:**
- `PASS` — "Task [ID] PASSED validation. Ready for next task."
- `FAIL` — Structured report with: which criteria failed (file, line, expected vs. found), severity (`BLOCKER` / `WARNING`), and the minimal change needed to fix it

## Validation Checklist

The agent works through every item without skipping:

### Spec Compliance
- Every acceptance criterion checked explicitly (no summarising)
- No scope creep — only in-scope files modified
- API contracts match architecture output (signatures, return types, error behaviour)
- File paths match the agreed folder structure

### Code Quality
- No syntax errors
- Error handling present where spec requires it — no silent swallowing
- No hardcoded secrets, ports, or hostnames (should be env vars)
- No obvious logic errors (off-by-one, wrong condition, missing return)
- Imports correct and complete

### Error Path Verification
- Every `catch` block narrows the error type — no bare `catch (error)` without type checking
- Caught errors logged with context (what was attempted, for whom, with what input)
- Every caught error either retries, degrades gracefully, or re-throws with context
- Cross-reference Error Registry from Plan Review — every listed error path implemented
- No error swallowed silently

### Shadow Path Check
For each data input, verify handling of:
- `null` / `undefined` — does not crash, sensible behaviour
- Empty input (empty string, empty array, zero) — handled distinctly from null
- Upstream error (API fail, DB timeout) — caught and reported to user

### Integration
- Correct integration with previously built components
- Function signatures match consuming module expectations
- No circular dependencies introduced

### Tests
- Existing tests run and pass
- New tests exist if the task required them
- No test deleted or disabled to make the task appear to pass
- Failure paths tested, not just happy paths

## Example

In an agentic development pipeline:

1. **Task Breakdown Agent** produces a spec: "Implement `getUserById(id: string): Promise<User | null>`. AC: returns null for unknown ID, throws `DatabaseError` on connection failure."
2. **Code Generation Agent (06)** produces the implementation.
3. **Task Validation Agent** checks:
   - Does it return `null` for unknown IDs? ✓
   - Does it throw `DatabaseError` (not swallow) on connection failure? ✗ — FAIL, BLOCKER
   - Reports: `src/users/repository.ts line 42 — catch block logs error but returns undefined instead of re-throwing DatabaseError`
4. FAIL report sent back to Code Generation Agent. Loop repeats until PASS.

## Trade-offs

| Benefit | Cost |
|---|---|
| Catches errors before they compound | Extra LLM call per task |
| Forces explicit acceptance criteria | Requires well-structured task specs upstream |
| Produces structured, actionable failure reports | Shadow path checking can be verbose |
| Prevents silent regressions via test checks | BLOCKER/WARNING judgement requires calibration |

## Related Patterns

- [Pattern: Pipeline](../patterns/pattern-pipeline.md) — Task Validation Agent is a natural gate in a pipeline
- [Pattern: Fan-Out Worker](../patterns/pattern-fan-out-worker.md) — validation can fan out per-file for large tasks
- [Trajectory Evaluation](../concepts/trajectory-evaluation.md) — evaluating whether an agent took the right steps, not just the final output
- [Agent Failure Modes](../concepts/agent-failure-modes.md) — the silent error swallow and scope creep failures this pattern specifically targets
- [Guardrails](../concepts/guardrails.md) — Task Validation is a soft guardrail applied at the workflow level

## See Also

- [LLM as Judge](../concepts/llm-as-judge.md) — related concept of using an LLM to evaluate another LLM's output
- [Self-Critique](../concepts/self-critique.md) — lighter-weight alternative where the generating agent critiques itself
- [Human in the Loop](../concepts/human-in-the-loop.md) — for cases where automated validation is insufficient
