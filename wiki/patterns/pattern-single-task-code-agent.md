     1|---
     2|id: 01KNNVX2R37XYCHXHB9GTDVDEY
     3|title: "Single-Task Code Generation Agent"
     4|type: pattern
     5|tags: [agents, patterns, workflow, automation, architecture]
     6|created: 2025-01-27
     7|stale_after_days: 730
updated: 2025-01-27
     8|visibility: public
     9|confidence: high
    10|related: [pattern-pipeline, concepts/task-decomposition, concepts/self-critique, concepts/system-prompt-design]
    11|---
    12|
    13|# Single-Task Code Generation Agent
    14|
    15|A tightly scoped agent that implements exactly one atomic task — no planning, no redesign, no scope creep. Receives context and a task spec as inputs; outputs complete file contents and a structured completion report.
    16|
    17|## When to Use
    18|
    19|- Inside a multi-step pipeline where planning and context-loading have already happened upstream (e.g. after a Task Breakdown agent and a Context Manager agent)
    20|- When you need deterministic, reviewable code output with explicit acceptance-criteria verification
    21|- When you want to prevent scope creep by design — the agent is constitutionally forbidden from doing anything outside its task spec
    22|- As the "write" step in a plan → context → write → validate pipeline
    23|
    24|## Structure
    25|
    26|```
    27|[Task Spec] ──┐
    28|              ├──▶ Code Generation Agent ──▶ [File outputs + TASK COMPLETE report] ──▶ Validation Agent
    29|[Context]  ──┘
    30|```
    31|
    32|**Inputs required:**
    33|1. Context output — list of files to read, relevant prior art, constraints
    34|2. Task spec — what to build, acceptance criteria, scope boundaries
    35|
    36|**Outputs produced:**
    37|1. Full file contents for every file created or modified (never diffs)
    38|2. A structured `TASK COMPLETE` block listing files changed, criteria met, and assumptions made
    39|3. If blocked: a `BLOCKER` report with problem description and suggested resolution
    40|
    41|## Example
    42|
    43|A pipeline agent first breaks a feature request into atomic tasks. Task #3 is "add input validation to `api/users.py`". The Context Manager loads the relevant files. The Code Generation Agent receives:
    44|- Context: `api/users.py`, `models/user.py`, `tests/test_users.py` (to read, not modify)
    45|- Spec: validate email format on POST /users, raise 400 with structured error, acceptance criteria: unit test passes, no changes to schema
    46|
    47|The agent reads all listed files first, writes down the acceptance criteria, implements only the validation logic, matches existing code style, and self-checks each criterion before outputting the full file and a `TASK COMPLETE` summary.
    48|
    49|## Code Quality Standards
    50|
    51|The agent enforces these rules on its output:
    52|
    53|- **Production quality** — not prototype quality; no TODOs unless the spec permits them
    54|- **Explicit error handling** — no silent failures, no bare `except` blocks
    55|- **No hardcoded secrets, ports, or hostnames** — config or environment variables only
    56|- **Documented assumptions** — any inference is annotated inline: `// ASSUMPTION: [what was assumed]`
    57|- **Style matching** — indentation, naming conventions, comment density from existing codebase
    58|- **Comments only where logic is non-obvious** — no over-commenting
    59|
    60|## Hard Limits (Constitutional Constraints)
    61|
    62|The agent is explicitly prohibited from:
    63|- Refactoring code outside task scope
    64|- Adding features not in the spec
    65|- Changing file structure beyond what the task requires
    66|- Modifying imports in files not listed in context
    67|- Asking "should I also…?" — it completes the task and hands off
    68|
    69|## Blocker Handling
    70|
    71|If the agent cannot proceed without guessing at a critical unknown, it stops and emits a structured blocker report rather than hallucinating a solution:
    72|
    73|```
    74|## BLOCKER: [Task ID]
    75|Problem: [what is missing or conflicting]
    76|Needed to proceed: [required information or prerequisite]
    77|Suggested resolution: [best guess at the right fix]
    78|```
    79|
    80|This surfaces blockers for human review rather than producing silently wrong code.
    81|
    82|## Trade-offs
    83|
    84|| Pro | Con |
    85||---|---|
    86|| Scope creep is structurally impossible | Requires well-formed upstream task specs — garbage in, garbage out |
    87|| Acceptance-criteria checklist makes validation mechanical | Agent cannot adapt if task spec is ambiguous — it blocks rather than infers |
    88|| Full file output (not diffs) is unambiguous and reviewable | Full file output can be verbose for large files |
    89|| Assumption documentation reduces silent errors | More tokens spent on structured output |
    90|
    91|## Related Patterns
    92|
    93|- [Pipeline Pattern](../patterns/pattern-pipeline.md) — this agent is typically one stage in a pipeline
    94|- [Fan-Out Worker Pattern](../patterns/pattern-fan-out-worker.md) — multiple code agents can run in parallel on independent tasks
    95|- [Confirm Before Destructive](../patterns/pattern-confirm-before-destructive.md) — complements this pattern when file deletions are in scope
    96|
    97|## See Also
    98|
    99|- [Task Decomposition](../concepts/task-decomposition.md)
   100|- [Self-Critique](../concepts/self-critique.md)
   101|- [System Prompt Design](../concepts/system-prompt-design.md)
   102|- [Sandboxed Execution](../concepts/sandboxed-execution.md)
   103|