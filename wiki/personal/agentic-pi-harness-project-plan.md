---
id: 01KQ2ZWAN418XVCJ4X7V4B4Y30
title: "Agentic Pi Harness — Project Plan"
type: personal
tags: [personal, jay-stack, agents, architecture, workflow]
created: 2026-04-08
updated: 2026-04-25
visibility: private
confidence: high
source: note/agentic-pi-harness-project-plan.md
related: [concepts/agent-loops, concepts/context-management, concepts/multi-agent-systems]
---

# Agentic Pi Harness — Project Plan

**Source repo:** https://github.com/jaydubya818/Pi (main @ e940846, tag v0.2.0)  
**Project folder:** `Agentic-Pi-Harness/` (sibling of the upstream clone — keeps upstream pulls clean)  
**Goal:** Clone Pi for reference; build a new extension package that adds Claude-Code-grade infrastructure on top. Ship v0.1 in ~5 weeks.

---

## Phase 0 — Bootstrap (Day 1, ~2h)

```bash
cd ~/pi-multi-team-local
git clone https://github.com/jaydubya818/Pi pi-upstream      # reference only
mkdir Agentic-Pi-Harness && cd Agentic-Pi-Harness
git init -b main
npm init -y
npm i -D typescript @types/node vitest tsx eslint prettier
npx tsc --init --rootDir src --outDir dist --target es2022 \
  --module nodenext --moduleResolution nodenext --strict
mkdir -p src/{loop,tools,retry,context,permissions,subagents,hooks} \
         tests docs config .github/workflows
```

**Tasks:**
1. Add `package.json` scripts: `build`, `test`, `lint`, `dev` (tsx watch).
2. Copy `src/types.ts` + scaffold files from the `pi-harness/` prototype.
3. First commit: `"chore: scaffold Agentic Pi Harness"`.

**Deliverable:** Empty-but-buildable TS project wired to Pi's extension entry point (`pi-upstream/src/extensions/`).

---

## Phase 1 — Core Loop + Types (Week 1)

### 1.1 `src/types.ts` — Normalisation Layer

- `StreamEvent` union: `text_delta | tool_use_start | tool_use_delta | tool_use_stop | message_stop | usage`
- `ModelClient` interface: single `stream(req)` → `AsyncIterable<StreamEvent>`
- `Tool<I,O>` with `concurrency: 'readonly' | 'serial' | 'exclusive'` and `maxResultSizeChars`
- `Message`, `ToolCall`, `ToolCtx`
- Adapter stubs: `wrapPiModel(piClient): ModelClient`

### 1.2 `src/loop/query.ts` — 5-Phase Async Generator

| Phase | What happens |
|---|---|
| 1 | `compact(messages)` + `applyToolResultBudget` |
| 2 | `withRetry(model.stream(...))` → `StreamingToolExecutor.dispatch(mid-stream)` |
| 3 | Error recovery (inside `withRetry`) |
| 4 | `exec.drain()` → append `tool_result` messages → yield |
| 5 | Check `stopReason` / `maxTurns` / abort → continue or return |

- Dependency-inject everything via `QueryDeps` (model, tools, systemPrompt, hooks, abortSignal).
- `AsyncGenerator<Event>` surface — Pi's TUI consumes it; tests consume the same generator with mock deps.
- Emit `SessionStart` / `turn_end` hooks.

See also: [Agent Loops](../concepts/agent-loops.md)

### 1.3 `src/tools/streamingExecutor.ts`

- Dispatch on `tool_use_stop` **before** `message_stop`.
- `readonly` pool: parallelism cap 10, shared semaphore.
- `serial` chain: `serialChain = serialChain.then(runNext)`.
- `exclusive`: blocks both pools until drained.
- Per-tool `siblingAbortController` — parent abort cascades down, sibling failure never climbs up.
- `drain()` returns results sorted by original dispatch order.
- Stream-fallback path: discard queued, synthesise error results for in-flight.

### 1.4 `src/retry/withRetry.ts` — Error Recovery Matrix

| Error Class | Action |
|---|---|
| 429 (Retry-After ≤ 20s) | Sleep + retry |
| 429 (> 20s / overage-disabled) | 30-min cooldown, disable fast mode |
| 529 ×1–2 | Backoff retry |
| 529 ×3 + fallback available | Switch `ctx.deps.model = fallbackModel` |
| 400 context overflow | Parse limits → recompute budget → reactive compact → retry |
| 401/403 | `deps.refreshAuth()` → retry |
| ECONNRESET / EPIPE / ETIMEDOUT | Disable keep-alive, retry |
| Stream idle > 90s | Abort watchdog → fallback non-streaming |
| Stream stall > 30s gap | Log, continue |
| Max attempts (8) | Throw |

**Backoff formula:** `min(500 * 2^n, 32_000) + jitter(0..25%)`  
**Persistent mode (CI/unattended):** Indefinite retries, 5-min ceiling, 30-s heartbeat.

See also: [Agent Failure Modes](../concepts/agent-failure-modes.md), [Context Management](../concepts/context-management.md)

**Deliverable end of Week 1:** Run a canned prompt against a mock `ModelClient`, see streaming text, watch 3 tools run in parallel, trigger every error branch.

---

## See Also

- [Agent Loops](../concepts/agent-loops.md)
- [Agent Failure Modes](../concepts/agent-failure-modes.md)
- [Context Management](../concepts/context-management.md)
- [Multi-Agent Systems](../concepts/multi-agent-systems.md)
