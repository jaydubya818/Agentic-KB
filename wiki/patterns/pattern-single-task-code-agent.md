---
title: "Single-Task Code Generation Agent"
type: pattern
tags: [agents, patterns, workflow, automation, architecture]
created: 2025-01-27
updated: 2025-01-27
visibility: public
confidence: high
related: [pattern-pipeline, concepts/task-decomposition, concepts/self-critique, concepts/system-prompt-design]
---

# Single-Task Code Generation Agent

A tightly scoped agent that implements exactly one atomic task — no planning, no redesign, no scope creep. Receives context and a task spec as inputs; outputs complete file contents and a structured completion report.

## When to Use

- Inside a multi-step pipeline where planning and context-loading have already happened upstream (e.g. after a Task Breakdown agent and a Context Manager agent)
- When you need deterministic, reviewable code output with explicit acceptance-criteria verification
- When you want to prevent scope creep by design — the agent is constitutionally forbidden from doing anything outside its task spec
- As the "write" step in a plan → context → write → validate pipeline

## Structure

```
[Task Spec] ──┐
              ├──▶ Code Generation Agent ──▶ [File outputs + TASK COMPLETE report] ──▶ Validation Agent
[Context]  ──┘
```

**Inputs required:**
1. Context output — list of files to read, relevant prior art, constraints
2. Task spec — what to build, acceptance criteria, scope boundaries

**Outputs produced:**
1. Full file contents for every file created or modified (never diffs)
2. A structured `TASK COMPLETE` block listing files changed, criteria met, and assumptions made
3. If blocked: a `BLOCKER` report with problem description and suggested resolution

## Example

A pipeline agent first breaks a feature request into atomic tasks. Task #3 is "add input validation to `api/users.py`". The Context Manager loads the relevant files. The Code Generation Agent receives:
- Context: `api/users.py`, `models/user.py`, `tests/test_users.py` (to read, not modify)
- Spec: validate email format on POST /users, raise 400 with structured error, acceptance criteria: unit test passes, no changes to schema

The agent reads all listed files first, writes down the acceptance criteria, implements only the validation logic, matches existing code style, and self-checks each criterion before outputting the full file and a `TASK COMPLETE` summary.

## Code Quality Standards

The agent enforces these rules on its output:

- **Production quality** — not prototype quality; no TODOs unless the spec permits them
- **Explicit error handling** — no silent failures, no bare `except` blocks
- **No hardcoded secrets, ports, or hostnames** — config or environment variables only
- **Documented assumptions** — any inference is annotated inline: `// ASSUMPTION: [what was assumed]`
- **Style matching** — indentation, naming conventions, comment density from existing codebase
- **Comments only where logic is non-obvious** — no over-commenting

## Hard Limits (Constitutional Constraints)

The agent is explicitly prohibited from:
- Refactoring code outside task scope
- Adding features not in the spec
- Changing file structure beyond what the task requires
- Modifying imports in files not listed in context
- Asking "should I also…?" — it completes the task and hands off

## Blocker Handling

If the agent cannot proceed without guessing at a critical unknown, it stops and emits a structured blocker report rather than hallucinating a solution:

```
## BLOCKER: [Task ID]
Problem: [what is missing or conflicting]
Needed to proceed: [required information or prerequisite]
Suggested resolution: [best guess at the right fix]
```

This surfaces blockers for human review rather than producing silently wrong code.

## Trade-offs

| Pro | Con |
|---|---|
| Scope creep is structurally impossible | Requires well-formed upstream task specs — garbage in, garbage out |
| Acceptance-criteria checklist makes validation mechanical | Agent cannot adapt if task spec is ambiguous — it blocks rather than infers |
| Full file output (not diffs) is unambiguous and reviewable | Full file output can be verbose for large files |
| Assumption documentation reduces silent errors | More tokens spent on structured output |

## Related Patterns

- [Pipeline Pattern](../patterns/pattern-pipeline.md) — this agent is typically one stage in a pipeline
- [Fan-Out Worker Pattern](../patterns/pattern-fan-out-worker.md) — multiple code agents can run in parallel on independent tasks
- [Confirm Before Destructive](../patterns/pattern-confirm-before-destructive.md) — complements this pattern when file deletions are in scope

## See Also

- [Task Decomposition](../concepts/task-decomposition.md)
- [Self-Critique](../concepts/self-critique.md)
- [System Prompt Design](../concepts/system-prompt-design.md)
- [Sandboxed Execution](../concepts/sandboxed-execution.md)
