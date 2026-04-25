     1|---
     2|id: 01KNNVX2QX5HM4EFY3ABT7Y2X5
     3|title: "Adversarial Plan Review"
     4|type: pattern
     5|tags: [agents, patterns, workflow, safety, architecture]
     6|created: 2025-01-30
     7|stale_after_days: 730
updated: 2025-01-30
     8|visibility: public
     9|confidence: high
    10|related: [concepts/agent-failure-modes.md, concepts/task-decomposition.md, concepts/human-in-the-loop.md, patterns/pattern-confirm-before-destructive.md]
    11|---
    12|
    13|# Adversarial Plan Review
    14|
    15|A structured review pattern that sits **between architecture design and planning/implementation**. Rather than rubber-stamping what the architecture agent produced, this pattern actively challenges premises, maps failure modes, traces error paths, and forces deployment thinking before any code is written.
    16|
    17|## When to Use
    18|
    19|- Before any multi-step implementation plan is executed
    20|- When the architecture output touches >5 files or introduces new services
    21|- When the cost of a wrong plan is high (irreversible changes, production systems)
    22|- In multi-agent pipelines where a planner agent follows an architect agent
    23|
    24|## Structure
    25|
    26|The review proceeds through gated stages. Each stage ends with a **STOP** — the agent presents findings and does not proceed until the user responds. This is a hard [human-in-the-loop](../concepts/human-in-the-loop.md) requirement.
    27|
    28|### Pre-Review: System Audit
    29|Before reviewing the plan, gather context on current system state:
    30|- Recent git history, open diffs, stashes
    31|- Existing TODOs, FIXMEs, pain points in affected files
    32|- In-flight work (open PRs, branches)
    33|
    34|This prevents the review from operating in a vacuum and catches conflicts with in-flight work.
    35|
    36|### Stage 0: Premise Challenge
    37|Three sub-checks:
    38|1. **Is this the right problem?** Could a different framing yield a simpler solution? What happens if we do nothing?
    39|2. **Existing code leverage** — map every sub-problem to existing code before proposing new code
    40|3. **Scope check** — if >8 files or >2 new services, challenge whether fewer moving parts can achieve the goal
    41|
    42|After Stage 0, the user chooses a scope mode:
    43|- **SCOPE EXPANSION** — push scope up, build the ideal solution
    44|- **HOLD SCOPE** — scope is right, make it bulletproof
    45|- **SCOPE REDUCTION** — strip to minimum viable, defer the rest
    46|
    47|### Stage 1: Error & Rescue Map
    48|For every new API route, server action, or data flow, produce a two-part table:
    49|1. What can go wrong per codepath (typed errors, not generic `catch(error)`)
    50|2. For each error type: is it caught? What is the recovery action? What does the user see?
    51|
    52|**Key rules enforced:**
    53|- `catch (error)` without type narrowing is always a smell
    54|- `console.error` alone is insufficient — log what was attempted, with what arguments, for which user
    55|- Every caught error must retry with backoff, degrade gracefully, or re-throw with context — swallow-and-continue is never acceptable
    56|- LLM/AI calls require explicit handling for: malformed response, empty response, invalid JSON, model refusal
    57|
    58|### Stage 2: Data Flow Shadow Paths
    59|For every new data flow, trace the happy path AND all shadow paths at each node:
    60|
    61|```
    62|INPUT → VALIDATION → TRANSFORM → PERSIST → OUTPUT
    63|  ↓          ↓            ↓           ↓         ↓
    64|[null?]  [invalid?]   [throws?]  [conflict?] [stale?]
    65|[empty?] [too long?]  [timeout?] [dup key?]  [partial?]
    66|```
    67|
    68|Also covers interaction edge cases: double-submit, stale state, user navigating away mid-operation, React 18 double-invocation of server actions, zero/10k results in lists.
    69|
    70|### Stage 3: Security & Deployment
    71|- New attack surface (endpoints, params, file paths, background jobs)
    72|- Input validation and sanitization on all new user inputs
    73|- Authorization scoping — direct object reference vulnerabilities
    74|- Secrets management — new env vars, no hardcoding
    75|- Injection vectors: SQL (raw queries), XSS, CSRF, prompt injection
    76|
    77|## Example
    78|
    79|In a pipeline with `Architecture Agent (01) → Plan Review Agent (02) → Planning Agent (03)`, the review agent receives the architecture output and original spec, then works through the four stages above before the planner is permitted to produce tasks.
    80|
    81|## Trade-offs
    82|
    83|| Pro | Con |
    84||-----|-----|
    85|| Catches landmines before code is written | Adds latency to the pipeline |
    86|| Forces explicit error handling design | Requires multiple human checkpoints |
    87|| Prevents scope creep or over-engineering | Can be overly conservative on greenfield work |
    88|| Documents failure modes as a by-product | Requires a capable, opinionated agent |
    89|
    90|## Related Patterns
    91|
    92|- [Confirm Before Destructive](../patterns/pattern-confirm-before-destructive.md) — same principle of stopping before irreversible actions
    93|- [Fan-Out Worker](../patterns/pattern-fan-out-worker.md) — common pipeline this review step sits inside
    94|- [Pipeline Pattern](../patterns/pattern-pipeline.md) — the broader pipeline context
    95|
    96|## See Also
    97|
    98|- [Agent Failure Modes](../concepts/agent-failure-modes.md)
    99|- [Human-in-the-Loop](../concepts/human-in-the-loop.md)
   100|- [Task Decomposition](../concepts/task-decomposition.md)
   101|- [Guardrails](../concepts/guardrails.md)
   102|