---
title: Shared Agent Workspace
type: pattern
category: memory
problem: Multiple agents working on related tasks duplicate context, drift out of sync, and can't hand off work without manual re-briefing.
solution: Maintain a dedicated filesystem directory that all agents can read and write, containing shared project state, user profile, and decision history.
tradeoffs:
  - pro: Agents share context without human re-briefing
  - pro: Work started in one agent can be immediately resumed in another
  - pro: User profile and corrections accumulate in one place, benefiting all agents
  - con: Concurrent writes from multiple agents can cause conflicts
  - con: Shared writes require agents to follow consistent file structure
tags: [memory, multi-agent, agentic, context-management, state-management]
confidence: medium
sources:
  - [[summaries/summary-layered-agent-memory-obsidian]]
created: 2026-04-12
updated: 2026-04-12
related:
  - [[patterns/pattern-tiered-agent-memory]]
  - [[patterns/pattern-layered-injection-hierarchy]]
  - [[concepts/multi-agent-systems]]
  - [[concepts/memory-systems]]
---

# Pattern: Shared Agent Workspace

## Problem
In a multi-agent system, each agent typically maintains its own context — its working state, session history, and understanding of the user. When tasks span agents (e.g., Agent A drafts a script, Agent B needs to continue it), the receiving agent has no context, forcing the user to re-brief or agents to re-read long session histories.

The deeper problem: agents also can't *correct* each other or build on each other's work without a shared substrate.

## Solution
Create a **shared filesystem directory** that all agents can read from and write to. Separate it into:
- A **shared zone** — files all agents read and write
- **Per-agent zones** — private working files each agent owns

```
Agent-Shared/               ← all agents read/write
  user-profile.md           ← user identity, preferences, corrections
  project-state.md          ← all active projects and status
  decisions-log.md          ← shared decision history

Agent-Alice/                ← Alice's private workspace
  working-context.md        ← Alice's current task and state
  mistakes.md               ← corrections Alice has received
  daily/                    ← Alice's daily logs (YYYY-MM-DD.md)

Agent-Bob/                  ← Bob's private workspace
  working-context.md
  mistakes.md
  daily/
```

Agents read the shared zone on every session start. They write to their own zone only — never to another agent's zone. The shared zone is updated by any agent when user-level information changes.

## Implementation Sketch

```markdown
# In each agent's system prompt / CLAUDE.md:

## Memory Protocol
SHARED_WORKSPACE=/path/to/Agent-Shared
MY_WORKSPACE=/path/to/Agent-{MyName}

### On session start, READ:
1. {SHARED_WORKSPACE}/user-profile.md
2. {SHARED_WORKSPACE}/project-state.md
3. {MY_WORKSPACE}/working-context.md
4. {MY_WORKSPACE}/daily/{today}.md

### Write triggers:
- User correction → append to {MY_WORKSPACE}/mistakes.md AND update {SHARED_WORKSPACE}/user-profile.md if it's a preference
- Task start → update {MY_WORKSPACE}/working-context.md
- Project status change → update {SHARED_WORKSPACE}/project-state.md
- Session end → flush to {MY_WORKSPACE}/daily/{today}.md
```

## Handoff Protocol
When resuming work across agents, the receiving agent:
1. Reads `Agent-Shared/project-state.md` to find the project
2. Reads the originating agent's `daily/` log for recent context
3. Does NOT need to be re-briefed by the user

```
User: "Hey, let's continue that YouTube script Hermes was working on."
Agent reads: Agent-Shared/project-state.md → finds "YouTube Script: In Progress"
Agent reads: Agent-Hermes/daily/2026-04-11.md → finds script outline and last edits
Agent: "I see Hermes got through the intro and hook. Let's pick up from the structure section."
```

## Tradeoffs

| | Pros | Cons |
|--|------|------|
| **Context sharing** | Zero re-briefing for cross-agent handoffs | Agents must follow consistent file format |
| **Accumulation** | User corrections benefit all agents | Shared zone can become stale if agents skip writes |
| **Separation** | Each agent has private workspace | Two agents working simultaneously need write coordination |
| **Simplicity** | Plain markdown files, no infra required | No locking mechanism — concurrent writes can corrupt |

## Conflict Avoidance
Since agents can't coordinate locks easily:
- **Private zones** are owned exclusively — only the named agent writes to them
- **Shared zone** uses **append-only** files where possible (`decisions-log.md`)
- Files that get overwritten (`project-state.md`) should be updated atomically by one agent at a time
- When in doubt, agents write to their private zone and the user or a coordinator promotes updates to shared

## When To Use
- ≥2 agents working on overlapping projects or with the same user
- Long-running projects that span multiple agents or sessions
- Any setup where "hand off to another agent" is a regular workflow
- When user corrections should benefit all agents automatically

## When NOT To Use
- Single-agent systems (unnecessary overhead)
- Stateless agents with no cross-session continuity needs
- Agents with conflicting write access and no coordination mechanism

## Relationship to Existing Patterns
This pattern adds **lateral (peer-to-peer) memory sharing** to complement the **vertical (tier-based) memory promotion** in [[patterns/pattern-tiered-agent-memory]]. They compose naturally:
- Tiered memory = knowledge flowing up through orchestrator → lead → worker
- Shared workspace = knowledge flowing laterally across agents at the same level

## Real Examples
- This KB's `wiki/` directory is effectively a shared workspace: any agent with KB access reads/writes the same wiki
- Jay's agent vault (`~/.claude/vault/`) with per-agent context blocks serves a similar role at the system level

## Related Patterns
- [[patterns/pattern-tiered-agent-memory]] — Vertical knowledge promotion pipeline
- [[patterns/pattern-layered-injection-hierarchy]] — How agents load this workspace into context
- [[patterns/pattern-mistake-log]] — Per-agent private zone file for error tracking
- [[patterns/pattern-compounding-loop]] — Shared workspace supports cross-agent knowledge compounding
