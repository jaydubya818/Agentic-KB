     1|---
     2|id: 01KNNVX2QY7A8PF0ZA5JR0PGYD
     3|title: "Code Review Agent Pattern"
     4|type: pattern
     5|tags: [agents, patterns, tools, automation, workflow]
     6|created: 2025-01-27
     7|stale_after_days: 730
updated: 2025-01-27
     8|visibility: public
     9|confidence: high
    10|related: [pattern-code-generation-agent, concepts/self-critique, concepts/agent-loops, concepts/system-prompt-design]
    11|---
    12|
    13|# Code Review Agent Pattern
    14|
    15|A structured agent that performs automated code review across multiple quality dimensions, returning severity-categorised feedback with concrete fix suggestions.
    16|
    17|## When to Use
    18|
    19|- After implementing a feature, before opening a pull request
    20|- As a gate in a CI/CD pipeline to flag high-severity issues before human review
    21|- To provide a consistent review baseline when team bandwidth is limited
    22|- Paired with a [code generation agent](../patterns/pattern-code-generation-agent.md) in a generate→review loop
    23|
    24|## Structure
    25|
    26|The agent is defined by three components:
    27|
    28|### 1. Review Dimensions
    29|The agent evaluates code across six explicit axes:
    30|
    31|| Dimension | Focus |
    32||---|---|
    33|| **Correctness** | All paths handled, code does what it claims |
    34|| **Security** | Injection risks, missing auth checks, exposed data |
    35|| **Performance** | N+1 queries, missing indexes, unnecessary recomputation |
    36|| **Maintainability** | Readability, clarity for the next developer |
    37|| **Testing** | Behaviour coverage, tests testing the right things |
    38|| **Conventions** | Alignment with established project patterns |
    39|
    40|### 2. Severity Levels
    41|Feedback is categorised into four tiers:
    42|
    43|- 🔴 **CRITICAL** — Must fix before merge. Security risk, data loss, or broken behaviour.
    44|- 🟡 **IMPORTANT** — Should fix before merge. Technical debt or subtle bug risk.
    45|- 🟢 **SUGGESTION** — Optional improvement. Style or minor optimisation.
    46|- 💡 **NITPICK** — Very minor. Worth noting but not blocking.
    47|
    48|### 3. Structured Output Format
    49|Each review produces:
    50|- Per-severity sections with file name, line number, problematic code, suggested fix, and reasoning
    51|- A positive observations section ("What's Done Well")
    52|- A summary verdict: `APPROVE` or `REQUEST CHANGES`, blocking issue count, and a 1–5 quality score
    53|
    54|## Example
    55|
    56|```
    57|## Code Review: auth/login.ts
    58|
    59|### 🔴 Critical
    60|**[auth/login.ts:42]** — Password compared without constant-time function
    61|```ts
    62|// Current:
    63|if (user.password === inputPassword) {
    64|
    65|// Suggested:
    66|if (await bcrypt.compare(inputPassword, user.password)) {
    67|```
    68|Reason: Timing attacks can reveal valid usernames.
    69|
    70|### ✅ What's Done Well
    71|- Error messages are generic and don't leak user existence.
    72|
    73|### Summary
    74|**Verdict**: REQUEST CHANGES  
    75|**Blocking issues**: 1  
    76|**Overall quality**: 3/5 — Solid structure but critical security gap.
    77|```
    78|
    79|## Trade-offs
    80|
    81|| Pro | Con |
    82||---|---|
    83|| Consistent coverage across all six dimensions | May flag false positives without full project context |
    84|| Severity tiers help authors prioritise | Nitpicks can feel noisy if not filtered |
    85|| Forces fix suggestions, not just complaints | Doesn't replace human judgment on architecture decisions |
    86|| Acknowledges good decisions — avoids pure criticism | Cannot enforce linter-catchable style (should defer to tooling) |
    87|
    88|**Key constraint**: The agent explicitly avoids bikeshedding on issues a linter could catch — scope it to semantic and structural concerns for best signal-to-noise ratio.
    89|
    90|## Related Patterns
    91|
    92|- [Pattern: Code Generation Agent](../patterns/pattern-code-generation-agent.md) — natural upstream partner; generate then review
    93|- [Pattern: Adversarial Plan Review](../patterns/pattern-adversarial-plan-review.md) — similar critique-loop structure applied to plans
    94|- [Pattern: Confirm Before Destructive](../patterns/pattern-confirm-before-destructive.md) — escalation pattern for CRITICAL findings
    95|- [Concept: Self-Critique](../concepts/self-critique.md) — the underlying mechanism of agents reviewing their own or others' output
    96|- [Concept: Human-in-the-Loop](../concepts/human-in-the-loop.md) — how to route CRITICAL findings to human reviewers
    97|
    98|## See Also
    99|
   100|- [Concept: Agent Failure Modes](../concepts/agent-failure-modes.md) — what happens when review agents miss issues
   101|- [Concept: System Prompt Design](../concepts/system-prompt-design.md) — how the six-dimension structure and severity schema are encoded in the prompt
   102|