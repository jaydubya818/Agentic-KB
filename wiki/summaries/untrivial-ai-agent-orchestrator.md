---
title: "Agent Orchestrator — Local Agent Fleet Workspace"
type: summary
source_file: raw/framework-docs/untrivial-ai-agent-orchestrator.md
source_url: "https://github.com/Untrivial-ai/agent-orchestrator"
author: "Untrivial-ai / AO contributors"
date_published: 2026-02-13
date_ingested: 2026-08-31
tags: [agentic, orchestration, multi-agent, coding-agents, observability, state-management, safety, framework]
key_concepts: [agent-fleet, worktree-isolation, durable-state, change-data-capture, review-gateway, browser-automation, kanban]
confidence: medium
---

# Agent Orchestrator — Local Agent Fleet Workspace

## Source
- Raw capture: `raw/framework-docs/untrivial-ai-agent-orchestrator.md`
- Source URL: https://github.com/Untrivial-ai/agent-orchestrator
- Capture method: GitHub metadata plus README/docs capture; no clone or execution.
- Repository metadata in the raw capture lists Apache-2.0 license, Go as primary language, and topics including `agent-fleet`, `codex-cli`, `git-worktrees`, `multi-agent`, `orchestration`, `parallel-agents`, and `tmux`.

## TL;DR
Agent Orchestrator (AO) is a local desktop workspace/daemon for planning, running, supervising, and reviewing fleets of coding agents, with one worker per task, isolated workspaces, durable session facts, PR/CI/review state, terminal multiplexing, and a live Kanban read model.

## Key Points
1. **Worker isolation is the execution unit.** The README says each worker is one task, one coding agent, and one isolated workspace; Git-backed workers get their own branch and worktree, while the task, conversation, terminal, changed files, browser preview, PR, CI, and review state remain attached to the session.
2. **Planning and execution are split.** AO has a project orchestrator for product direction, technical strategy, priorities, sequencing, and delegation; workers own implementation, tests, commits, and pull requests.
3. **The board is a read model over durable facts.** AO derives Kanban status from session, PR, CI, and review facts rather than storing display state directly.
4. **Architecture centers on observe → update durable facts → derive status/act.** The docs make display status non-durable; persisted state includes activity state, termination status, committed controller epoch, interface handoff checkpoints, and PR facts.
5. **The runtime is a local daemon with ports/adapters.** Core services consume port interfaces; concrete adapters wrap agent CLIs, tmux/conpty runtimes, native chat/ACP drivers, git worktrees, GitHub SCM, and tracker systems.
6. **CDC/eventing is a first-class UI consistency mechanism.** Durable changes flow through a SQLite change-log table to a poller/broadcaster and then to SSE clients.
7. **Security posture is explicit but incomplete.** The review-gateway ADR states that prompt text or launch flags cannot make TUI reviewers genuinely read-only; AO uses a provider-neutral capability gateway and requires platform isolation before describing host-trusted adapters as contained/read-only.

## Reusable KB Takeaways
- AO is a concrete reference for [[patterns/pattern-navigator-driver-agentic-coding]] and MissionControl-style agent-fleet supervision: one orchestrator plans, many workers execute, and the UI shows operational status.
- Its durable-facts/derived-status rule reinforces [[syntheses/synthesis-durable-agent-state-is-not-prompt-context]]: prompt context is not durable state.
- Its review-gateway ADR reinforces [[patterns/pattern-credential-gateway]] and [[syntheses/synthesis-sandbox-safety-is-policy-not-place]]: a terminal transport, prompt, or autonomous flag is not a containment boundary.
- The source is substantive enough to maintain the existing [[frameworks/agent-orchestrator]] page, but not independently verified by local execution.

## Limitations
- No local clone, build, or runtime test was performed during capture or this Refinery run.
- Vendor/repository claims about autonomous CI fixes, reviews, conflict handling, and adapter support should stay source-reported until tested.
- The raw capture is large and includes implementation plans/status notes; some claims may reflect in-flight docs rather than released behavior.

## Related
- [[frameworks/agent-orchestrator]]
- [[patterns/pattern-navigator-driver-agentic-coding]]
- [[patterns/pattern-worktree-isolation]]
- [[concepts/agent-observability]]
- [[syntheses/synthesis-durable-agent-state-is-not-prompt-context]]
- [[syntheses/synthesis-sandbox-safety-is-policy-not-place]]
