---
title: "Pattern: Deviation Rules"
type: pattern
tags: [agents, automation, workflow, patterns, guardrails]
created: 2026-04-07
updated: 2026-04-07
visibility: public
confidence: high
related: [concepts/agent-failure-modes, concepts/guardrails, concepts/human-in-the-loop, frameworks/framework-gsd]
---

# Pattern: Deviation Rules

A structured policy system that governs how an autonomous execution agent handles work that falls outside its explicit plan — without requiring constant user interrupts.

## When to Use

- An execution agent operates on a pre-written plan but will inevitably encounter missing, broken, or under-specified work
- You want maximum autonomy for routine fixes while preserving human oversight for structural decisions
- You need a legible audit trail of everything the agent did beyond the original plan

## Structure

Deviation rules are a tiered policy set, ordered by scope of impact:

```
Rule 1 — Auto-fix bugs           (low impact, no permission)
Rule 2 — Auto-add missing pieces (medium impact, no permission)
Rule 3 — Auto-fix blockers       (task-scoped, no permission)
Rule 4 — Architectural changes   (high impact, ask user)
```

Each rule has:
- A **trigger condition** (what the agent detects)
- A **response action** (what the agent does)
- A **permission level** (autonomous vs. ask)
- A **tracking format** (`[Rule N - Type] description`) written to a summary/log

The shared execution process for autonomous rules (1–3):
1. Fix inline within the current task
2. Add/update tests if applicable
3. Verify the fix
4. Continue the original task
5. Record the deviation

## Example

From the GSD framework:

| Rule | Trigger Examples | Response |
|---|---|---|
| **Rule 1: Auto-fix bugs** | Wrong query, logic error, null pointer, race condition | Fix and continue |
| **Rule 2: Auto-add critical functionality** | Missing auth on route, no input validation, no rate limiting, missing DB index | Add and continue |
| **Rule 3: Auto-fix blockers** | Missing dependency, broken import, missing env var | Fix and continue |
| **Rule 4: Architectural changes** | New DB table, switching frameworks, changing auth model | Pause, ask user |

Deviations surface in `SUMMARY.md` as:
```
[Rule 2 - Security] Added CSRF protection to /api/transfer — was missing from plan
[Rule 3 - Blocker] Installed missing `zod` dependency before task 3
```

## Trade-offs

**Advantages:**
- Dramatically reduces unnecessary user interrupts for routine issues
- Creates a clear, queryable audit trail of autonomous decisions
- Escalation boundary (Rule 4) prevents the agent from making structural mistakes silently
- Rules are composable — projects can add domain-specific rules (e.g. "always enforce CLAUDE.md conventions")

**Risks:**
- Rules 1–3 grant meaningful autonomy; in sensitive codebases this may be too permissive without additional constraints
- "Critical functionality" (Rule 2) is subjective — the agent must judge what is essential vs. nice-to-have
- Deviations accumulate context; very long plans may produce summaries that are hard to review
- Rule 4's architectural boundary must be well-defined; ambiguous cases may be incorrectly auto-fixed under Rule 1–3

## Related Patterns

- [Confirm Before Destructive](pattern-confirm-before-destructive.md) — complements Rule 4 for high-risk operations
- [Adversarial Plan Review](pattern-adversarial-plan-review.md) — catches plan gaps before execution begins, reducing deviation frequency
- [Clarification Task](pattern-clarification-task.md) — an alternative strategy: ask upfront rather than deviate inline

## See Also

- [GSD Framework](../frameworks/framework-gsd.md)
- [Guardrails](../concepts/guardrails.md)
- [Human-in-the-Loop](../concepts/human-in-the-loop.md)
- [Agent Failure Modes](../concepts/agent-failure-modes.md)
