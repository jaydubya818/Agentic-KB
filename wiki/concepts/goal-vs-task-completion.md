---
id: 01KQ2Y580AYFFG416VTY57HHWK
title: "Goal vs Task Completion"
type: concept
tags: [agents, workflow, evaluation, patterns]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [agent-failure-modes, human-in-the-loop, llm-as-judge]
source: my-agents/gsd-verifier.md
---

# Goal vs Task Completion

## Definition

**Task completion** means a discrete unit of work was performed — a file was created, a function was written, a step was checked off. **Goal achievement** means the intended outcome is real, functional, and integrated.

These are not the same thing, and conflating them is a common failure mode in agentic systems.

## Why It Matters

LLM agents operating in multi-step workflows tend to report success when tasks are marked done, regardless of whether the underlying goal was met. A task `implement login` can be "complete" while the login form has no backend binding, returns no errors, and accepts any password.

This gap appears because:
- **Agents optimise for task closure**, not outcome quality
- **Summaries document intent**, not verified reality
- **Downstream agents inherit false assumptions** from upstream summaries

In the GSD framework, this is addressed explicitly:

> Task completion ≠ Goal achievement. A task `create chat component` can be marked complete when the component is a placeholder. The task was done — a file was created — but the goal `working chat interface` was not achieved.

## Goal-Backward Verification

The antidote is **goal-backward verification**: start from the desired outcome and work backwards through what must be true, what must exist, and what must be wired for that outcome to hold.

| Level | Question |
|---|---|
| Truth | What must be true for the goal to be achieved? |
| Existence | What artifacts must exist for those truths to hold? |
| Wiring | What connections must be live for those artifacts to function? |

Each level is verified against the actual codebase — not against summaries or task logs.

## Example

**Goal:** Working chat interface

| Level | Must-Have | How to Verify |
|---|---|---|
| Truth | User can send a message | Send a test message, receive a response |
| Existence | `Chat.tsx`, `api/chat` route | File exists, route registered |
| Wiring | `Chat.tsx` calls `api/chat` | `fetch('/api/chat')` present in component |

All three levels must pass. A stub file satisfies Existence but not Truth or Wiring.

## Common Pitfalls

- **Trusting SUMMARY.md** — Summaries describe intent, not verified state
- **Checking existence, not substance** — A file with `// TODO` is not an implementation
- **Missing integration checks** — A component that exists but is never rendered is not wired
- **Over-relying on task lists** — Task completion is a necessary but not sufficient signal

## See Also

- [Agent Failure Modes](agent-failure-modes.md)
- [LLM as Judge](llm-as-judge.md)
- [Human in the Loop](human-in-the-loop.md)
- [GSD Verifier Agent](../agents/workers/gsd-verifier/profile.md)
