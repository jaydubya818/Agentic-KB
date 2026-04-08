---
id: 01KNNVX2QYM61TJ8GESARVABXR
title: "Code Generation Agent Pattern"
type: pattern
tags: [agents, patterns, workflow, automation, architecture]
created: 2025-01-30
updated: 2025-01-30
visibility: public
confidence: high
related: [pattern-pipeline, concepts/task-decomposition, concepts/self-critique, concepts/system-prompt-design]
---

# Code Generation Agent Pattern

A single-responsibility agent whose only job is to write production-ready code for one atomic task. It sits downstream of a Context Manager and a Task Breakdown step, and upstream of a Validation Agent. It does not plan, does not redesign, and does not ask clarifying questions about future work.

## When to Use

- You have a multi-agent pipeline where planning and context-loading are handled by earlier agents
- Each task is small and well-scoped (atomic), with explicit acceptance criteria
- You want strict containment: the agent must not drift into refactoring or feature-adding outside its scope
- You need a reliable handoff point to a downstream validation step

## Structure

```
[Task Breakdown Agent] ──► [Context Manager Agent] ──► [Code Generation Agent] ──► [Validation Agent]
        (04)                        (05)                        (06)                      (07)
```

**Inputs required:**
- Context output from Context Manager (which files to read, what to keep in mind)
- Task spec from Task Breakdown (what to build, acceptance criteria, scope)

**Outputs produced:**
- Full file contents for every file modified or created (never diffs)
- A `TASK COMPLETE` summary listing files, acceptance criteria status, and assumptions
- A `BLOCKER` report if a prerequisite is missing or conflicting

## Example

A task spec says: *"Add input validation to the `createUser` endpoint. Accept only strings ≤ 64 chars for `username`. Return 400 on failure."*

The Code Generation Agent:
1. Reads every file listed by the Context Manager before writing
2. Records the acceptance criteria visibly
3. Implements exactly that validation — no other changes
4. Matches existing code style (indentation, naming, error patterns)
5. Self-checks each criterion before finalizing
6. Outputs the full modified file and a TASK COMPLETE block

If the existing error-handling pattern is ambiguous, it emits:
```
## BLOCKER: TASK-042
Problem: Two conflicting error response formats found in codebase
Needed to proceed: Canonical error shape for 4xx responses
Suggested resolution: Standardise on { error: string, code: number } per auth module
```

## Code Quality Standards

| Rule | Detail |
|---|---|
| Production quality | No prototype shortcuts |
| Comments | Only where logic is non-obvious |
| Error handling | Explicit — no silent failures, no bare `except` |
| TODOs | Forbidden unless task spec explicitly allows |
| Assumptions | Document inline: `// ASSUMPTION: [what]` |
| Secrets | Never hardcoded — use config or env vars |

## Hard Limits

The agent must NOT:
- Refactor code outside the task scope
- Add features not in the task spec
- Change file structure beyond what the task requires
- Modify imports in files not listed in context
- Ask "should I also…?" — it completes the task as specified

These hard limits are what make the agent safe to run in an automated pipeline without human review of every step.

## Trade-offs

| Pro | Con |
|---|---|
| Highly predictable, scoped output | Requires well-formed upstream inputs to function |
| Blocker reporting prevents silent failures | Cannot self-recover from missing context |
| No scope creep by design | Will not catch issues outside the task spec |
| Full file output makes diffs easy to review | Verbose output for large files |

## Related Patterns

- [Pipeline Pattern](pattern-pipeline.md) — the broader sequential chain this agent lives inside
- [Fan-Out Worker Pattern](pattern-fan-out-worker.md) — alternative when tasks can be parallelised
- [Confirm Before Destructive Pattern](pattern-confirm-before-destructive.md) — relevant when code changes are high-risk
- [Idempotent Tools Pattern](pattern-idempotent-tools.md) — applies to any file-write operations the agent performs

## See Also

- [Task Decomposition](../concepts/task-decomposition.md)
- [Self-Critique](../concepts/self-critique.md)
- [Agent Failure Modes](../concepts/agent-failure-modes.md)
- [System Prompt Design](../concepts/system-prompt-design.md)
