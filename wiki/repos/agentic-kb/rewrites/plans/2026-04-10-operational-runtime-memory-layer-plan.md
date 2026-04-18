---
title: Operational Runtime Memory Layer Plan
type: repo-plan
repo_name: agentic-kb
owner: planning-agent
status: proposed
created: 2026-04-10
updated: 2026-04-10
tags: [plan, agent-memory, runtime, context-management, memory]
related:
  - [[repos/agentic-kb/canonical/IMPLEMENTATION_PLAN]]
  - [[patterns/pattern-tiered-agent-memory]]
  - [[summaries/vault-3tier-architecture]]
---

# Operational Runtime Memory Layer Plan

## What problem this solves

Agentic-KB already has a working runtime in `lib/agent-runtime/`, but it still behaves more like a strong foundation than a finished operational memory layer. The main gaps are:

1. **No first-class active task state.** `working` memory is mostly inferred from `task-log.md`, which is good for history but weak for live task-local state, resumability, and mid-task recovery.
2. **Scoped loading is useful but still coarse.** `context-loader.mjs` supports tier, class, path, and bus subscription scoping, but it does not yet give us required-vs-optional context, freshness rules, or per-class caps.
3. **Writeback is not fully transactional across all outputs.** `closeTask()` guards planned file writes first, but bus publications happen after local commits, so a partial close is still possible.
4. **Promotion rules are not contract-driven enough.** `promoteLearning()` and `mergeRewrite()` work, but routing, approver policy, dedupe, and merge targets are still mostly caller responsibility.

If we leave it here, agents will accumulate useful files but still feel operationally brittle. For a shippable V1 memory layer, active task state, context loading, promotions, and writeback need to behave like one coherent system.

## What we should do

Build this in five phases, keeping the current runtime and hardening it rather than replacing it.

### Phase 1: Introduce first-class task-local state

**Goal:** Give every active task its own bounded runtime memory instead of overloading `task-log.md`.

**Deliverables**

- Add a task-scoped working-memory file layout:
  - `wiki/agents/{tier}/{id}/working-memory/{task_id}.md`
  - `wiki/agents/{tier}/{id}/active-task.md`
- Add runtime APIs:
  - `startTask(agent, payload)`
  - `appendTaskState(agent, taskId, entry)`
  - `closeTask(agent, taskId, payload)`
  - `abandonTask(agent, taskId, reason)`
- Extend memory class handling so `working` clearly covers:
  - active scratch state
  - append-only execution log
  - task completion summary
- Require `task_id`, `project`, and `status` metadata for active working-memory artifacts.

**Files likely touched**

- `lib/agent-runtime/memory-classes.mjs`
- `lib/agent-runtime/writeback.mjs`
- `lib/agent-runtime/index.mjs`
- `tests/agents/runtime.test.mjs`
- `config/agents/*.yaml`

**Why first**

This is the missing spine. Without task-local state, scoped loading and writeback rules stay fuzzy because the runtime has no canonical notion of "the active thing the agent is working on right now."

### Phase 2: Upgrade scoped context loading

**Goal:** Make context selection predictable, budget-aware, and safe under real task pressure.

**Deliverables**

- Extend `context_policy` contract schema with:
  - `required: true|false`
  - `max_bytes`
  - `max_items`
  - `freshness_days`
  - `when` conditions keyed by task status, project, or domain
  - `include_task_local: true`
- Load order should become explicit:
  1. active task-local state
  2. agent profile
  3. agent hot memory
  4. project documents
  5. subscribed bus items
  6. learned memory and standards
- Add trace reasons for:
  - excluded due to budget
  - excluded due to staleness
  - excluded due to conditional mismatch
  - excluded due to per-class cap
- Add a contract validation rule that rejects policies which can never fit inside `budget_bytes`.

**Files likely touched**

- `wiki/system/schemas/agent-contract.schema.json`
- `lib/agent-runtime/context-loader.mjs`
- `lib/agent-runtime/contracts.mjs`
- `config/agents/*.yaml`
- `tests/agents/runtime.test.mjs`

**Why this approach**

The simplest correct model is still file-based, but the loader needs stronger semantics so agents reliably see the right context without silently drifting into over-read or under-read behavior.

### Phase 3: Make writeback truly atomic

**Goal:** `closeTask()` should either commit the full task outcome or commit nothing.

**Deliverables**

- Convert `closeTask()` into a staged transaction:
  - plan file writes
  - plan bus publications
  - guard all actions
  - stage all artifacts in temp paths
  - commit via atomic rename
  - abort all on any rejection
- Add `dryRunCloseTask()` to show the full write plan before execution.
- Treat discovery/escalation publications as part of the same transaction, not a best-effort follow-up.
- Add writeback rules to contracts:
  - allowed write targets by memory class
  - required end-of-task outputs
  - optional outputs
  - forbidden write combinations
- Add repair tooling for interrupted transactions.

**Files likely touched**

- `lib/agent-runtime/writeback.mjs`
- `lib/agent-runtime/bus.mjs`
- `lib/agent-runtime/paths.mjs`
- `lib/agent-runtime/audit.mjs`
- `tests/agents/runtime.test.mjs`

**Why this matters**

This is a trust issue. A runtime memory layer that can half-close a task is not boring in the good way. For active agents, close-task behavior needs to be as predictable as a database commit.

### Phase 4: Formalize promotions and rewrite governance

**Goal:** Move useful task outputs upward without creating duplicate standards or uncontrolled canonical edits.

**Deliverables**

- Add contract-driven promotion rules:
  - which memory classes can be promoted
  - who may approve
  - default target path by artifact type
  - whether promotion is direct or requires lead review
- Add promotion metadata:
  - `promotion_reason`
  - `source_task_id`
  - `reviewed_by`
  - `supersedes`
  - `duplicate_of`
- Add promotion checks:
  - duplicate-title detection
  - target-path collision handling
  - status transition validation
  - canonical merge preconditions
- Separate two promotion flows clearly:
  - discovery -> standards/learned artifact
  - rewrite -> canonical merge

**Files likely touched**

- `lib/agent-runtime/promotion.mjs`
- `lib/agent-runtime/state-machines.mjs`
- `wiki/system/schemas/agent-contract.schema.json`
- `config/agents/*.yaml`
- `tests/agents/runtime.test.mjs`

**Why this approach**

Promotion is where noisy task output becomes institutional memory. That transition needs review, routing, and provenance, or the wiki will get cluttered fast.

### Phase 5: Wire runtime surfaces and retention around the model

**Goal:** Make the memory layer usable across CLI, web, and [[mcp-ecosystem]] without bypass paths.

**Deliverables**

- Add CLI flows for:
  - `agent start-task`
  - `agent append-state`
  - `agent close-task --dry-run`
  - `agent active-task`
- Add [[mcp-ecosystem]] tools that expose the same lifecycle instead of only context load and close.
- Add retention rules for completed task-local files:
  - archive after close
  - keep active pointer clean
  - compact stale abandoned tasks
- Expand observability:
  - `TaskLifecycleTrace`
  - `WritePlanTrace`
  - promotion decision trace

**Files likely touched**

- `cli/kb.js`
- `mcp/server.js`
- `lib/agent-runtime/retention.mjs`
- `lib/agent-runtime/audit.mjs`
- `README.md`
- `wiki/repos/agentic-kb/repo-docs/README.md`

## Why this approach

This plan deliberately avoids rebuilding the runtime around a database, event stream, or vector store. The repo is already winning with markdown, frontmatter, and zero-dependency modules. The right move is to keep the file-based model and tighten the contract boundaries so the runtime becomes operationally dependable.

That gives us:

- explicit live state for active agents
- bounded context assembly
- auditable promotion paths
- transactional close-task behavior
- one memory model shared by CLI, [[mcp-ecosystem]], and web

## Tradeoffs and risks

- **More schema means more contract maintenance.** This is worth it because hidden runtime behavior is more dangerous than explicit YAML.
- **True atomic staging adds implementation complexity.** Worth doing because partial writeback undermines trust in the whole layer.
- **Task-local files increase artifact count.** Retention and archival rules need to ship with the lifecycle changes, not later.
- **Promotion review may slow throughput.** That is acceptable for V1 because bad promotions are harder to unwind than delayed promotions.

## Acceptance criteria

We should consider this operational memory layer ready when all of the following are true:

1. An agent can open, update, resume, and close a task using a dedicated task-local file.
2. Context loading always includes the active task state first when present and records why anything else was excluded.
3. `closeTask()` either commits all file writes and bus publications or leaves no side effects.
4. Promotions require valid state transitions and contract-allowed approvers.
5. A worker cannot write directly to canonical project docs, but can route approved rewrites and discoveries upward through supported promotion paths.
6. CLI, [[mcp-ecosystem]], and web all use the same runtime functions for task lifecycle operations.
7. Tests cover start, resume, dry-run, rollback, promotion approval, merge approval, and abandoned-task retention.

## Recommended rollout

Week 1:

- Phase 1
- Phase 2 contract/schema work
- new tests for active task lifecycle

Week 2:

- Phase 3 transactional close-task
- Phase 4 promotion hardening
- CLI and [[mcp-ecosystem]] surface updates

Week 3:

- retention, repair flows, and README/repo-doc sync
- end-to-end smoke script update

## Next step

Start with Phase 1 and Phase 3 together at the design level, then implement Phase 1 first.

Reason: task-local state defines what the runtime is trying to preserve, and transactional writeback defines how it becomes durable. If we get those two wrong, the rest becomes cleanup around a shaky core.
