---
repo_name: Pi
repo_visibility: private
source_type: github
branch: main
commit_sha: 1a669c97bc2760e9298c6ff3d892feea5426fc09
source_path: "docs/pi-playground/TRANSCRIPT-FEATURE-TEST-MATRIX.md"
imported_at: "2026-04-25T16:05:44.790Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/Pi/main/docs/pi-playground/TRANSCRIPT-FEATURE-TEST-MATRIX.md"
---

# Transcript Feature Test Matrix

Repo-local checklist mapping **transcript-style Pi playground features** to commands, expected behavior, evidence, and status.

## How to read status

| Status | Meaning |
|--------|---------|
| **Pass** | Required artifacts present **and** automated check for this feature succeeded (extension load via `pi … --help`, or `verify-tier2` / `verify-tier3` / `npm test` as noted). |
| **Partial** | **Pass** conditions met for load/config, but **transcript UX** (TUI footer, dialogs, tool calls, subagents, LLM/API) was **not** interactively confirmed in the recorded run. |
| **Fail** | Command failed, stack does not load, or expected file/path missing. |

**Distinction (reporting):**

- **Started successfully** — `pi -e … --help` exits 0 (or npm/just wrapper runs the same argv).
- **Behavior observed** — human or scripted interaction confirmed the feature in-session (not done in default CI/matrix refresh).
- **Code path present** — implementation exists under `extensions/` and/or `.pi/` (inspect grep, `verify-pi-play` load).
- **Missing** — **Fail**: no implementation or smoke test cannot run.

## Matrix

| Feature | Expected behavior | Command to run | Evidence to inspect | Status | Notes |
|---------|-------------------|----------------|---------------------|--------|-------|
| **pure focus** | Footer cleared / stripped for a minimal “focus” shell | `npm run pi-play:pure-focus` · `just ext-pure-focus` · `npm run pi-tier:v1` | `extensions/pure-focus.ts` (`setFooter` empty); `pi-play:verify` line `pure-focus` | **Partial** | Load **Pass** (2026-04-03). Footer UX not observed in TUI this run. |
| **minimal footer** | Compact footer (model + short context meter) | `npm run pi-play:minimal` · `just ext-minimal` · `npm run pi-tier:v2` | `extensions/minimal.ts`; verify stack `minimal+theme-cycler` | **Partial** | Load **Pass**. Live footer not visually confirmed. |
| **cross-agent loading** | Slash/commands discovered from `.claude/` / `.gemini/` / `.codex/` dirs | `npm run pi-play:cross-agent` · `npm run pi-tier:v3` | `extensions/cross-agent.ts`; verify stack `cross-agent+minimal` | **Partial** | Load **Pass**. Needs real dirs + TUI to confirm command list. |
| **purpose-gate** | Startup purpose prompt; purpose injected into system + widget | `npm run pi-play:purpose-gate` · `npm run pi-tier:v4` | `extensions/purpose-gate.ts`; verify stack `purpose-gate+minimal` | **Partial** | Load **Pass**. Dialog/widget flow not executed in automation. |
| **tool counter** | Footer shows tool usage / activity line | `npm run pi-play:tool-counter` · `npm run pi-tier:v5` | `extensions/tool-counter.ts`; verify stack `tool-counter` | **Partial** | Load **Pass**. Counter increments not observed without session. |
| **theme cycler** | `/theme`, Ctrl+X/Ctrl+Q cycle `.pi/themes` | `npm run pi-play:theme-cycler` · `extensions/theme-cycler.ts` with `minimal` | `extensions/theme-cycler.ts` (`registerCommand("theme")`); bundled in `minimal+theme-cycler` verify stack | **Partial** | Load **Pass** (combined stack). Keybinds/picker not interactively tested. |
| **subagent widget** | `/sub`, progress widget, `/subcont` / `/subrm` / `/subclear` | `npm run pi-play:subagent-widget` · `npm run pi-tier:v7` | `extensions/subagent-widget.ts`; verify stack `subagent+pure-focus+theme-cycler` | **Partial** | Load **Pass**. Subagent streaming not run in automation. |
| **tilldone** | `tilldone` tool + gating; `/tilldone` command | `npm run pi-play:tilldone` · `npm run pi-tier:v8` | `extensions/tilldone.ts`; verify stack `tilldone+theme-cycler` | **Partial** | Load **Pass**. Tool gating not exercised without LLM session. |
| **agent team** | `dispatch_agent`, teams from `.pi/agents/teams.yaml`, grid commands | `npm run pi-play:agent-team` · `npm run pi-tier:v9` · `just ext-agent-team` | `extensions/agent-team.ts`; `.pi/agents/teams.yaml`; verify stack `agent-team+theme-cycler` | **Partial** | Load **Pass**. `npm run verify-tier2` validates **default/full** rosters (not agent-team runtime). |
| **system select** | `/system` picks persona under `~/.pi/agents` | `npm run pi-play:system-select` · `npm run pi-tier:v10` | `extensions/system-select.ts`; verify stack `system-select+minimal+theme-cycler` | **Partial** | Load **Pass**. Persona switch not observed in TUI. |
| **damage control** | Rules in `.pi/damage-control-rules.yaml`; extension audits risky shell | `npm run pi-play:damage-control` · `npm run pi-tier:v11` | `extensions/damage-control.ts`; `.pi/damage-control-rules.yaml` | **Partial** | Load **Pass**. **`verify-tier2`** **Pass** for sample rule: blocks `git reset --hard` pattern match. Interactive approval UX not scripted. |
| **agent chain** | `/chain`, sequences from `.pi/agents/agent-chain.yaml` | `npm run pi-play:agent-chain` · `npm run pi-tier:v12` · `just ext-agent-chain` | `extensions/agent-chain.ts`; `.pi/agents/agent-chain.yaml`; verify stack `agent-chain+theme-cycler` | **Partial** | Load **Pass**. **`verify-tier2`** **Pass** for `full-review` chain definition. Multi-step chain execution not automated. |
| **meta-agent (Pi Pi)** | Primary orchestrator + `query_experts`, `/experts` | `npm run pi-play:pi-pi` · `npm run pi-tier:v13` · `just ext-pi-pi` | `extensions/pi-pi.ts`; `.pi/agents/pi-pi/`; `npm run verify-tier3` | **Partial** | Expert files + roster **Pass** (`verify-tier3`). `pi … --help` **Pass**. Parallel expert subprocesses + API not exercised. |

## Automated suite (this repo)

| Suite | Command | What it proves |
|-------|---------|----------------|
| Typecheck + lint + unit tests | `npm run check` | `typecheck` + Biome + `shell-guard` / `prompt-build` |
| Typecheck | `npm run typecheck` | `tsc --noEmit` |
| Lint | `npm run lint` | Biome on `src`, `config`, `scripts` |
| Tests | `npm test` | same as `check` without typecheck/lint |
| Tier 2 YAML | `npm run verify-tier2` | `teams.yaml`, `agent-chain.yaml`, damage-control sample rule |
| Tier 3 meta assets | `npm run verify-tier3` | Pi Pi expert markdown + `teams.yaml` `pi-pi` + optional `pi --help` |
| Pi stacks | `npm run pi-play:verify` | Every stack in `scripts/verify-pi-play.mjs` loads via `pi … --help` |

## Last recorded verification

| Field | Value |
|-------|--------|
| Date | 2026-04-03 |
| Host | Maintainer machine (`darwin`, repo path `pi-multi-team-local`) |
| `pi` on PATH | Yes (all `verify-pi-play` stacks **ok**) |
| Result summary | **0 Fail** on required transcript rows; **Partial** = interactive/API depth not covered |

### Commands logged (that run)

```text
npm run check
npm run verify-tier2
npm run verify-tier3
npm run pi-play:verify
```

Refresh this section after re-running the suite; optionally add `npm run demo` / `npm run start` if you extend automation to the control plane.
