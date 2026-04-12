---
title: Mistake Log
type: pattern
category: memory
problem: Agents repeat the same errors across sessions because corrections live only in the current conversation and are lost on compaction or session end.
solution: Maintain a dedicated append-only mistakes file in the agent's memory store; read it on every session start; write to it immediately when a correction is received.
tradeoffs:
  - pro: Repeat errors decrease over time — corrections persist across sessions
  - pro: Agent can explicitly acknowledge past mistakes before starting similar work
  - pro: Creates an auditable record of agent improvement over time
  - con: Mistakes file can grow large and dilute context if not periodically reviewed/pruned
  - con: Requires agent discipline to log corrections in the moment
tags: [memory, agentic, safety, reflection, context-management]
confidence: medium
sources:
  - [[summaries/summary-layered-agent-memory-obsidian]]
created: 2026-04-12
updated: 2026-04-12
related:
  - [[patterns/pattern-layered-injection-hierarchy]]
  - [[patterns/pattern-episodic-judgment-log]]
  - [[concepts/memory-systems]]
  - [[concepts/agent-failure-modes]]
---

# Pattern: Mistake Log

## Problem
Agents make mistakes. Users correct them. The correction lands in the conversation, gets acknowledged, and is immediately at risk: compaction can wipe it from context, and the next session starts fresh with no memory of the correction.

Result: the agent repeats the same mistake 3 sessions later. The user has to re-correct it. Trust erodes.

## Solution
Maintain a dedicated `mistakes.md` file in the agent's memory store. On correction:
1. Log the mistake immediately in structured format
2. Read `mistakes.md` on every session start before beginning any work
3. When starting a task similar to a past mistake, acknowledge it explicitly

The file is **append-only** — entries are never deleted, only reviewed and optionally summarized.

## Implementation Sketch

```markdown
# mistakes.md

## 2026-04-10
**Task:** Refactored auth module
**Mistake:** Changed function signatures without updating all callers
**Correction:** "You broke the login flow — always check all call sites before renaming functions"
**Lesson:** Run grep for function name before any signature change

---

## 2026-04-08
**Task:** Summarizing research paper
**Mistake:** Included claims from abstract that were contradicted in the methods section
**Correction:** "Don't summarize the abstract — read the full paper"
**Lesson:** Always read methods + results sections, not just abstract
```

```markdown
# Agent System Prompt / CLAUDE.md addition:

## Mistake Log Protocol
- File: {MY_WORKSPACE}/mistakes.md
- READ: On every session start, before any task work
- WRITE: Immediately when user flags an error or says "that's wrong" / "you messed up"
- FORMAT: Date → Task → Mistake → Correction (user's words) → Lesson (my synthesis)
- When starting a task matching a past mistake: acknowledge it first
```

## Trigger Recognition
The agent should recognize correction signals including:
- Direct statements: "that's wrong", "you messed up", "f that, do it this way"
- Implicit corrections: user rewrites the agent's output, user undoes the agent's action
- Repeated corrections: same feedback twice → high priority log entry

## Session Start Protocol
```
1. Read mistakes.md
2. If any entry matches today's planned work → surface it proactively:
   "Before we start: last time I worked on auth, I broke callers by renaming functions.
    I'll grep for all usages before touching any signatures."
3. Proceed with task
```

## Maintenance
- Periodic (monthly or after 20+ entries): summarize recurring patterns into top-level lessons
- Promote persistent lessons to Layer 1 (sticky notes) if they apply to almost every task
- Never delete raw entries — they're the audit trail

## Tradeoffs

| | Pros | Cons |
|--|------|------|
| **Error reduction** | Corrections persist across sessions and compactions | File grows unbounded without pruning |
| **Trust** | Users see agent acknowledge past mistakes | If agent doesn't log, pattern breaks silently |
| **Auditability** | Full history of corrections | Sensitive user criticism stored persistently |
| **Proactive safety** | Agent flags risks before repeating errors | Overly aggressive matching can be annoying |

## Relationship to Episodic Judgment Log
This pattern is narrower than [[patterns/pattern-episodic-judgment-log]]:
- **Episodic Judgment Log** — captures human judgment on *decisions* (what to do, tradeoffs made)
- **Mistake Log** — captures agent *errors* and corrections (what went wrong, how to fix)

They can coexist: mistakes.md is private to each agent; the judgment log may be shared or project-scoped.

## When To Use
- Any agent in a long-running multi-session workflow
- Agents performing high-stakes or irreversible actions (code changes, file edits, deployments)
- When a user has had to correct the same mistake more than once

## When NOT To Use
- Single-session stateless agents (no cross-session persistence needed)
- Agents where corrections are rare and the risk of stale lessons outweighs the benefit

## Real Examples
- The "compounding loop" in this KB benefits from a similar mechanism: contradictions found during ingest are logged in `log.md` so future agents don't repeat the same misunderstanding
- Jay's agent vault corrections should propagate to `mistakes.md` per agent rather than staying in conversation history only

## Related Patterns
- [[patterns/pattern-episodic-judgment-log]] — Broader judgment capture; decisions, not just errors
- [[patterns/pattern-layered-injection-hierarchy]] — mistakes.md lives in Layer 3 (vault); read on session start
- [[patterns/pattern-shared-agent-workspace]] — mistakes.md is private per agent; corrections affecting all agents go to shared user-profile
- [[patterns/pattern-reflection-loop]] — Agent self-evaluation at task end; complements mistake logging
