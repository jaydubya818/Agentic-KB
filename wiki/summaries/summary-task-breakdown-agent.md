---
title: Task Breakdown Agent (Numbered Pipeline)
type: summary
source_file: raw/my-agents/04-task-breakdown-agent.md
author: Jay West
date_ingested: 2026-04-04
tags: [agentic, claude-code, agent-definition, task-decomposition, pipeline, numbered-agents]
key_concepts: [atomic-tasks, numbered-pipeline, acceptance-criteria, scope-boundary, milestone-decomposition]
confidence: high
---

# Task Breakdown Agent (Numbered Pipeline)

## Key Purpose

Part of Jay's older numbered agent pipeline (01–07+). Takes one milestone at a time and produces atomic, unambiguous coding tasks with exact file paths, function signatures, and acceptance criteria. Designed so the downstream Code Generation Agent (06) can execute each task without asking any questions.

## Tools Granted

None specified — this agent is a pure reasoner. It receives planning output and architecture output, and produces structured task definitions. No tool access needed.

## Design Decisions

### The Numbered Pipeline Architecture

This agent is `04` in a sequential pipeline:
```
01-architecture → 02-plan-review → 03-planning → 04-task-breakdown → 05-context-manager → 06-code-generation → 07-task-validation
```

Each agent has a defined handoff phrase ("Ready for Context Manager Agent (05)"). This explicit handoff protocol prevents agents from assuming their output will be consumed — they announce readiness to the next stage.

This contrasts with the GSD agents which use an orchestrator model (a top-level skill spawns named agents). The numbered pipeline is a rigid chain; GSD is a flexible star topology.

### Atomicity Definition

A task is atomic when:
- Touches a predictable, bounded set of files
- Has a single clear outcome
- Can be verified with a specific, runnable check
- Takes one focused session to complete

### Task Specification Requirements

Every task must include: Task ID (M2-T3 format), Title (verb-noun), Files to create/modify (exact paths), What to implement (function signatures/interfaces), What NOT to do (scope boundaries), Acceptance criteria (≤3, specific and testable), Dependencies (prior task IDs).

**Key rule:** "Make it work" is never an acceptance criterion. Criteria must be specific and testable. If a task has more than 3 acceptance criteria, it must be split.

### Ambiguity Handling

"If spec is ambiguous for a task, write a clarification task before the implementation task." Rather than guessing or asking the user, the agent creates a structured clarification task that forces resolution before implementation begins.

### Output Format Reference

Uses `~/.claude/output-formats/task-breakdown-output.md` — an external format file. This separates the agent's reasoning from its output format, allowing the format to evolve without rewriting the agent definition.

## Prompt Patterns Observed

- **Numbered pipeline vs. orchestrator pattern:** The numbered agent set (01–07) represents an earlier, more rigid architecture than the GSD orchestrator model. The numbered set is a fixed chain; GSD agents can be recombined.
- **Handoff announcement pattern:** "Breakdown complete for [milestone]. Ready for Context Manager Agent (05)." The explicit next-agent reference makes the chain traceable.
- **Scope boundary as first-class concern:** "What NOT to do" is a required task field — scope creep prevention is built into the task format, not left to the executor's judgment.
- **Max 3 acceptance criteria rule:** A hard limit prevents task bloat. If you can't verify a task with 3 criteria, you haven't decomposed it far enough.

## Related Concepts

- [[wiki/summaries/summary-gsd-planner]]
- [[wiki/summaries/summary-gsd-executor]]
- [[wiki/personal/personal-agent-design-observations]]

## Sources

- `raw/my-agents/04-task-breakdown-agent.md`
