---
repo_name: Pi
repo_visibility: private
source_type: github
branch: main
commit_sha: 1a669c97bc2760e9298c6ff3d892feea5426fc09
source_path: README.md
imported_at: "2026-04-25T16:05:44.779Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/Pi/main/README.md"
---

# pi-multi-team-local

**Faithful local recreation of a multi-agent architecture using public Pi (`@mariozechner/pi-coding-agent`) capabilities.** This is not the private “video” codebase; it is a sibling control plane that composes multiple real `AgentSession` instances with YAML config, policy-mediation, contracts, and session artifacts.

> [!TIP]
> ## First time here? Start with this
> If you just want the fastest low-friction intro:
>
> - **No keys / no `pi` yet:** run `npm install` then `PI_MOCK=1 npm run demo`
> - **Try the supervised multi-agent app:** run `npm run check-env` then `PI_MOCK=1 npm run start`
> - **Try the Pi playground extensions:** only after `pi` is installed and on your `PATH`, run `npm run pi-play:pure-focus`
>
> Rule of thumb:
> - **`src/` / `npm run start`** = the control-plane app
> - **`extensions/` / `npm run pi-play:*`** = the Pi playground

## Current Capability Snapshot

- **Control plane** — Operator-grade, **supervised** local multi-agent Ink app: YAML teams, mediated tools, policy gates, contracts, session artifacts under `.runtime/sessions/`. Implemented in `src/` + [`config/multi-team.yaml`](config/multi-team.yaml).
- **Pi CLI playground** — Real **`pi`** extension stacks via `npm run pi-play:*` / `just ext-*` recipes. Code in [`extensions/`](extensions/) and [`.pi/agents/`](.pi/agents/).
- **UI extensions** — Footers, themes, cross-agent discovery, purpose gate, tool counters, subagent, TillDone ([`docs/pi-playground/EXTENSIONS-UI.md`](docs/pi-playground/EXTENSIONS-UI.md)).
- **Orchestration extensions** — Agent team (`dispatch_agent`), `/system`, damage-control rules, agent chains ([`docs/pi-playground/EXTENSIONS-ORCHESTRATION.md`](docs/pi-playground/EXTENSIONS-ORCHESTRATION.md)).
- **Meta-agent extension** — Pi Pi meta-agent: expert markdown + `query_experts` ([`docs/pi-playground/EXTENSIONS-META-AGENT.md`](docs/pi-playground/EXTENSIONS-META-AGENT.md)).
- **Transcript coverage** — Playground features from the integration transcript are **implemented** and **load-tested** (`pi … --help` per stack). **Full UX** is **not** proven by automation; see [Verification Status](#verification-status) and [TRANSCRIPT-FEATURE-TEST-MATRIX.md](docs/pi-playground/TRANSCRIPT-FEATURE-TEST-MATRIX.md).
- **Maturity (plain English)** — Solid for **experimentation and supervised local use**: real orchestration and policy code on the control plane; real Pi extensions for the playground. **Not** a claim of unattended production autonomy, full UI test coverage, or identical behavior to any private Pi product.

## Verification Status

What “verified” means here is intentionally narrow: **structural** checks are automated; **interactive** behavior is on you.

### Structurally Verified

These run in CI or locally without opening the full Ink/Pi TUIs and without calling live models (unless noted):

| Mechanism | Proves |
|-----------|--------|
| `npm run typecheck` | Control plane + declared types compile (`tsc --noEmit`). |
| `npm run lint` | Biome clean on `src/`, `config/`, `scripts/`. |
| `npm test` | **Shell guard** unit tests + **prompt-build** smoke (`src/cli/shell-guard.test.ts`, `src/agents/prompt-build.test.ts`). |
| `npm run check` | All of the above in one command. |
| `npm run verify:orchestration` | Playground **YAML**: `teams.yaml`, `agent-chain.yaml` (`full-review`), sample **damage-control** rule match (e.g. `git reset --hard`). |
| `npm run verify:meta-agent` | Pi Pi **expert files** + `teams.yaml` `pi-pi` roster + **optional** `pi -e extensions/pi-pi.ts … --help` if `pi` is on PATH. |
| `npm run pi-play:verify` | Every documented stack: **`pi -e … --help` exits 0** — **extension registration / load only**, not chat behavior. Fails if `pi` is missing. |
| `npm run pi-play:verify-if-available` | Same as above when `pi` exists; **exits 0** with a skip message if `pi` is absent (typical CI without Pi installed). |
| `npm run verify:playground` | `verify:orchestration` + `verify:meta-agent` + `pi-play:verify-if-available`. |
| `PI_MOCK=1 npm run demo` | Control plane **demo path** runs without live LLM; writes **session-style artifacts** for layout/pipeline smoke (not a substitute for production hardening). |

`npm run policy-check` exists for policy configuration inspection; it is **not** part of the default `check` script.

### Interactively Verified

The repo **does not** ship Playwright (or similar) for Ink/Pi. Nothing here certifies that footers, widgets, `/sub`, `/chain`, damage-control prompts, or `query_experts` behave correctly in a real session. Those outcomes are **interactively verified** only when **you** run `npm run start` or `npm run pi-play:…` in a **real terminal** and exercise the flows. The [Transcript Feature Test Matrix](docs/pi-playground/TRANSCRIPT-FEATURE-TEST-MATRIX.md) records **pass/partial/fail** with that distinction.

### Requires Real Terminal / Real Keys

| Need | Why |
|------|-----|
| **Real terminal** | Ink and Pi are terminal TUIs; pseudo-TTY behavior, keyboard shortcuts, and overlays are not covered by `pi --help` smokes. |
| **Anthropic (or configured) API keys** | **Live** model turns on the control plane (`npm run start` without `PI_MOCK=1`) and in Pi playground sessions. Keys in **shell env** for Pi (Pi does **not** load `.env` automatically). |
| **`pi` on PATH** | Required for `pi-play:*` and `pi-play:verify`. |

### Known Operational Boundaries

- **`pi-play:verify`** (and `--help` smokes) prove **stack loading**, not **correctness** of agent behavior, tools, or UI.
- **Mock vs live** — `PI_MOCK=1` (with `npm run demo` or `PI_MOCK=1 npm run start`) **skips real LLM calls** but still exercises much of the pipeline; **live** mode needs keys and may incur cost/latency.
- **Cancellation / side effects** — Once a mediated or external tool has started, **absolute** prevention of all side effects is **not** guaranteed; orchestration can still mark abandonment and ignore late results. See [Known Operational Caveat](#known-operational-caveat) below.

## Fast Start Paths

Install once:

```bash
# Prerequisites
brew install just            # task runner (required for just ext-* recipes)
npm install -g @mariozechner/pi-coding-agent   # Pi CLI (required for playground stacks)
export OPENAI_API_KEY=sk-...  # or ANTHROPIC_API_KEY — Pi reads from shell env, not .env

cd pi-multi-team-local
npm install
cp .env.example .env   # optional: for control-plane convenience (Pi still wants keys in shell)
```

**Control plane**

```bash
npm run check-env
npm run start                    # live Ink TUI (needs keys unless you use mock)
PI_MOCK=1 npm run start          # Ink TUI without live LLM (same env flag as demo path)
PI_MOCK=1 npm run demo           # non-interactive demo: pipeline + artifacts, no API
```

**Pi playground** (install [`pi`](https://github.com/badlogic/pi-mono), export keys in shell)

```bash
npm run pi-play:pure-focus       # simplest extension — stripped UI
npm run pi-play:agent-team       # multi-agent team dispatcher
npm run pi-play:pi-pi            # Pi Pi meta-agent
npm run pi-play:pathfinder       # Pathfinder next-step agent
npm run pi-play:mirrorline       # Mirrorline personal insight agent
npm run pi-play:minimal          # example: footer + themes
```

**Verification**

```bash
npm run check                    # typecheck + lint + test
npm run verify:orchestration
npm run verify:meta-agent
npm run pi-play:verify           # all stacks; requires pi on PATH
npm run pi-play:verify-if-available   # skips if pi missing
npm run verify:playground        # orchestration + meta-agent + pi-play verify-if-available
just verify                      # check + all verify scripts + pi-play verify-if-available
```

## What To Use When

| Situation | Use |
|-----------|-----|
| **Supervised multi-team coding** with contracts, policy, artifacts | **Control plane** — `npm run start` (or `PI_MOCK=1 npm run demo` to learn layout). |
| **Transcript-style Pi UX** (themes, teams, chains, meta-agent, focused personas) | **Pi playground** — `npm run pi-play:*` or `just ext-*`. |
| **CI, onboarding, no keys** | **`npm run check`**, **`npm run verify:orchestration`**, **`npm run verify:meta-agent`**; **`PI_MOCK=1 npm run demo`** for control-plane structure. |
| **Local keys + real agents** | **Live** control plane or Pi; ensure keys in environment. |
| **UI extensions** | Footers, themes, focus, tool counters, subagent, TillDone — `npm run pi-play:minimal` etc. |
| **Orchestration extensions** | Multi-agent dispatch, `/system`, damage-control, `/chain` — `npm run pi-play:agent-team` etc. |
| **Meta-agent** | Pi Pi + `query_experts` + expert docs — `npm run pi-play:pi-pi`. |

## Structural vs Interactive Proof Matrix

| Area | Verified By | Confidence | Notes |
|------|-------------|------------|--------|
| Control-plane build health | `npm run typecheck`, `npm run lint`, `npm test` / `npm run check` | **High** for compile/lint/unit scope; **not** E2E Ink. |
| Mock demo | `PI_MOCK=1 npm run demo` | **Medium–high** for pipeline/artifact **shape**; no live LLM. |
| Session artifacts | `PI_MOCK=1 npm run demo` + inspect `.runtime/sessions/` | **Medium** — files written; **semantic** quality of content not fully asserted. |
| Policy checks | `npm run policy-check` (optional) | **Config-level**; not a substitute for full policy review. |
| Shell guard | `npm test` (`shell-guard.test.ts`) | **High** for guarded patterns covered by tests. |
| UI extension stack loading | `npm run pi-play:verify` (or `-if-available`) | **Medium** — **load/smoke** only (`pi --help`). |
| Orchestration extension config | `npm run verify:orchestration` | **High** for checked YAML/regex samples; **not** full runtime. |
| Meta-agent structure | `npm run verify:meta-agent` | **High** for files/roster; **optional** `pi --help` when `pi` present. |
| Pi interactive UX | Manual run: `npm run pi-play:*` / `just ext-*` | **Low** from automation; **only** you in a terminal. |
| Live model execution | Keys + `npm run start` or Pi session | **Not** proven by repo scripts beyond your own runs. |

## Recommended Next Manual Checks

1. **Control plane** — `npm run check-env`, then `PI_MOCK=1 npm run start` (or live `npm run start` with keys); send one prompt, confirm `.runtime/sessions/<id>/` appears with expected files.
2. **Pi playground** — With `pi` + keys: `npm run pi-play:minimal`; confirm footer/themes in the TUI.
3. **Live** — If keys are set: one real task on the control plane and one short Pi session to validate tools and model responses.

---

## Control Plane App vs Pi Playground

Two distinct systems live in this repo. They share the same codebase but serve different purposes.

### Control Plane App

> Supervised multi-agent orchestration system you **operate**.

| | |
|--|--|
| **Primary paths** | `src/`, `config/multi-team.yaml`, `.runtime/sessions/` |
| **What it does** | Runs multiple Pi agent sessions in a supervised hierarchy (orchestrator → team leads → workers) with policy mediation, contract validation, approval gates, and durable session artifacts |
| **Typical commands** | `npm run check-env` · `npm run start` · `PI_MOCK=1 npm run start` · `PI_MOCK=1 npm run demo` |
| **When to use** | You want to run a real multi-agent coding task with policy enforcement, audit trails, and structured output artifacts |
| **External target repo (optional)** | `PI_MULTI_CONFIG=config/multi-team.external-target.yaml npm run start` — keeps harness artifacts in this repo while targeting a separate sibling repo |

### Pi Playground

> Pi CLI customization and extension lab you **experiment in**.

| | |
|--|--|
| **Primary paths** | `extensions/`, `.pi/agents/`, `.pi/themes/`, `.pi/settings.json`, `.pi/damage-control-rules.yaml`, `docs/pi-playground/`, `docs/pi-vs-claude-code/`, `justfile` |
| **What it does** | A collection of Pi CLI extensions demonstrating TUI customization, event hooks, widgets, subagent spawning, team orchestration, agent chains, and meta-agent workflows |
| **Typical commands** | `npm run pi-play:pure-focus` · `npm run pi-play:agent-team` · `npm run pi-play:pi-pi` · `npm run pi-play:pathfinder` · `npm run pi-play:mirrorline` · `npm run pi-play:verify` · `just --list` |
| **When to use** | You want to explore or build Pi extensions, try orchestration patterns, or run the playground stacks |

### Simple Rule

- **Control Plane App** = the supervised multi-agent system you operate
- **Pi Playground** = the Pi extension laboratory you experiment in

---

## Pi Playground Extension Map

One-page operator reference: **extension → supporting files → launch command**.

### UI Extensions — TUI customization, focus, and chrome

| Extension | Extension File(s) | Supporting Files | Launch Command | Purpose |
|-----------|------------------|-----------------|----------------|---------|
| **default** | _(none)_ | `.pi/settings.json`, `.pi/themes/synthwave.json` | `npm run pi-play:default` (`just pi`) | Stock Pi with project theme + settings |
| **pure-focus** | `pure-focus.ts` | `.pi/settings.json` | `npm run pi-play:pure-focus` (`just ext-pure-focus`) | Strip all footer/status UI — minimal chrome |
| **minimal** | `minimal.ts`, `theme-cycler.ts` | `.pi/themes/` | `npm run pi-play:minimal` (`just ext-minimal`) | Compact model + context bar; Ctrl+X/Q theme cycling |
| **cross-agent** | `cross-agent.ts`, `minimal.ts` | `.pi/agents/`, `.claude/`, `.gemini/`, `.codex/` | `npm run pi-play:cross-agent` (`just ext-cross-agent`) | Discover commands/skills/agents from other AI tool dirs |
| **purpose-gate** | `purpose-gate.ts`, `minimal.ts` | `.pi/settings.json` | `npm run pi-play:purpose-gate` (`just ext-purpose-gate`) | Force intent declaration; persists purpose widget + injects into system prompt |
| **tool-counter** | `tool-counter.ts` | `.pi/themes/synthwave.json` | `npm run pi-play:tool-counter` (`just ext-tool-counter`) | Rich footer: model, context, tokens in/out, cost, cwd, branch, per-tool tallies |
| **tool-counter-widget** | `tool-counter-widget.ts`, `minimal.ts`, `theme-cycler.ts` | `.pi/themes/` | `npm run pi-play:tool-counter-widget` (`just ext-tool-counter-widget`) | Live above-editor widget showing per-tool call counts |
| **subagent-widget** | `subagent-widget.ts`, `pure-focus.ts`, `theme-cycler.ts` | `.pi/themes/` | `npm run pi-play:subagent-widget` (`just ext-subagent-widget`) | `/sub`, `/subcont`, `/subrm` — background Pi subagents with persistent widgets |
| **tilldone** | `tilldone.ts`, `theme-cycler.ts` | `.pi/themes/` | `npm run pi-play:tilldone` (`just ext-tilldone`) | Task-discipline gating — agent must declare tasks before using any other tools |

### Orchestration Extensions — Multi-agent dispatch, routing, safety

| Extension | Extension File(s) | Supporting Files | Launch Command | Purpose |
|-----------|------------------|-----------------|----------------|---------|
| **agent-team** | `agent-team.ts` | `.pi/agents/teams.yaml`, `.pi/agents/*.md` | `npm run pi-play:agent-team` (`just ext-agent-team`) | Dispatcher-only orchestrator; primary agent routes work via `dispatch_agent` to specialist personas |
| **system-select** | `system-select.ts`, `minimal.ts`, `theme-cycler.ts` | `.pi/agents/`, `.pi/themes/` | `npm run pi-play:system-select` (`just ext-system-select`) | `/system` picker to swap active persona/system prompt mid-session |
| **damage-control** | `damage-control.ts` | `.pi/damage-control-rules.yaml`, `.pi/themes/synthwave.json` | `npm run pi-play:damage-control` (`just ext-damage-control`) | Intercepts `tool_call`; enforces regex/path rules with hard-block or confirm-before-proceed |
| **agent-chain** | `agent-chain.ts` | `.pi/agents/agent-chain.yaml`, `.pi/agents/*.md` | `npm run pi-play:agent-chain` (`just ext-agent-chain`) | Sequential pipeline: `/chain <name>`; step output feeds next via `$INPUT`; `$ORIGINAL` always available |

### Meta-Agent Extension — Pi building Pi

| Extension | Extension File(s) | Supporting Files | Launch Command | Purpose |
|-----------|------------------|-----------------|----------------|---------|
| **pi-pi** | `pi-pi.ts` | `.pi/agents/pi-pi/pi-orchestrator.md`, `.pi/agents/pi-pi/*.md` (13 experts), `docs/pi-playground/EXTENSIONS-META-AGENT.md` | `npm run pi-play:pi-pi` (`just ext-pi-pi`) | Meta-agent that builds Pi components; primary agent fans out to parallel read-only experts via `query_experts`, then synthesizes and writes files |
| **pathfinder** | _(none — system prompt persona)_ | `.pi/agents/pathfinder.md`, `specs/pi-playground/pathfinder-agent.md`, `examples/pathfinder/example-interactions.md`, `docs/pi-playground/PATHFINDER-EVALUATION-RUBRIC.md` | `npm run pi-play:pathfinder` (`just ext-pathfinder`) | Minimal “next-step” agent that reframes vague requests into one clear action |
| **mirrorline** | _(none — system prompt persona)_ | `.pi/agents/mirrorline.md`, `specs/pi-playground/mirrorline-agent.md`, `examples/mirrorline/example-conversations.md`, `docs/pi-playground/MIRRORLINE-EVALUATION-RUBRIC.md` | `npm run pi-play:mirrorline` (`just ext-mirrorline`) | Minimal personal insight agent that reflects one clear pattern and one small next step |

---

> **Notes:**
> - The **control plane** (`src/`) is a separate Ink app for supervised multi-team orchestration — it is not part of the playground extensions above.
> - The playground runs **Pi CLI + extensions** (`pi -e extensions/<name>.ts`); the `npm run pi-play:*` and `just ext-*` commands are convenience wrappers.
> - Extension configs and YAML are **structurally verified** (`npm run verify:orchestration`, `verify:meta-agent`). Full TUI behavior (widgets, overlays, tool interception, agent dispatch) requires a **real terminal** and often **live API keys**.

### Fastest Path to Explore

| Step | Why |
|------|-----|
| **1. Start with pure-focus** — `npm run pi-play:pure-focus` | Simplest possible extension; confirms Pi + keys work |
| **2. Try tilldone** — `npm run pi-play:tilldone` | Shows task-gating and custom tool registration |
| **3. Run agent-team** — `npm run pi-play:agent-team` | Dispatcher pattern: see how `dispatch_agent` + team YAML work |
| **4. Run agent-chain** — `npm run pi-play:agent-chain` | Agent chain: watch a `/chain plan-build-review` pipeline execute |
| **5. Run pi-pi** — `npm run pi-play:pi-pi` | Pi Pi meta-agent: parallel expert research → synthesized output |

---

## Control Plane vs Pi CLI Playground

| | Control plane | Pi CLI playground |
|--|----------------|-------------------|
| **Entry** | `npm run start` → `src/cli/main.tsx` | `pi -e extensions/…` or `npm run pi-play:*` / `just ext-*` |
| **Config** | [`config/multi-team.yaml`](config/multi-team.yaml) | [`extensions/`](extensions/) + [`.pi/agents/`](.pi/agents/), [`.pi/settings.json`](.pi/settings.json) |
| **Sessions / logs** | [`.runtime/sessions/<id>/`](.runtime/sessions/) — `events.jsonl`, `summary.md`, … | [`.pi/agent-sessions/`](.pi/agent-sessions/) (gitignored; team/chain dispatch) |
| **Orchestration** | TypeScript (`src/control-plane/`) | In-extension: `agent-team`, `agent-chain`, … |

**Playground-only:** [`.pi/themes/`](.pi/themes/), [`.pi/damage-control-rules.yaml`](.pi/damage-control-rules.yaml), [docs/pi-playground/](docs/pi-playground/). **Control-plane-only:** `src/`, `config/multi-team.yaml`, [.pi/prompts/](.pi/prompts/), [.pi/experts/](.pi/experts/). **Shared:** [`.pi/skills/`](.pi/skills/) (see [Library skill](#library-skill-vendorlibrary) below).

## UI Extensions

Pi CLI UI presets. Details: [docs/pi-playground/EXTENSIONS-UI.md](docs/pi-playground/EXTENSIONS-UI.md).

| Extension | You get | Launch |
|-----------|---------|--------|
| default | Stock Pi | `npm run pi-play:default` / `just pi` |
| pure-focus | No footer | `npm run pi-play:pure-focus` / `just ext-pure-focus` |
| minimal | Minimal footer + theme cycler | `npm run pi-play:minimal` / `just ext-minimal` |
| cross-agent | Cross-agent dirs + minimal | `npm run pi-play:cross-agent` / `just ext-cross-agent` |
| purpose-gate | Purpose gate + minimal | `npm run pi-play:purpose-gate` / `just ext-purpose-gate` |
| tool-counter | Tool counter footer | `npm run pi-play:tool-counter` / `just ext-tool-counter` |
| tool-counter-widget | Tool counter widget + minimal + themes | `npm run pi-play:tool-counter-widget` / `just ext-tool-counter-widget` |
| subagent-widget | Subagent + pure focus + themes | `npm run pi-play:subagent-widget` / `just ext-subagent-widget` |
| tilldone | TillDone + themes | `npm run pi-play:tilldone` / `just ext-tilldone` |

**`just --list`** shows every `ext-*` recipe.

## Orchestration Extensions

Teams, personas, safety, pipelines. Doc: [docs/pi-playground/EXTENSIONS-ORCHESTRATION.md](docs/pi-playground/EXTENSIONS-ORCHESTRATION.md).

| Extension | You get | Launch |
|-----------|---------|--------|
| agent-team | `dispatch_agent` + [`.pi/agents/teams.yaml`](.pi/agents/teams.yaml) | `npm run pi-play:agent-team` / `just ext-agent-team` |
| system-select | `/system` persona picker + minimal + themes | `npm run pi-play:system-select` / `just ext-system-select` |
| damage-control | Damage-control + [`.pi/damage-control-rules.yaml`](.pi/damage-control-rules.yaml) | `npm run pi-play:damage-control` / `just ext-damage-control` |
| agent-chain | `/chain` + [`.pi/agents/agent-chain.yaml`](.pi/agents/agent-chain.yaml) | `npm run pi-play:agent-chain` / `just ext-agent-chain` |

YAML smoke (no TUI): **`npm run verify:orchestration`**.

## Meta-Agent Extension (Pi Pi)

Pi Pi meta-orchestrator, expert markdown under [`.pi/agents/pi-pi/`](.pi/agents/pi-pi/), `query_experts`. Doc: [docs/pi-playground/EXTENSIONS-META-AGENT.md](docs/pi-playground/EXTENSIONS-META-AGENT.md). Examples: [`examples/meta-agent/`](examples/meta-agent/).

Pi Pi queries **13 domain experts in parallel** for research, then synthesizes the findings and writes the actual implementation.

| Expert | Purpose |
|--------|---------|
| Agent Expert | Defines Pi agents, frontmatter, tool selection, teams, and orchestration patterns. |
| CLI Expert | Covers `pi` command-line usage, flags, modes, sessions, models, and automation. |
| Config Expert | Handles `settings.json`, providers, models, UI settings, packages, and keybinding config. |
| Docs Expert | Maintains repo docs, extension guides, examples, and documentation conventions. |
| Extensions Expert | Builds Pi extensions, custom tools, hooks, commands, UI integration, and runtime behavior. |
| Keybinding Expert | Handles shortcut registration, key formats, remapping, conflicts, and terminal compatibility. |
| Prompt Expert | Designs prompt templates, frontmatter, argument syntax, discovery, and `/template` workflows. |
| Safety Expert | Defines damage-control rules for risky tool calls, shell patterns, and protected paths. |
| Skill Expert | Designs and validates skills, `SKILL.md`, discovery, structure, and invocation. |
| Teams & Chains Expert | Designs `teams.yaml`, `agent-chain.yaml`, delegation, pipelines, and multi-agent flow. |
| Test Expert | Validates extensions, themes, YAML configs, stack loading, and repo verify scripts. |
| Theme Expert | Creates and validates Pi themes, token coverage, palettes, and hot-reload behavior. |
| TUI Expert | Builds terminal UI components, overlays, widgets, rendering, and input handling. |

| Launch | `npm run pi-play:pi-pi` / `just ext-pi-pi` |
| Dry-run | `npm run verify:meta-agent` |

## Testing

Semantics for **structural vs interactive** proof: [Verification Status](#verification-status). For **feature-by-feature** playground status: [Transcript Feature Test Matrix](docs/pi-playground/TRANSCRIPT-FEATURE-TEST-MATRIX.md).

**Test files** (`npm test` / `npm run check`):

| File | Covers |
|------|--------|
| `src/cli/shell-guard.test.ts` | Shell input detection / guard patterns |
| `src/agents/prompt-build.test.ts` | Skill loading and prompt construction |
| `src/agents/approval-queue.test.ts` | Approval gate queue behavior |
| `src/agents/mediated-tools.test.ts` | Tool mediation and policy wrapping |
| `src/cli/demo-exit.test.ts` | Demo mode exit / mock path |
| `src/policy/command-policy.test.ts` | Command-level policy rules |

| Command | What it runs |
|---------|----------------|
| `npm run check` | `typecheck` + `lint` + `test` |
| `npm run verify:orchestration` | `teams.yaml`, chain, damage-control sample rule |
| `npm run verify:meta-agent` | Pi Pi expert files + optional `pi --help` |
| `npm run pi-play:verify` | Every stack: `pi … --help` (needs `pi` on PATH) |
| `npm run pi-play:verify-if-available` | Same, skips cleanly if `pi` missing |
| `npm run verify:playground` | tier2 + tier3 + `pi-play:verify-if-available` |
| `just verify` | `check` + tier2 + tier3 + `pi-play:verify-if-available` |

**Feature checklist (pass/partial/fail):** [docs/pi-playground/TRANSCRIPT-FEATURE-TEST-MATRIX.md](docs/pi-playground/TRANSCRIPT-FEATURE-TEST-MATRIX.md).

### Cheat sheet

**Launch → variant (short names)**

| `npm run …` | Variant |
|-------------|---------|
| `pi-play:default` | Plain Pi |
| `pi-play:pure-focus` | No footer |
| `pi-play:minimal` | Minimal footer + `/theme` + theme keys |
| `pi-play:cross-agent` | Load `.claude/` / `.gemini/` / `.codex` commands |
| `pi-play:purpose-gate` | Purpose dialog + widget |
| `pi-play:tool-counter` | Footer tallies |
| `pi-play:tool-counter-widget` | Tool widget + minimal + themes |
| `pi-play:subagent-widget` | `/sub` family |
| `pi-play:tilldone` | TillDone tool |
| `pi-play:agent-team` | Team dispatcher |
| `pi-play:system-select` | `/system` |
| `pi-play:damage-control` | Shell policy prompts |
| `pi-play:agent-chain` | `/chain` |
| `pi-play:pi-pi` | Meta `query_experts` |
| `pi-play:pathfinder` | Minimal next-step persona |
| `pi-play:mirrorline` | Minimal personal insight persona |
| `pi-play:session-replay` | `/replay` timeline |
| `pi-play:theme-cycler` | Themes only (with minimal) |

**Interactive-only (need real TUI + usually API keys):** purpose dialog, TillDone gating in session, `/sub`, `dispatch_agent` runs, `/chain` steps, damage-control approvals, `query_experts`, theme keybinds, session replay overlay. **`pi-play:verify`** only checks that extensions **load**.

**Where things live**

| Kind | Path |
|------|------|
| Control plane session artifacts | `.runtime/sessions/<id>/` |
| Pi playground agent sessions | `.pi/agent-sessions/` (gitignored) |
| Playground teams / chains | `.pi/agents/teams.yaml`, `agent-chain.yaml` |
| Playground themes | `.pi/themes/` |
| Extension source | `extensions/*.ts` |

---

## Current Maturity

### Status
**Operator-grade supervised local multi-agent system** built on public Pi capabilities.

This project is a faithful local recreation of the multi-team orchestration architecture using:
- public Pi SDK/runtime capabilities
- a separate control plane
- code-enforced policy boundaries
- structured task contracts
- declared tool capability mediation
- structured validation gating
- per-request session isolation
- durable session artifacts and replay/export support

It is **not** a copy of any private repository or private Pi implementation.

---

## What This System Can Do

The system supports a supervised multi-agent workflow where:

- a single user prompt enters through the orchestrator
- the orchestrator routes work to configured team leads
- leads delegate work to workers
- workers operate within code-enforced domain boundaries
- results are synthesized back through the hierarchy
- every top-level request gets its own isolated session
- session logs, routing decisions, artifacts, validation outcomes, and policy violations are persisted

Current capabilities include:

- YAML-driven team topology
- per-agent models, workdirs, skills, and expertise files
- strict delegation envelopes with contract validation and repair retry
- artifact accountability based on explicit task contracts
- central tool capability registry with default-deny for unknown tools
- policy enforcement for reads, writes, deletes, shell, package, git, config, and secrets-sensitive operations
- supervised approval gates for risky actions
- structured validation results that can gate further mutation
- replay/export foundations and durable session summaries

---

## Trust Boundaries

This system is designed around explicit trust boundaries.

### 1. Control plane over agent runtime
Pi sessions are used as agent runtimes.
All orchestration, policy checks, approvals, contracts, and synthesis happen in the control plane.

### 2. Tool mediation is enforced in code
Agents do not directly receive unrestricted mutating tools.
All tool access flows through mediation layers that apply:
- declared tool capabilities
- path/domain policy
- approval gating
- validation-state gating
- logging and audit trails

Unknown or unregistered tools are denied by default.

### 3. Git is treated as a trust boundary
The system produces:
- `changed-files.json`
- `git-diff.patch`
- session summaries of modified files

No automatic commit behavior is assumed unless explicitly enabled and gated.

### 4. Contracts over prose
Inter-agent coordination is validated through structured contracts rather than relying on freeform prose.
This includes:
- task contracts
- delegation envelopes
- validation result contracts
- artifact obligations

### 5. Sessions are first-class artifacts
Each top-level request gets its own session directory with isolated logs, events, artifacts, prompts, and summaries.

---

## Known Operational Caveat

### Cancellation boundary
Timeouts and cancellation are robust at the orchestration layer:
- timed-out agent work is aborted where supported
- abandoned work is marked explicitly
- late results are ignored and cannot contaminate final synthesis

However, **absolute prevention of every external side effect cannot be guaranteed** once a downstream tool or runtime has already begun acting outside the control plane.

In practice, this means:
- orchestration remains correct and bounded
- synthesis ignores abandoned/late work
- audit logs remain accurate
- but hard kill guarantees depend on downstream runtime/tool behavior

This is a known and documented operational boundary.

---

## What This Project Is Best For

This system is a strong fit for:

- supervised local multi-agent coding workflows
- architecture experimentation
- orchestration and trust-boundary research
- internal demos and operator-driven runs
- structured planning / build / validate loops
- controlled mutation workflows with approvals

---

## What This Project Is Not Yet Claiming

This project is **not** currently claiming:

- fully unattended destructive autonomy
- guaranteed process-level cancellation of every external side effect
- universal semantic validation of every artifact kind
- production SaaS-grade multi-tenant isolation
- a direct copy of any private multi-agent Pi system

---

## Recommended Use

Use this system as:

- an operator-grade supervised local system
- a control plane for trusted multi-agent experimentation
- a foundation for more advanced local agent teams

Recommended operating mode:
- start in `supervised`
- use explicit approvals for risky actions
- review session artifacts and validation outcomes
- widen autonomy only when the task/tool boundary is well understood

---

## Near-Term Hardening Opportunities

The next most valuable improvements are:

1. **Artifact kind semantic validation**
   Validate artifact kinds against stronger schemas/content expectations, not only existence and policy.

2. **Stronger external side-effect containment**
   Improve kill/isolation semantics for high-risk tool paths using deeper runtime isolation where needed.

3. **Live demo mode**
   Keep mock demo support, but add a clearly labeled live demo path using real Pi behavior when credentials are available.

4. **Operator UX improvements**
   Expand topology inspection, artifact browsing, approval history, validation-state display, and best-effort usage/cost surfacing.

---

## Bottom Line

This project is now a **supervised, operator-grade local multi-agent system** with:
- real orchestration
- real policy enforcement
- real contract validation
- real artifact accountability
- real validation gating
- honest and explicit operational boundaries

That is the current maturity level.

## Why a sibling project (not a fork of pi-mono)

- **Pi has no built-in orchestrator / leads / workers hierarchy** — you orchestrate multiple sessions yourself ([Pi SDK](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent)).
- **Keeps `pi-mono` untouched** — integration is via the published npm package only.
- **Trust boundaries belong in your app** — tool mediation, git artifacts, and autonomy live here.

## Architecture (short)

1. **Control plane** (this repo): routing, parallelism cap, approval gates, logging.
2. **Pi SDK**: one `createAgentSession()` per agent role with mediated tools only.
3. **Flow**: user → orchestrator → each **team** (sequential) → **lead** (envelope) → **workers** (batched parallel, `parallelism.max_parallel_workers`, default 2) → session artifacts.

```
User → Orchestrator session
     → Team lead session (JSON contract)
     → Worker sessions (parallel batches) → artifacts + envelope
     → summary.md, changed-files.json, git-diff.patch, events.jsonl, …
```

## Trust boundaries (architecture)

These are enforced in **code**, not by prompts alone.

1. **Tool mediation** — The control plane wraps Pi tools: every tool is checked against a declared capability registry (`read`, `write`, `delete`, `shell`, `package`, `git`, `config`, `network`, `secrets_sensitive`) before policy checks run. Unregistered tools are blocked by default. Registered actions then pass `PolicyEngine` checks, normalized paths (relative to each agent `workdir`), structured `policy_blocked` responses, optional supervised approvals, and append-only **`events.jsonl`** (`tool_started` / `tool_completed` / `policy_blocked`). Agents do not receive unmediated `createCodingTools` results.
2. **Git** — Session artifacts include **`changed-files.json`** and **`git-diff.patch`**. **`commits_enabled`** defaults to false; no auto-commit. Optional **`create_session_branch`** and supervised **`git commit`** when commits are enabled and **`require_approval_before_commit`** is set.
3. **Delegation contract** — Handoffs use a **Zod-validated** JSON envelope (first balanced `{…}` in output, one repair retry, then **`contract_error`**). Prose is not treated as structured data if parsing fails.

## Control plane runbook

```bash
npm run check-env
npm run start              # Ink TUI; Tab toggles workers; /reload; Ctrl+C exit
PI_MOCK=1 npm run demo   # no API keys — pipeline + artifacts (expertise dry-run)
npm run replay -- .runtime/sessions/<id> --dump
npm run export-timeline -- .runtime/sessions/<id> [--out=./timeline.md]
npm run inspect-session -- .runtime/sessions/<id>
```

- **`PI_MOCK=1`** — skips LLM calls; still writes session artifacts (CI / layout tests).
- **`PI_APPROVAL_AUTO=1`** — auto-approves supervised gates (dev only).
- **`PI_EXPERTISE_DRY_RUN=1`** — log `expertise_updated` without writing expert files (`npm run demo` sets this).

Optional monorepo: sibling `../pi-mono` or `PI_MONO_PATH` — `npm run check-env` warns if missing.

Pi playground stacks, tiers, verification, and file layout: [Quick Start](#quick-start) and [Testing](#testing) above. Background: [disler/pi-vs-claude-code](https://github.com/disler/pi-vs-claude-code).

## Transcript feature coverage

Spec source: integration transcript describing [disler/pi-vs-claude-code](https://github.com/disler/pi-vs-claude-code) (extensions table + usage). Status is for this repo’s **Pi CLI playground** only.

| Feature | Status | How to run | What proves it works |
|--------|--------|------------|----------------------|
| Default Pi | Implemented | `npm run pi-play:default` or `just pi` | Pi starts; `pi --help` shows usage. |
| Pure focus Pi | Implemented | `npm run pi-play:pure-focus` | No footer; extension status keys cleared. Stack **after** theme-cycler if you need both: `pi -e extensions/theme-cycler.ts -e extensions/pure-focus.ts`. |
| Minimal footer Pi | Implemented | `npm run pi-play:minimal` | Footer shows model + `[####------] nn%` context meter. |
| Cross-agent path loading | Implemented | `npm run pi-play:cross-agent` | Boot notify lists `/commands`, `/skill:*`, `@agents` from `.claude/`, `.gemini/`, `.codex/`, `.pi/agents/`. |
| Purpose-gate widget | Implemented | `npm run pi-play:purpose-gate` | Dialog asks for purpose; widget + `<purpose>` injected into system prompt; prompts blocked until set. |
| Tool counter footer | Implemented | `npm run pi-play:tool-counter` | Two-line footer with token/cost and per-tool tallies after tool use. |
| Tool counter widget | Implemented | `npm run pi-play:tool-counter-widget` | Widget above editor updates per tool. |
| Theme cycler | Implemented | `npm run pi-play:theme-cycler` or any `*-theme-cycler` stack | Ctrl+X / Ctrl+Q cycle; `/theme` picker; swatch widget. |
| Subagent widget | Implemented | `npm run pi-play:subagent-widget` | `/sub …` spawns background agent; widgets show progress (needs live Pi + API). |
| TillDone / task gating | Implemented | `npm run pi-play:tilldone` | TillDone tool + footer task list; status key `tilldone` (fixed arg order vs Pi API). |
| Agent team | Implemented | `npm run pi-play:agent-team` | Team pick at boot; `dispatch_agent` to `.pi/agents/` roster; grid dashboard. |
| System select | Implemented | `npm run pi-play:system-select` | `/system` loads personas from `.pi/agents`, `.claude/agents`, etc. (incl. `~/.pi/agents`). |
| Damage control | Implemented | `npm run pi-play:damage-control` | Loads [.pi/damage-control-rules.yaml](.pi/damage-control-rules.yaml); blocks/asks on policy (live Pi). |
| Agent chain / pipeline | Implemented | `npm run pi-play:agent-chain` | `/chain` + [.pi/agents/agent-chain.yaml](.pi/agents/agent-chain.yaml). |
| Meta-agent (Pi Pi) | Implemented | `npm run pi-play:pi-pi` | Expert grid under [.pi/agents/pi-pi/](.pi/agents/pi-pi/); parallel research tools (live Pi). |
| Pathfinder persona | Implemented | `npm run pi-play:pathfinder` | Minimal next-step agent via [.pi/agents/pathfinder.md](.pi/agents/pathfinder.md); optimized for one clear action. |
| Mirrorline persona | Implemented | `npm run pi-play:mirrorline` | Minimal personal insight agent via [.pi/agents/mirrorline.md](.pi/agents/mirrorline.md); optimized for one clear pattern and one grounded insight. |
| Session replay | Implemented | `npm run pi-play:session-replay` | Extension loads; timeline overlay per [extensions/session-replay.ts](extensions/session-replay.ts). |

**Batch smoke test (no full TUI session):** `npm run pi-play:verify` — runs `pi … --help` for each stacked extension bundle.

**Gap triage (spec vs repo):**

- **Implemented:** All rows above; assets under `extensions/`, `.pi/agents/`, `.pi/themes/`, `justfile`, and `specs/pi-vs-claude-code/`.
- **Partial:** None material after fixing `setStatus` usage in TillDone/Damage-Control and global `~/.pi/agents` scan in system-select.
- **Missing:** Nothing from the transcript table. CI runs `npm run pi-play:verify-if-available` (see `.github/workflows/ci.yml`).
- **Risky / unclear:** Subagent/agent-team/agent-chain/pi-pi require **`pi` on PATH** and API keys for meaningful runs; `pi-play:verify` only checks extension load. Pure-focus + theme-cycler: put **pure-focus last** in `-e` order to clear theme status.

## Library skill (`vendor/library/`)

The [**library**](https://github.com/disler/the-library) meta-skill is **vendored in-repo** at [`vendor/library/`](vendor/library/) (full tree: `SKILL.md`, `library.yaml`, `cookbook/`, etc.) so the multi-team control plane works offline and stays reproducible without cloning a separate skills repo at session start.

### How skill names resolve

In [`src/agents/prompt-build.ts`](src/agents/prompt-build.ts), each configured skill name is loaded **at most once** (duplicate YAML entries are ignored). For a name like `library`, the loader tries in order:

1. `.pi/skills/<name>/SKILL.md` ← **required format for all project skills**
2. `vendor/<name>/SKILL.md` ← **library** resolves here as `vendor/library/SKILL.md`

> **Note:** Pi requires project-scoped skills to live in a `skillname/SKILL.md` subdirectory (not flat `.md` files). Each `SKILL.md` must include `name` and `description` in its YAML frontmatter, and the `name` must match the parent directory. Descriptions containing colons must be quoted.

So the vendored copy wins whenever there is no overlapping file under `.pi/skills/`.

### Pointing at your fork

The skill’s `## Variables` section documents **`LIBRARY_REPO_URL`**, **`LIBRARY_YAML_PATH`**, and **`LIBRARY_SKILL_DIR`**. To use your own catalog fork, edit **`vendor/library/SKILL.md`** (or your fork’s `SKILL.md`) so **`LIBRARY_REPO_URL`** is your Git remote (for example `https://github.com/<you>/the-library.git`), and align **`LIBRARY_YAML_PATH`** / **`LIBRARY_SKILL_DIR`** with where that repo lives on disk. The orchestrator and team **leads** include `library` in [`config/multi-team.yaml`](config/multi-team.yaml); workers do not, to keep worker prompts smaller.

## Using the App Prompt vs Your Terminal

The TUI input line is **only for agent requests**. It is not a shell.

### App prompt — send these here

```
@engineering inspect the backend and propose one safe refactor
@validation review recent changes and report risks
ask all teams for improvements to this project
plan -> engineer -> validate a new feature: add README section
show the most important files in this repo
```

### App commands — also typed here

| Command | Effect |
|---------|--------|
| `/help` | Show in-app help with examples and key bindings |
| `/reload` | Reload `config/multi-team.yaml` without restarting |

### Keyboard shortcuts

| Key | Effect |
|-----|--------|
| `Tab` | Toggle worker-chatter visibility (hidden by default) |
| `Ctrl+C` | Exit immediately |
| `exit` or `quit` (typed + Enter) | Exit cleanly with a confirmation message |

### Shell commands — run these in your terminal, not here

```bash
ls -la
cat src/cli/main.tsx
git status
git diff HEAD
npm run build
./scripts/deploy.sh
```

If you type a shell command in the app prompt by mistake, the app will show a warning and **not** forward it to any agent. Press `Ctrl+C` to exit the app, then run the command in your terminal.

The app detects shell-like input by first word (`ls`, `git`, `npm`, `cat`, etc.), prefix (`./`, `../`, `/bin/...`), `sudo`, chain operators (`&&`, `||`), and pipes (`|`) where the leading command is a known shell tool.

---

## Config

Single file: [`config/multi-team.yaml`](config/multi-team.yaml)

- **Teams are data** — disable a team with `enabled: false`; add new teams in YAML without changing TypeScript topology types.
- **Autonomy**: `global_autonomy` and per-agent `autonomy`: `advisory` (read-only tools), `supervised` (writes/package commands may wait on approval), `active` (writes within domain; infra paths still constrained for non-active in policy).
- **Parallelism**: `parallelism.max_parallel_workers` (default 2). Orchestrator and leads run **sequentially**; workers run in bounded parallel batches.

## Policy & tool mediation

Every tool call goes through **`wrapAgentTools`** → `PolicyEngine` → Pi execution. Prompts are **not** the enforcement layer. Violations emit `policy_blocked` in `events.jsonl` and merge into `policy-violations.json`.

## Delegation contract

Leads and workers must return **machine-validated** JSON (Zod): `objective`, `status`, `summary`, `files_touched`, `artifacts`, `blockers`, `next_step`. Parser takes the **first balanced `{…}`**. One **repair** session retry on failure, then `contract_error` in events/UI.

## Sessions

Each user submit in the TUI uses a new session folder under `.runtime/sessions/<id>/` with:

- `conversation.jsonl`, `events.jsonl`, `routing-decisions.jsonl`, `topology.json`
- `summary.md`, `changed-files.json`, `artifacts.json`, `policy-violations.json`, `timing.json`, `git-diff.patch`
- `artifacts/`, `plans/`, `validation/`, `agents/`, …

Inspect:

```bash
npm run inspect-session -- .runtime/sessions/<id>
```

## Routing modes (heuristic)

| Mode | How triggered (examples) |
|------|---------------------------|
| freeform | default; all enabled teams in config order |
| `@planning` / `@engineering` / `@validation` | substring in message |
| ask all | “ask all teams …” |
| plan → engineer → validate | all three words in message |
| engineering-only / validation-only | phrases containing those |

## Honesty / limitations

- **Not identical** to any private multi-agent product; this is an implementation against public Pi + your spec.
- **Heuristic routing** — not an LLM-only router; orchestrator still runs for narrative synthesis.
- **Timeout cancellation** — `AgentSession.abort()` is wired for timeout paths. If an operation still finishes after abandonment, the late result is logged as `late_result_ignored` and excluded from synthesis.
- **Live cost/token attribution** — footer is best-effort; Pi SDK usage hooks can replace mock estimates.

## Demo prompts (also used in `npm run demo`)

1. Show important files  
2. Ask all teams for improvements  
3. Plan → engineer → validate  
4. `@engineering` backend refactor suggestion  
5. `@validation` risk review  

## Scoring (quick)

- **Runnable**: yes (`PI_MOCK=1 npm run demo`)
- **Policy-enforced**: mediation + domain paths in code
- **Contracts**: Zod + repair + `contract_error`
- **Inspectable**: JSONL + session files

## License

MIT (match Pi ecosystem; adjust if your org requires otherwise).
