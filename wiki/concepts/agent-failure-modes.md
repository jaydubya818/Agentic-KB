     1|---
     2|id: 01KNNVX2Q9C1KXNR4GZEYYNDC3
     3|title: "Agent Failure Modes"
     4|type: concept
     5|tags: [agents, safety, architecture, workflow]
     6|stale_after_days: 730
updated: 2025-01-30
     7|visibility: public
     8|related: [patterns/pattern-adversarial-plan-review.md, concepts/human-in-the-loop.md, concepts/guardrails.md]
     9|---
    10|
    11|# Agent Failure Modes
    12|
    13|> **Note:** This page was updated to incorporate the error taxonomy and shadow-path model from the Plan Review Agent pattern.
    14|
    15|## Definition
    16|
    17|Agent failure modes are the distinct ways an agentic system can produce wrong, harmful, incomplete, or unrecoverable outcomes. Failures occur at multiple levels: bad inputs, logic errors, external service failures, data persistence issues, and silent swallowing of exceptions.
    18|
    19|## Why It Matters
    20|
    21|Agents operating in multi-step pipelines can compound errors — a failure in step 2 that is silently swallowed corrupts steps 3–N without any visible signal. Cataloguing failure modes in advance is the primary defense.
    22|
    23|## Taxonomy of Failure Modes
    24|
    25|### 1. Error Handling Gaps
    26|- `catch (error)` without type narrowing — catches everything, handles nothing specifically
    27|- `console.error` alone — logs but does not recover or inform the user
    28|- Swallow-and-continue — error is caught and execution proceeds as if nothing happened
    29|- Missing retry logic on transient failures (network timeouts, DB connection drops)
    30|
    31|### 2. Data Flow Shadow Paths
    32|At every node in a data pipeline (input → validation → transform → persist → output), shadow paths can diverge from the happy path:
    33|- **Input**: null, undefined, empty string, wrong type
    34|- **Validation**: too long, wrong format, missing required fields
    35|- **Transform**: throws unexpectedly, OOM, timeout
    36|- **Persist**: conflict, duplicate key, row lock
    37|- **Output**: stale data, partial write, encoding error
    38|
    39|### 3. LLM-Specific Failures
    40|For agents that call LLMs as sub-components:
    41|- Malformed response (not valid JSON when JSON is expected)
    42|- Empty response
    43|- Model refusal (safety filter triggered)
    44|- Truncated output (context window overflow)
    45|- Hallucinated tool calls or arguments
    46|
    47|### 4. Interaction Edge Cases
    48|- Double-submit (user clicks twice before response)
    49|- Stale state (form submitted after data changed server-side)
    50|- User navigates away mid-operation
    51|- Operation times out with no user feedback
    52|- Retry while a prior attempt is still in-flight
    53|- Framework-level double invocation (e.g., React 18 Strict Mode server actions)
    54|
    55|### 5. Scope & Premise Failures
    56|- Solving the wrong problem (architecture correct but goal mis-specified)
    57|- Rebuilding existing code that could have been refactored
    58|- Over-engineering (introducing unnecessary services/modules)
    59|- Under-scoping (deferring required changes, creating debt)
    60|
    61|## Recovery Principles
    62|
    63|Every caught error must do one of:
    64|1. **Retry with backoff** — for transient failures
    65|2. **Degrade gracefully** — serve a reduced experience with a user-visible message
    66|3. **Re-throw with context** — add what was being attempted, with what arguments, for which user
    67|
    68|Swallow-and-continue is never acceptable.
    69|
    70|## Example
    71|
    72|Using an Error & Rescue Map (from the [Adversarial Plan Review pattern](../patterns/pattern-adversarial-plan-review.md)):
    73|
    74|```
    75|ERROR TYPE                    | CAUGHT? | RECOVERY ACTION        | USER SEES
    76|------------------------------|---------|------------------------|------------------
    77|PrismaClientKnownRequestError | Y       | Retry 1x, then 503     | "Try again shortly"
    78|ZodError                      | Y       | Return 400 + fields    | Form field errors
    79|AuthError                     | N ← GAP | —                      | 500 ← BAD
    80|TooManyRequestsError          | N ← GAP | —                      | 500 ← BAD
    81|```
    82|
    83|GAPs are explicit — they are not silently absent but flagged and assigned a required fix.
    84|
    85|## See Also
    86|
    87|- [Adversarial Plan Review Pattern](../patterns/pattern-adversarial-plan-review.md)
    88|- [Human-in-the-Loop](../concepts/human-in-the-loop.md)
    89|- [Guardrails](../concepts/guardrails.md)
    90|- [Trajectory Evaluation](../concepts/trajectory-evaluation.md)
    91|