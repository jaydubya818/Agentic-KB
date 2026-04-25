---
id: 01KQ2XXQSWCBETAY1GSVCXMQWY
title: "Goal-Backward Planning"
type: pattern
tags: [patterns, agents, workflow, prompting, orchestration]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [agents/workers/gsd-roadmapper/profile.md, concepts/multi-agent-systems.md, concepts/human-in-the-loop.md]
source: my-agents/gsd-roadmapper.md
---

# Goal-Backward Planning

## When to Use

Use goal-backward planning when:
- Decomposing a project or task into phases/milestones
- You need to define *done* before defining *work*
- Forward task-listing has produced plans that don't converge on a clear outcome
- An agent needs success criteria it can verify against, not just a checklist to execute

Especially valuable for solo developer + AI builder workflows where there are no stakeholder reviews to catch drift.

---

## Structure

1. **State the end-state goal** as an outcome for the user, not a task for the builder.
   - ✅ *"Users can securely access their accounts"*
   - ❌ *"Build authentication"*

2. **Derive observable truths** (2–5) — what a user can *see or do* when the goal is achieved.

3. **Map work backward** from those truths to the tasks required to make them true.

4. **Validate coverage** — every requirement must be reachable from at least one observable truth.

---

## Example

**Phase goal:** *Users can securely access their accounts*

**Observable success criteria:**
- User can create an account with email/password
- User can log in and remain logged in across browser sessions
- User can log out from any page
- User can reset a forgotten password via email

**Work is then derived** to satisfy each criterion — not planned speculatively up front.

---

## Trade-offs

| Benefit | Cost |
|---|---|
| Plans are anchored to user value | Requires upfront clarity on outcomes |
| Success criteria are checkable | Can be harder to write for abstract/infra phases |
| Reduces scope creep within a phase | May reveal unclear requirements earlier (good pain) |
| Works well as agent instructions | Agent must resist task-list instincts |

---

## Related Patterns

- [Supervisor-Worker Orchestration](pattern-supervisor-worker.md) — goal-backward criteria are often set by the orchestrator and handed to workers
- [Human-in-the-Loop](../concepts/human-in-the-loop.md) — return the goal-backward plan for approval before execution begins
- [GSD Roadmapper](../agents/workers/gsd-roadmapper/profile.md) — concrete implementation of this pattern for project roadmapping

---

## See Also

- [Agent Loops](../concepts/agent-loops.md)
- [Multi-Agent Systems](../concepts/multi-agent-systems.md)
- [Chain of Thought](../concepts/chain-of-thought.md) — goal-backward reasoning benefits from explicit CoT prompting
