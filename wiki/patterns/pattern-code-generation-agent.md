     1|---
     2|id: 01KNNVX2QYM61TJ8GESARVABXR
     3|title: "Code Generation Agent Pattern"
     4|type: pattern
     5|tags: [agents, patterns, workflow, automation, architecture]
     6|created: 2025-01-30
     7|stale_after_days: 730
updated: 2025-01-30
     8|visibility: public
     9|confidence: high
    10|related: [pattern-pipeline, concepts/task-decomposition, concepts/self-critique, concepts/system-prompt-design]
    11|---
    12|
    13|# Code Generation Agent Pattern
    14|
    15|A single-responsibility agent whose only job is to write production-ready code for one atomic task. It sits downstream of a Context Manager and a Task Breakdown step, and upstream of a Validation Agent. It does not plan, does not redesign, and does not ask clarifying questions about future work.
    16|
    17|## When to Use
    18|
    19|- You have a multi-agent pipeline where planning and context-loading are handled by earlier agents
    20|- Each task is small and well-scoped (atomic), with explicit acceptance criteria
    21|- You want strict containment: the agent must not drift into refactoring or feature-adding outside its scope
    22|- You need a reliable handoff point to a downstream validation step
    23|
    24|## Structure
    25|
    26|```
    27|[Task Breakdown Agent] ──► [Context Manager Agent] ──► [Code Generation Agent] ──► [Validation Agent]
    28|        (04)                        (05)                        (06)                      (07)
    29|```
    30|
    31|**Inputs required:**
    32|- Context output from Context Manager (which files to read, what to keep in mind)
    33|- Task spec from Task Breakdown (what to build, acceptance criteria, scope)
    34|
    35|**Outputs produced:**
    36|- Full file contents for every file modified or created (never diffs)
    37|- A `TASK COMPLETE` summary listing files, acceptance criteria status, and assumptions
    38|- A `BLOCKER` report if a prerequisite is missing or conflicting
    39|
    40|## Example
    41|
    42|A task spec says: *"Add input validation to the `createUser` endpoint. Accept only strings ≤ 64 chars for `username`. Return 400 on failure."*
    43|
    44|The Code Generation Agent:
    45|1. Reads every file listed by the Context Manager before writing
    46|2. Records the acceptance criteria visibly
    47|3. Implements exactly that validation — no other changes
    48|4. Matches existing code style (indentation, naming, error patterns)
    49|5. Self-checks each criterion before finalizing
    50|6. Outputs the full modified file and a TASK COMPLETE block
    51|
    52|If the existing error-handling pattern is ambiguous, it emits:
    53|```
    54|## BLOCKER: TASK-042
    55|Problem: Two conflicting error response formats found in codebase
    56|Needed to proceed: Canonical error shape for 4xx responses
    57|Suggested resolution: Standardise on { error: string, code: number } per auth module
    58|```
    59|
    60|## Code Quality Standards
    61|
    62|| Rule | Detail |
    63||---|---|
    64|| Production quality | No prototype shortcuts |
    65|| Comments | Only where logic is non-obvious |
    66|| Error handling | Explicit — no silent failures, no bare `except` |
    67|| TODOs | Forbidden unless task spec explicitly allows |
    68|| Assumptions | Document inline: `// ASSUMPTION: [what]` |
    69|| Secrets | Never hardcoded — use config or env vars |
    70|
    71|## Hard Limits
    72|
    73|The agent must NOT:
    74|- Refactor code outside the task scope
    75|- Add features not in the task spec
    76|- Change file structure beyond what the task requires
    77|- Modify imports in files not listed in context
    78|- Ask "should I also…?" — it completes the task as specified
    79|
    80|These hard limits are what make the agent safe to run in an automated pipeline without human review of every step.
    81|
    82|## Trade-offs
    83|
    84|| Pro | Con |
    85||---|---|
    86|| Highly predictable, scoped output | Requires well-formed upstream inputs to function |
    87|| Blocker reporting prevents silent failures | Cannot self-recover from missing context |
    88|| No scope creep by design | Will not catch issues outside the task spec |
    89|| Full file output makes diffs easy to review | Verbose output for large files |
    90|
    91|## Related Patterns
    92|
    93|- [Pipeline Pattern](pattern-pipeline.md) — the broader sequential chain this agent lives inside
    94|- [Fan-Out Worker Pattern](pattern-fan-out-worker.md) — alternative when tasks can be parallelised
    95|- [Confirm Before Destructive Pattern](pattern-confirm-before-destructive.md) — relevant when code changes are high-risk
    96|- [Idempotent Tools Pattern](pattern-idempotent-tools.md) — applies to any file-write operations the agent performs
    97|
    98|## See Also
    99|
   100|- [Task Decomposition](../concepts/task-decomposition.md)
   101|- [Self-Critique](../concepts/self-critique.md)
   102|- [Agent Failure Modes](../concepts/agent-failure-modes.md)
   103|- [System Prompt Design](../concepts/system-prompt-design.md)
   104|