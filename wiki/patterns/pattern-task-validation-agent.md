     1|---
     2|id: 01KNNVX2R40KF5QX3WX54GFBA7
     3|title: "Task Validation Agent Pattern"
     4|type: pattern
     5|tags: [agents, workflow, evaluation, patterns, automation]
     6|created: 2025-01-25
     7|stale_after_days: 730
updated: 2025-01-25
     8|visibility: public
     9|confidence: high
    10|related: [pattern-pipeline, concepts/trajectory-evaluation, concepts/agent-failure-modes, concepts/guardrails]
    11|---
    12|
    13|# Task Validation Agent Pattern
    14|
    15|A skeptical, gate-keeping agent that verifies completed work against its original acceptance criteria before allowing the pipeline to advance. Runs after every code-generation step and either passes the task or returns a structured FAIL report to the upstream agent.
    16|
    17|## When to Use
    18|
    19|- In multi-step pipelines where one agent generates code and another must verify it before the next stage begins
    20|- Whenever task specifications carry explicit acceptance criteria that must all be satisfied
    21|- To prevent error compounding — catching problems early is far cheaper than discovering them three steps later
    22|- In agentic CI-style loops where a Code Generation Agent feeds downstream Runtime / Deployment agents
    23|
    24|## Structure
    25|
    26|```
    27|[Task Spec + Acceptance Criteria]
    28|         │
    29|         ▼
    30| [Code Generation Agent (06)]
    31|         │
    32|         ▼
    33| [Task Validation Agent] ◄──── loops back on FAIL
    34|         │
    35|    PASS │ FAIL
    36|    ▼         ▼
    37|[Next     [Code Gen Agent
    38| Stage]    gets FAIL report only]
    39|```
    40|
    41|**Inputs required:**
    42|1. Task spec (from a Task Breakdown Agent), including acceptance criteria
    43|2. Code output (from Code Generation Agent)
    44|3. Read access to the current codebase state
    45|
    46|**Output:**
    47|- `PASS` — "Task [ID] PASSED validation. Ready for next task."
    48|- `FAIL` — Structured report with: which criteria failed (file, line, expected vs. found), severity (`BLOCKER` / `WARNING`), and the minimal change needed to fix it
    49|
    50|## Validation Checklist
    51|
    52|The agent works through every item without skipping:
    53|
    54|### Spec Compliance
    55|- Every acceptance criterion checked explicitly (no summarising)
    56|- No scope creep — only in-scope files modified
    57|- API contracts match architecture output (signatures, return types, error behaviour)
    58|- File paths match the agreed folder structure
    59|
    60|### Code Quality
    61|- No syntax errors
    62|- Error handling present where spec requires it — no silent swallowing
    63|- No hardcoded secrets, ports, or hostnames (should be env vars)
    64|- No obvious logic errors (off-by-one, wrong condition, missing return)
    65|- Imports correct and complete
    66|
    67|### Error Path Verification
    68|- Every `catch` block narrows the error type — no bare `catch (error)` without type checking
    69|- Caught errors logged with context (what was attempted, for whom, with what input)
    70|- Every caught error either retries, degrades gracefully, or re-throws with context
    71|- Cross-reference Error Registry from Plan Review — every listed error path implemented
    72|- No error swallowed silently
    73|
    74|### Shadow Path Check
    75|For each data input, verify handling of:
    76|- `null` / `undefined` — does not crash, sensible behaviour
    77|- Empty input (empty string, empty array, zero) — handled distinctly from null
    78|- Upstream error (API fail, DB timeout) — caught and reported to user
    79|
    80|### Integration
    81|- Correct integration with previously built components
    82|- Function signatures match consuming module expectations
    83|- No circular dependencies introduced
    84|
    85|### Tests
    86|- Existing tests run and pass
    87|- New tests exist if the task required them
    88|- No test deleted or disabled to make the task appear to pass
    89|- Failure paths tested, not just happy paths
    90|
    91|## Example
    92|
    93|In an agentic development pipeline:
    94|
    95|1. **Task Breakdown Agent** produces a spec: "Implement `getUserById(id: string): Promise<User | null>`. AC: returns null for unknown ID, throws `DatabaseError` on connection failure."
    96|2. **Code Generation Agent (06)** produces the implementation.
    97|3. **Task Validation Agent** checks:
    98|   - Does it return `null` for unknown IDs? ✓
    99|   - Does it throw `DatabaseError` (not swallow) on connection failure? ✗ — FAIL, BLOCKER
   100|   - Reports: `src/users/repository.ts line 42 — catch block logs error but returns undefined instead of re-throwing DatabaseError`
   101|4. FAIL report sent back to Code Generation Agent. Loop repeats until PASS.
   102|
   103|## Trade-offs
   104|
   105|| Benefit | Cost |
   106||---|---|
   107|| Catches errors before they compound | Extra LLM call per task |
   108|| Forces explicit acceptance criteria | Requires well-structured task specs upstream |
   109|| Produces structured, actionable failure reports | Shadow path checking can be verbose |
   110|| Prevents silent regressions via test checks | BLOCKER/WARNING judgement requires calibration |
   111|
   112|## Related Patterns
   113|
   114|- [Pattern: Pipeline](../patterns/pattern-pipeline.md) — Task Validation Agent is a natural gate in a pipeline
   115|- [Pattern: Fan-Out Worker](../patterns/pattern-fan-out-worker.md) — validation can fan out per-file for large tasks
   116|- [Trajectory Evaluation](../concepts/trajectory-evaluation.md) — evaluating whether an agent took the right steps, not just the final output
   117|- [Agent Failure Modes](../concepts/agent-failure-modes.md) — the silent error swallow and scope creep failures this pattern specifically targets
   118|- [Guardrails](../concepts/guardrails.md) — Task Validation is a soft guardrail applied at the workflow level
   119|
   120|## See Also
   121|
   122|- [LLM as Judge](../concepts/llm-as-judge.md) — related concept of using an LLM to evaluate another LLM's output
   123|- [Self-Critique](../concepts/self-critique.md) — lighter-weight alternative where the generating agent critiques itself
   124|- [Human in the Loop](../concepts/human-in-the-loop.md) — for cases where automated validation is insufficient
   125|