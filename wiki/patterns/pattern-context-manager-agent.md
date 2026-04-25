     1|---
     2|id: 01KNNVX2QYTRD6HZ312G6GG4GJ
     3|title: "Context Manager Agent Pattern"
     4|type: pattern
     5|tags: [agents, context, orchestration, patterns, architecture]
     6|created: 2025-01-01
     7|stale_after_days: 730
updated: 2025-01-01
     8|visibility: public
     9|confidence: high
    10|related: [concepts/context-management.md, concepts/task-decomposition.md, concepts/multi-agent-systems.md, patterns/pattern-pipeline.md]
    11|---
    12|
    13|# Context Manager Agent Pattern
    14|
    15|A dedicated agent that runs before a code-generation (or any execution) agent, determining precisely which context is needed for the task at hand — and, crucially, which context to exclude.
    16|
    17|## When to Use
    18|
    19|- In multi-agent pipelines where an execution agent (e.g. Code Generation Agent) consumes context from a growing codebase
    20|- When context bloat is a recurring problem — long projects accumulate files that pollute prompts
    21|- When tasks are broken down by a [Task Decomposition](../concepts/task-decomposition.md) step and each subtask has distinct, bounded context needs
    22|- When multiple agents share a large architecture document, but each needs only a slice of it
    23|
    24|## Structure
    25|
    26|The Context Manager Agent sits between the Task Breakdown Agent and the Code Generation Agent in the pipeline.
    27|
    28|```
    29|Task Spec + Architecture + File List
    30|          │
    31|  [Context Manager Agent]
    32|          │
    33|  Scoped Context Package
    34|          │
    35|  [Code Generation Agent]
    36|```
    37|
    38|**Inputs:**
    39|1. The specific task spec (from Task Breakdown Agent)
    40|2. The full architecture output
    41|3. A current file listing or summary of what has been built
    42|
    43|**Outputs (structured):**
    44|- **Files to Read** — ordered by importance, with a reason for each; if only one function in a large file is relevant, name the function
    45|- **Files to Ignore** — explicitly lists files that appear relevant but aren't needed
    46|- **Relevant Contracts (inlined)** — specific function signatures, types, or API contracts pasted directly so the execution agent needn't search
    47|- **Current State Summary** — 2–3 sentences on what has been built that affects this task
    48|- **Watch-Outs** — gotchas, edge cases, or prior decisions that could cause a mistake
    49|- **Reminder** — a closing instruction scoping the execution agent to exactly the current task
    50|
    51|## Example
    52|
    53|For a task "implement the `/users/:id` endpoint":
    54|
    55|- **Read:** `src/routes/users.ts` (route registration pattern), `src/db/user-model.ts` (User type definition)
    56|- **Ignore:** `src/routes/auth.ts` (different domain), `src/utils/logger.ts` (not needed for this endpoint)
    57|- **Inlined contract:** `getUserById(id: string): Promise<User | null>` from the architecture doc
    58|- **State summary:** "Auth middleware is complete. The `/users` list endpoint is live. No user detail route exists yet."
    59|- **Watch-out:** "User IDs are UUIDs, not integers — do not cast to number."
    60|
    61|## Trade-offs
    62|
    63|| Pro | Con |
    64||---|---|
    65|| Keeps execution agent prompts small and focused | Adds an extra LLM call (latency + cost) per task |
    66|| Explicit ignore list prevents plausible-but-wrong file reads | Requires a reliable file index or codebase summary as input |
    67|| Inlined contracts reduce hallucination of interfaces | Context Manager itself can be wrong about what's relevant |
    68|| 400-token output cap enforces discipline | May need tuning per project as codebase grows |
    69|
    70|The hard output cap (400 tokens) is a key design constraint — if the output exceeds it, the agent has loaded too much. This acts as a forcing function for selectivity.
    71|
    72|## Key Rules
    73|
    74|- More context is **not** better — load only what is needed for the specific task
    75|- Never include test files unless the task is writing tests
    76|- Never include files from previous milestones unless they define an interface this task must implement
    77|
    78|## Related Patterns
    79|
    80|- [Pipeline Pattern](../patterns/pattern-pipeline.md) — the Context Manager Agent is a stage in a sequential pipeline
    81|- [Fan-out Worker Pattern](../patterns/pattern-fan-out-worker.md) — context scoping becomes critical when workers run in parallel
    82|- [External Memory Pattern](../patterns/pattern-external-memory.md) — the file index / codebase summary the Context Manager reads is a form of external memory
    83|
    84|## See Also
    85|
    86|- [Context Management](../concepts/context-management.md)
    87|- [Task Decomposition](../concepts/task-decomposition.md)
    88|- [Multi-Agent Systems](../concepts/multi-agent-systems.md)
    89|