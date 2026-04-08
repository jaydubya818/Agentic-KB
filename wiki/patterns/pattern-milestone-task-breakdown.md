---
id: 01KNNVX2R143CA3SEQ5Z6TTSPS
title: "Pattern: Milestone → Task Breakdown"
type: pattern
tags: [patterns, agents, orchestration, workflow, architecture]
created: 2026-04-07
updated: 2026-04-07
visibility: public
confidence: high
related: [concepts/task-decomposition, pattern-pipeline, pattern-fan-out-worker, concepts/agent-failure-modes, concepts/system-prompt-design]
source: my-agents/04-task-breakdown-agent.md
---

# Pattern: Milestone → Task Breakdown

## When to Use

Use this pattern when:
- You have a multi-milestone project plan and need to drive execution with a code generation agent
- Tasks need to be precise enough that no clarifying questions are required during execution
- You need verifiable, dependency-ordered work units that can be tracked and reviewed
- You want to decouple planning from execution — enabling different agents (or humans) to handle each phase

This pattern is especially valuable in automated software development pipelines where ambiguity at execution time causes hard-to-debug failures.

## Structure

```
[Planning Output]     ──┐
[Architecture Output] ──┼──▶ [Task Breakdown Agent] ──▶ [Atomic Task List]
[Target Milestone]    ──┘                                      │
                                                               ▼
                                                   [Code Generation Agent]
                                                               │
                                                               ▼
                                                   [Context Manager Agent]
```

**Inputs to the Task Breakdown Agent:**
- Full planning output (for project-level context)
- Architecture output (for exact file paths and API contracts)
- A single, specific milestone to break down (one at a time)

**Output:**
- An ordered list of atomic tasks with IDs, titles, file paths, implementation specs, scope exclusions, acceptance criteria, and dependencies

## Example

For a milestone "Implement authentication service":

```
M3-T1: Define AuthService interface
  Files: src/services/auth-service.interface.ts
  Implements: login(email, password): Promise<AuthToken>
              logout(token: string): Promise<void>
  Not: implementation, middleware
  Criteria:
    1. Interface exported from module index
    2. TypeScript compiles with zero errors
  Depends: none

M3-T2: Implement JWTAuthService
  Files: src/services/jwt-auth-service.ts
  Implements: JWTAuthService class satisfying AuthService interface
  Not: refresh tokens, OAuth, rate limiting
  Criteria:
    1. login() returns signed JWT on valid credentials
    2. login() throws AuthError on invalid credentials
    3. logout() invalidates token in store
  Depends: M3-T1
```

If a spec element is ambiguous, the agent inserts a **clarification task** before the implementation task:

```
M3-T1-CLARIFY: Confirm token expiry policy
  Question: Should JWT tokens expire after 1h (stateless) or be stored for manual revocation?
  Blocking: M3-T2
```

## Trade-offs

| Benefit | Cost |
|---|---|
| Eliminates clarifying interruptions during execution | Requires high-quality planning and architecture inputs |
| Produces auditable, reviewable task records | Upfront decomposition takes time/tokens |
| Enables dependency-aware parallelism | Rigid task IDs require re-numbering if plan changes |
| Scope boundaries prevent feature creep | "What NOT to do" requires careful authoring |

## Rules

1. **One milestone at a time** — do not break down multiple milestones in one pass
2. **File paths must match architecture output exactly** — no informal names
3. **Function signatures must match API contracts** — no improvisation
4. **Max 3 acceptance criteria per task** — if more are needed, split the task
5. **Clarification tasks before ambiguous implementation tasks** — never assume
6. **"Make it work" is never an acceptance criterion** — criteria must be specific and runnable

## Related Patterns

- [Pattern: Pipeline](../patterns/pattern-pipeline.md) — this pattern is a stage within a sequential agent pipeline
- [Pattern: Fan-Out Worker](../patterns/pattern-fan-out-worker.md) — tasks output here can be fanned out for parallel execution
- [Pattern: Confirm Before Destructive](../patterns/pattern-confirm-before-destructive.md) — clarification tasks embody the same philosophy

## See Also

- [Task Decomposition](../concepts/task-decomposition.md)
- [Agent Failure Modes](../concepts/agent-failure-modes.md)
- [System Prompt Design](../concepts/system-prompt-design.md)
- [Human in the Loop](../concepts/human-in-the-loop.md)
