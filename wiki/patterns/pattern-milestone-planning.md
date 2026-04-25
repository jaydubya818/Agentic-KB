     1|---
     2|id: 01KNNVX2R0DQ8B32F9W5P8YVEC
     3|title: "Milestone-Based Planning Pattern"
     4|type: pattern
     5|tags: [agents, orchestration, workflow, patterns, task-decomposition]
     6|created: 2025-01-30
     7|stale_after_days: 730
updated: 2025-01-30
     8|visibility: public
     9|confidence: high
    10|related: [concepts/task-decomposition.md, patterns/pattern-fan-out-worker.md, patterns/pattern-pipeline.md]
    11|---
    12|
    13|# Milestone-Based Planning Pattern
    14|
    15|A structured approach where an agent translates high-level architecture or design into a sequenced, executable implementation plan organised around independently testable milestones.
    16|
    17|## When to Use
    18|
    19|- When translating an architecture or design document into actionable engineering work
    20|- When a project spans multiple phases and intermediate checkpoints matter
    21|- When multiple downstream agents or humans will execute the resulting tasks
    22|- When you need explicit dependency tracking to avoid blocked work
    23|
    24|## Structure
    25|
    26|1. **Ingest reviewed architecture** — ensure all prior decisions, constraints, and known failure modes are understood before planning begins
    27|2. **Identify the critical path** — determine what must exist before anything else can be built
    28|3. **Group work into milestones** — logical checkpoints where the system is independently runnable or testable
    29|4. **Sequence tasks within milestones** — strict ordering with explicit dependencies stated per task
    30|5. **Estimate complexity** — use relative sizing (S/M/L/XL) rather than wall-clock time
    31|6. **Flag risks** — surface anything with high uncertainty or external dependencies
    32|
    33|### Milestone Rules
    34|
    35|Each milestone must satisfy all of the following:
    36|- Independently testable with a binary success criterion
    37|- Contains no more than ~6 tasks
    38|- Builds directly on the previous milestone
    39|- The **first milestone** is always: get a skeleton running end-to-end with no real business logic
    40|
    41|## Example
    42|
    43|A Planning Agent sitting between an architecture review step and a task breakdown step in a multi-agent pipeline:
    44|
    45|```
    46|[Plan Review Agent (02)]
    47|        ↓
    48|[Planning Agent (03)]  ← produces milestones + task sequences
    49|        ↓
    50|[Task Breakdown Agent (04)]
    51|```
    52|
    53|Each task in the plan references specific files from the architecture, carries an explicit complexity estimate, and lists its dependencies:
    54|
    55|```
    56|Milestone 1: Skeleton end-to-end
    57|  Task 1 — Scaffold project structure (S) → creates: /src/index.ts, /src/config.ts
    58|  Task 2 — Stub API router with health endpoint (S) → requires Task 1 → creates: /src/routes/health.ts
    59|  Task 3 — Wire config loading (M) → requires Task 1 → creates: /src/config/loader.ts
    60|```
    61|
    62|## Trade-offs
    63|
    64|| Upside | Downside |
    65||---|---|
    66|| Clear handoff points between agents or humans | Upfront planning cost before any code is written |
    67|| Explicit dependencies reduce blocked work | Over-rigid sequencing can slow teams that prefer parallel exploration |
    68|| Binary success criteria make progress measurable | Requires a mature architecture input; poor inputs produce poor plans |
    69|| Atomic tasks reduce ambiguity for executors | Sizing estimates (S/M/L/XL) are subjective and may drift |
    70|
    71|### Key Constraints
    72|- No task should be "implement the whole X module" — decompose until tasks are atomic
    73|- Any task rated M or larger is a candidate for splitting
    74|- Every task must map to a specific file or set of files
    75|
    76|## Related Patterns
    77|
    78|- [Task Decomposition](../concepts/task-decomposition.md) — conceptual foundation for breaking work into atomic units
    79|- [Fan-Out Worker Pattern](../patterns/pattern-fan-out-worker.md) — once a plan exists, [[pattern-fan-out-worker]] execution can parallelise independent tasks
    80|- [Pipeline Pattern](../patterns/pattern-pipeline.md) — the planning agent itself fits within a sequential agent pipeline
    81|- [Human-in-the-Loop](../concepts/human-in-the-loop.md) — milestones are natural review gates for human oversight
    82|
    83|## See Also
    84|
    85|- [Multi-Agent Systems](../concepts/multi-agent-systems.md)
    86|- [Agent Failure Modes](../concepts/agent-failure-modes.md)
    87|