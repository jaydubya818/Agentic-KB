---
repo_name: Pi
repo_visibility: private
source_type: github
branch: main
commit_sha: 1a669c97bc2760e9298c6ff3d892feea5426fc09
source_path: "Agentic-Pi-Harness-PLAN.md"
imported_at: "2026-04-25T16:05:44.777Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/Pi/main/Agentic-Pi-Harness-PLAN.md"
---

# Agentic Pi Harness — Project Plan

**Source repo:** https://github.com/jaydubya818/Pi (main @ e940846, tag v0.2.0)
**New project folder:** `Agentic-Pi-Harness/` (sibling of the clone, not inside it — keeps upstream pulls clean)
**Goal:** clone Pi for reference, build a new extension package that adds Claude-Code-grade infrastructure on top, ship v0.1 in ~5 weeks.

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

Tasks:
1. Add `package.json` scripts: `build`, `test`, `lint`, `dev` (tsx watch).
2. Copy `src/types.ts` + scaffold files from the `pi-harness/` prototype already in this workspace — they're the starting point.
3. First commit: "chore: scaffold Agentic Pi Harness".

Deliverable: empty-but-buildable TS project wired to Pi's extension entry point (check `pi-upstream/src/extensions/` for the current hook name).

---

## Phase 1 — Core loop + types (Week 1)

### 1.1 `src/types.ts` — normalization layer
- `StreamEvent` union: `text_delta | tool_use_start | tool_use_delta | tool_use_stop | message_stop | usage`.
- `ModelClient` interface: single `stream(req)` method returning `AsyncIterable<StreamEvent>`.
- `Tool<I,O>` with `concurrency: 'readonly'|'serial'|'exclusive'` and `maxResultSizeChars`.
- `Message`, `ToolCall`, `ToolCtx`.
- **Adapter stubs** for Pi's existing provider router: `wrapPiModel(piClient): ModelClient`.

### 1.2 `src/loop/query.ts` — 5-phase async generator
```
Phase 1  compact(messages) + applyToolResultBudget
Phase 2  withRetry(model.stream(...)) → StreamingToolExecutor.dispatch(mid-stream)
Phase 3  error recovery (inside withRetry)
Phase 4  exec.drain() → append tool_result messages → yield
Phase 5  check stopReason / maxTurns / abort → continue or return
```
- Dependency-inject everything via `QueryDeps` (model, tools, systemPrompt, hooks, abortSignal).
- `AsyncGenerator<Event>` surface → Pi's TUI consumes it; tests consume the same generator with mock deps.
- Emit `SessionStart` / `turn_end` hooks.

### 1.3 `src/tools/streamingExecutor.ts`
- Dispatch on `tool_use_stop` **before** `message_stop`.
- `readonly` pool: parallelism cap 10, shared semaphore.
- `serial` chain: `serialChain = serialChain.then(runNext)`.
- `exclusive`: blocks both pools until drained.
- Per-tool `siblingAbortController` — parent abort cascades down, sibling failure never climbs up.
- `drain()` returns results sorted by original dispatch order.
- Stream-fallback path: discard queued, synthesize error results for in-flight.

### 1.4 `src/retry/withRetry.ts`
Error class → recovery:
| Class | Action |
|---|---|
| 429 (Retry-After ≤ 20s) | sleep + retry |
| 429 (> 20s / overage-disabled) | 30-min cooldown, disable fast mode |
| 529 ×1–2 | backoff retry |
| 529 ×3 + fallback available | switch `ctx.deps.model = fallbackModel` |
| 400 context overflow | parse limits → recompute budget → reactive compact → retry |
| 401/403 | `deps.refreshAuth()` → retry |
| ECONNRESET / EPIPE / ETIMEDOUT | disable keep-alive, retry |
| stream idle > 90s | abort watchdog → fallback non-streaming |
| stream stall > 30s gap | log, continue |
| max attempts (8) | throw |

Backoff: `min(500 * 2^n, 32_000) + jitter(0..25%)`. Persistent mode flag for unattended (CI) runs: indefinite retries, 5-min ceiling, 30-s heartbeat.

**Deliverable end of week 1:** you can run a canned prompt against a mock `ModelClient`, see streaming text, watch 3 tools run in parallel, and trigger every error branch in unit tests.

---

## Phase 2 — Context + permissions (Week 2)

### 2.1 `src/context/compaction.ts`
Pipeline (cheapest first, stop at first pass under `soft_limit = 0.75 * contextLimit`):
1. **microcompact** — hash `{toolName, input}`, replace duplicate `tool_result` blocks with `{ref: hash}`. Zero model calls.
2. **snipCompact** — keep first system-context message + last `PROTECTED_TAIL=12` messages.
3. **autoCompact** — summarize head with cheap model, prepend `<conversation_summary generation="N">`, track generation counter to prevent recursive summaries.
4. **contextCollapse** — multi-phase: collapse tool results → drop thinking blocks → summarize sections.

Invariant: `protectedTail` is never touched.

### 2.2 `src/permissions/pipeline.ts` — 7 stages
```
1. mode gate        (default | acceptEdits | bypass | plan)
2. enterprise deny  /etc/pi/permissions.json
3. project deny     <repo>/.pi/permissions.json
4. user deny        ~/.pi/permissions.json
5. project allow
6. user allow
7. PreToolUse hook  → {decision: approve|block|ask}
→ fallthrough: promptUser() or deny
```
- Rules: `{tool: "bash", match: "git *", effect: "allow"}`.
- Glob on `tool` + on stringified `input`.
- Deny always wins; higher scope always wins.
- `loadRulesHierarchy(repoRoot)` reads all three files.

### 2.3 PI.md hierarchy loader
- Resolve `/etc/pi/PI.md` → `.pi/PI.md` → `~/.pi/PI.md` → `PI.local.md`.
- Support `@./path.md` include directive.
- Inject merged content as the **first user message** wrapped in `<system-reminder>`, NOT in the system prompt (keeps cache stable).

**Deliverable end of week 2:** permission pipeline blocks/approves tool calls per rule file; compaction keeps a 50k-token transcript under 32k with protected tail intact.

---

## Phase 3 — Sub-agents + infra (Week 3)

### 3.1 `src/subagents/worktree.ts`
- `getOrCreateWorktree(repoRoot, slug)`:
  - validate slug (`/^[a-z0-9][a-z0-9-_]{0,63}$/`), no path traversal.
  - fast-resume: return if `git rev-parse HEAD` succeeds in `../pi-wt-<slug>`.
  - `git fetch` with `GIT_TERMINAL_PROMPT=0`.
  - `git worktree add -b pi/<slug>`.
  - symlink heavy dirs: `node_modules`, `.venv`, `.cache`, `dist`.
  - copy PI.md + `.env.local` + `.pi/settings.json`.
- `removeWorktree(repoRoot, slug)` with `--force`.

### 3.2 `src/subagents/spawn.ts`
- Re-run `query()` with fresh state, cloned file caches, no-op parent state setter.
- Three backends: `in-process` (Worker thread), `tmux` (visible pane), `remote` (SSH).
- Parent abort cascades; child abort stays local.

### 3.3 `src/subagents/taskList.ts`
- JSON files at `~/.pi/tasks/<listId>/<taskId>.json`.
- `O_EXCL` lockfile with exponential backoff (30 retries, 5–100 ms).
- High-watermark counter in `~/.pi/tasks/<listId>/.hwm`.

**Deliverable end of week 3:** spawn 3 sub-agents on the same repo, each in its own worktree, coordinate through the task list, parent Ctrl-C kills all cleanly.

---

## Phase 4 — Hooks + extensions (Week 4)

### 4.1 Hook registry
`src/hooks/registry.ts` — events: `SessionStart`, `PreToolUse`, `PostToolUse`, `FileChanged`, `Stop`.
Backends: shell command, HTTP POST, in-process fn. Return JSON `{decision, reason, mutate}`.

### 4.2 Skills loader (markdown + frontmatter)
`src/skills/loader.ts` — discover from 5 sources (bundled, project, user, plugin, MCP). Path-based activation so skills only load when relevant files are touched.

### 4.3 Plugins directory structure
`plugins/<name>/{skills,hooks,mcp,config.json}` — drop-in composition, no core edits.

### 4.4 Docs
- `BLUEPRINT.md` — maps every Claude Code decision → file in this repo → why. (Copy + expand the one already in `pi-harness/`.)
- `README.md` — install into Pi, what's stubbed, quickstart.
- `docs/ADRs/` — architecture decision records for loop shape, retry policy, permission model.

**Deliverable end of week 4:** hooks fire end-to-end, one example plugin (`plugins/git-safety`) demonstrates blocking `rm -rf`.

---

## Phase 5 — Harden + ship (Week 5)

1. Unit tests (`vitest`): loop phases, retry branches, compaction, permission rules, worktree.
2. Integration test: mock `ModelClient` feeds canned streams, asserts end-to-end transcript.
3. GitHub Actions CI: `tsc --noEmit`, `vitest run`, `eslint`.
4. `npm pack` dry run; tag `v0.1.0`.
5. Write migration guide from vanilla Pi.

---

## New features / enhancements backlog (post-v0.1)

Beyond the 1:1 port of Claude Code patterns, proposed additions unique to Agentic Pi Harness:

1. **Cost-aware model router.** Per-turn decision: use Haiku-class for pure-read turns, escalate to Sonnet-class only when `tool_use` count or reasoning depth crosses a threshold. Log `$/turn` in the status line.
2. **Speculative tool execution.** When the model's tool-call pattern is predictable (e.g. `Read → Grep → Read`), pre-warm the next tool's cache before the model finishes generating the call. Cancel if the prediction misses.
3. **Conversation replay + fork.** Pi already has tree-structured history — expose a `fork(nodeId)` API that creates a new worktree + new agent branch from any point in the tree. Lets users A/B approaches cheaply.
4. **Policy-as-code permissions.** Beyond glob rules, support CEL expressions: `tool == "bash" && input.command.matches("^git (status|log|diff)")`. Makes allow-lists maintainable at scale.
5. **Sub-agent auction.** When multiple specialized sub-agents could handle a task, broadcast the task, let each return a confidence + ETA, pick the winner. Instead of hard-coding routing.
6. **Auto-PI.md synthesis.** On session end, diff the successful tool-call sequence against `PI.md`; if a new convention is repeated 3+ times, propose a `PI.md` edit.
7. **Deterministic replay for debugging.** Record model stream + tool I/O to a JSONL tape; `pi replay <tape>` re-runs the loop against the tape without hitting the API. Essential for debugging flake.
8. **Per-tool circuit breakers.** If a tool fails 5× in 60s, open the circuit and return synthetic errors for 30s so the model stops hammering it.
9. **Streaming diff renderer for the TUI.** Pi already has strong UI primitives; add word-level diff highlighting for `edit` tool results so users can trust autonomy.
10. **Observability.** OpenTelemetry spans around each phase; Prometheus metrics for `turns_total`, `retry_errors_total{class}`, `compaction_runs_total{strategy}`, `tool_duration_seconds{tool}`. Grafana dashboard template.
11. **Token budget SLOs.** Declare a per-session max spend; fail closed when exceeded.
12. **Secret scanner pre-hook.** Ship a built-in `PreToolUse` hook that blocks tool calls whose input matches AWS/GCP/Anthropic key regexes.

Prioritize: #1, #7, #10 for v0.2 (cost + debug + observability are the things you regret not having).

---

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| Pi's extension API changes upstream | pin to `v0.2.0`, wrap the integration point in one adapter file (`src/pi-adapter.ts`), version-gate it |
| Multi-provider drift (each provider's stream shape is different) | normalize at the provider adapter, never inside the loop; add a provider conformance test suite |
| Compaction loses critical context | protected tail + generation counter + replay tapes for regression |
| Permission rules too coarse → users disable them | ship sensible defaults (`bash:git *` allowed, `bash:rm *` denied), plus the plan-mode escape hatch |
| Worktree state drift between agents | file-based task list locks + periodic `git fsck` in CI |

---

## Status

This plan is committed to `Agentic-Pi-Harness-PLAN.md` in the workspace root. The scaffolding prototype in `pi-harness/` is the starting point for Phase 0 — copy, don't rewrite.

**Next action:** approve the plan, then I'll execute Phase 0 (clone + scaffold + first commit) in this session.
