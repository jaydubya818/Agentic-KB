---
id: 01KNNVX2RDMR1A018NGDJDDZ4Y
title: GSD Executor Agent
type: summary
source_file: raw/my-agents/gsd-executor.md
author: Jay West
date_ingested: 2026-04-04
tags: [agentic, claude-code, agent-definition, gsd, execution, tdd, checkpoints]
key_concepts: [plan-execute-verify, deviation-rules, checkpoint-protocol, tdd-execution, atomic-commits, state-management]
confidence: high
---

# GSD Executor Agent

## Key Purpose

The executor is the worker agent in GSD's Plan-Execute-Verify triad. It receives a PLAN.md file and executes it atomically: each task gets its own commit, deviations are handled by predefined rules without asking the user, and every run ends with a SUMMARY.md and STATE.md update. Spawned by `/gsd:execute-phase`.

## Tools Granted

`Read, Write, Edit, Bash, Grep, Glob` — `permissionMode: acceptEdits`. No web access, no Agent spawning. Color: yellow. The restricted tool set is intentional: the executor writes code and commits, but cannot go sideways by fetching external docs or spinning sub-agents.

## Design Decisions

### Deviation Rules (The Core Innovation)

Rather than stopping to ask the user every time something unexpected is found, the executor has four numbered rules applied in priority order:

| Rule | Trigger | Action |
|------|---------|--------|
| Rule 1 | Bug found in code | Auto-fix inline |
| Rule 2 | Missing critical functionality (auth, validation, error handling) | Auto-add |
| Rule 3 | Blocking issue preventing task completion | Auto-fix |
| Rule 4 | Architectural change required (new table, framework swap) | STOP — return checkpoint |

Rules 1–3 require no user permission. Rule 4 always pauses. The key insight: what counts as "architectural" is tightly defined — adding a column is Rule 1/2, adding a table is Rule 4.

**Fix attempt limit:** After 3 auto-fix attempts on a single task, the executor stops trying, documents in SUMMARY.md under "Deferred Issues", and moves to the next task. This prevents infinite fix loops.

### Three Execution Patterns

- **Pattern A (Fully autonomous):** No checkpoints in plan — run all tasks, commit, write SUMMARY.
- **Pattern B (Has checkpoints):** Execute until a checkpoint task is hit, STOP immediately, return structured message. A fresh agent will be spawned — the current agent does NOT resume.
- **Pattern C (Continuation):** Spawned as a continuation agent after a human checkpoint. Verifies previous commits exist, skips already-done tasks, resumes from specified point.

### TDD Execution Flow

When a task carries `tdd="true"`, the executor follows strict Red-Green-Refactor with separate commits at each stage: `test(...)` commit when RED, `feat(...)` commit when GREEN, `refactor(...)` commit only if cleanup was needed.

### Analysis Paralysis Guard

If the executor makes 5+ consecutive Read/Grep/Glob calls without any Edit/Write/Bash action, it must stop and either write code or report "blocked." This prevents the classic LLM trap of endless reading instead of acting.

### Commit Protocol

- Never `git add .` or `git add -A` — stage individual files only
- Commit type follows conventional commits: `feat`, `fix`, `test`, `refactor`, `chore`
- Multi-repo projects use a `commit-to-subrepo` tool that routes files to their correct sub-repo
- After every commit, check `git status` for untracked files and either commit or `.gitignore` them

### Self-Check Before Proceeding

After writing SUMMARY.md, the executor verifies its own claims: checks files actually exist, checks commit hashes appear in git log. Appends `## Self-Check: PASSED` or `## Self-Check: FAILED` to SUMMARY. If failed, does not proceed to STATE updates.

### Auth Gates

Auth errors during `type="auto"` tasks are not bugs — they're gates. The executor recognizes patterns like "401", "Not authenticated", "run {tool} login" and returns a `checkpoint:human-action` message with exact steps rather than treating it as a failure.

### Auto-Mode

If `workflow.auto_advance = true` in GSD config, human-verify checkpoints are auto-approved and decision checkpoints auto-select the first option. Only `checkpoint:human-action` (true manual steps like 2FA codes) always stops regardless.

## Prompt Patterns Observed

- **Mandatory Initial Read:** `<files_to_read>` block in prompt forces file loading before any other action — prevents executor from starting blind.
- **XML section structure:** Role, execution_flow, deviation_rules, checkpoint_protocol, etc. are all separate XML sections. This makes the prompt modular and easier to update individual behaviors.
- **Forbidden file creation pattern:** "ALWAYS use the Write tool — never use `Bash(cat << 'EOF')`" appears in multiple sections. Repeated emphasis suggests this was a real failure mode.
- **Template references:** Uses `@~/.claude/...` references for SUMMARY template, checkpoints reference doc — keeps the agent prompt lean by externalizing detail.

## Related Concepts

- [[patterns/pattern-plan-execute-verify]]
- [[patterns/pattern-checkpoint-protocol]]
- [[wiki/summaries/summary-gsd-planner]]
- [[wiki/summaries/summary-gsd-verifier]]

## Sources

- `raw/my-agents/gsd-executor.md`
