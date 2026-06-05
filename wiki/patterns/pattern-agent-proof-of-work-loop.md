---
title: Agent Proof-of-Work Loop
type: pattern
category: evaluation
problem: Agents create review debt when they complete work without proving output quality or surfacing exceptions.
solution: Close every agent workflow with verification, receipts, exception review, and a learning update before declaring completion.
tradeoffs:
  - Adds small overhead to every workflow
  - Requires clear Definition of Done before execution
  - Prevents false completion and reduces human babysitting
  - Produces audit artifacts useful for later automation
  - Can become bureaucratic if applied to trivial one-shot tasks
tags: [agentic, evaluation, observability, human-in-the-loop, orchestration, receipts]
confidence: medium
sources:
  - "https://x.com/ericosiu/status/2059725468832604661"
  - "https://x.com/EXM7777/status/2060736517564477901"
  - "Obsidian: 08 - Resources/2026-05-30 Apple Notes Hermes Obsidian Link Review.md"
created: 2026-05-30
updated: 2026-05-30
---

# Agent Proof-of-Work Loop

## Problem

Agents often move work from creation into inspection instead of removing work. The weak loop is:

1. Human prompts agent.
2. Agent does task.
3. Agent says “done.”
4. Human checks everything.

That is not automation. It is review debt with better vibes.

The recurring failure modes are familiar:

- “I researched it” but the source is stale.
- “I drafted it” but constraints were ignored.
- “I posted it” but formatting or links are wrong.
- “I fixed it” but no original symptom was re-tested.
- “I ran the workflow” but no one can tell what changed.

## Solution

Require agents to leave proof of work before completion claims.

Closed loop:

1. Prompt includes goal, constraints, and success criteria.
2. Agent executes using tools/data/instructions.
3. Agent verifies output against the requirement.
4. Agent leaves receipts: files changed, commands run, outputs, links, screenshots, logs, exclusions, and residual risks.
5. Human reviews exceptions only, not every artifact.
6. System captures the learning as a skill, memory, test, rule, or workflow update.

## Implementation Sketch

```text
Input packet:
  goal:
  constraints:
  definition_of_done:
  allowed_tools:
  output_location:
  required_receipts:

Run:
  execute_task()
  verify_task()
  write_review_packet()

Review packet:
  changed:
  output:
  verified_by:
  exceptions:
  next_action:
  learning_update:
```

Minimum review questions:

1. What changed?
2. Where is the output?
3. How was it verified?
4. Who needs to review it?
5. What should happen next time?

## Tradeoffs

| Upside | Cost |
|---|---|
| Reduces false completion | Adds verification overhead |
| Makes human review exception-based | Requires clear success criteria |
| Creates durable audit trail | Needs artifact discipline |
| Turns failures into tests/skills | Can feel heavy for tiny tasks |
| Improves trust in long-running automation | Requires agents to know how to verify |

## When To Use

Use this when:

- Work has external side effects.
- A human would otherwise inspect everything.
- The output will be reused or published.
- The task spans multiple tools, repos, files, or agents.
- Long-running work needs auditability.
- You need the system to improve after failures.

## When NOT To Use

Do not over-apply when:

- The task is a trivial one-shot lookup.
- The user explicitly wants a rough brainstorm.
- Verification is impossible and the output is clearly labeled as speculative.
- The cost of receipts exceeds the risk of error.

## Real Examples

Jay’s Hermes setup already uses several pieces of this pattern:

- `verification-before-completion` skill enforces fresh verification evidence before success claims.
- Hermes/MissionControl separates lifecycle authority from worker events.
- Kanban/MissionControl runs can store tasks, events, artifacts, logs, and approvals.
- Obsidian review notes can preserve source links, decisions, and residual follow-ups.

The 2026-05-30 Apple Notes link review applied the pattern by exporting source notes, extracting links, reading source text/articles, updating config, writing a vault report, patching relevant operating notes, and verifying changed files.

## Related Patterns

- [[concepts/trajectory-evaluation]]
- [[concepts/human-in-the-loop]]
- [[concepts/agent-failure-modes]]
- [[patterns/pattern-compounding-loop]]
- [[patterns/pattern-staged-llm-pipeline]]
- [[mocs/evaluation]]
- [[mocs/orchestration]]
