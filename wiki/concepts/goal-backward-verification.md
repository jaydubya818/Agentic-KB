---
id: 01KQ2XQ2PGTZXEH89SMVKDX24C
title: "Goal-Backward Verification"
type: concept
tags: [agents, orchestration, workflow, patterns, evaluation]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [pattern-supervisor-worker, agent-failure-modes, context-management]
---

# Goal-Backward Verification

## Definition

Goal-backward verification is a quality-checking methodology that starts from the desired *outcome* and works backwards to determine whether a plan or implementation actually achieves it. Rather than asking "is the plan complete?", it asks "will this plan deliver the goal?"

The key insight: **plan completeness ≠ goal achievement**. A plan can have every task filled in and still fail to achieve the phase goal if key requirements have no tasks, tasks don't actually address requirements, or artifacts are created in isolation without being wired together.

## Why It Matters

Agents and human planners alike are prone to *task-level thinking* — listing plausible actions without verifying they collectively produce the intended outcome. Goal-backward verification catches this class of failure *before* execution burns context or produces unusable output.

Two distinct verification timings exist:

| Timing | Subject | Question |
|---|---|---|
| **Pre-execution** (plan checker) | The plan itself | Will this plan achieve the goal? |
| **Post-execution** (verifier) | The implemented code/artifacts | Did execution achieve the goal? |

Same methodology, different subjects. Both are necessary in a robust agent workflow.

## The Four Verification Questions

1. **Requirement coverage** — Does every phase requirement have at least one task addressing it?
2. **Task completeness** — For each covering task, are the file, action, verify, and done fields complete and coherent?
3. **Artifact wiring** — Are outputs of one task consumed as inputs by downstream tasks, or are they created in isolation?
4. **Context budget** — Will the full execution plan fit within the model's context window without quality degradation?

## Example

Phase goal: *"Implement secure user authentication."*

A plan that includes `create auth endpoint` but omits password hashing, session expiry, and CSRF protection has tasks present but will not achieve the goal. Goal-backward verification surfaces this by starting from the goal ("what must be TRUE for secure auth to exist?") and verifying each truth has coverage.

## Common Pitfalls

- **Circular dependencies** — Task B depends on Task A, which depends on Task B.
- **Scope creep** — Plans that include deferred or out-of-scope items waste context and blur the phase goal.
- **Context contradiction** — Plans that contradict locked decisions from earlier discussion phases (e.g. a `CONTEXT.md` decisions section).
- **Isolated artifact creation** — Files are created but never imported, registered, or connected to the system.

## See Also

- [Agent Failure Modes](../concepts/agent-failure-modes.md)
- [Context Management](../concepts/context-management.md)
- [Multi-Agent Systems](../concepts/multi-agent-systems.md)
- [Human-in-the-Loop](../concepts/human-in-the-loop.md)
