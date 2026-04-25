---
repo_name: Pi
repo_visibility: private
source_type: github
branch: main
commit_sha: 1a669c97bc2760e9298c6ff3d892feea5426fc09
source_path: "docs/pi-playground/EXTENSIONS-UI.md"
imported_at: "2026-04-25T16:05:44.783Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/Pi/main/docs/pi-playground/EXTENSIONS-UI.md"
---

# UI Extensions (playground)

Transcript-aligned **Pi CLI playground** stacks. These are **not** the control-plane Ink app (`npm run start`). Run from repo root with `pi` on PATH and API keys in the environment if you use models.

| Extension | Description | npm | just |
|-----------|-------------|-----|------|
| default | No extensions; Pi defaults + [`.pi/settings.json`](../../.pi/settings.json) if present | `npm run pi-play:default` | `just pi` |
| pure-focus | [`extensions/pure-focus.ts`](../../extensions/pure-focus.ts) | `npm run pi-play:pure-focus` | `just ext-pure-focus` |
| minimal | [`minimal.ts`](../../extensions/minimal.ts), [`theme-cycler.ts`](../../extensions/theme-cycler.ts); themes in [`.pi/themes/`](../../.pi/themes/) | `npm run pi-play:minimal` | `just ext-minimal` |
| cross-agent | [`cross-agent.ts`](../../extensions/cross-agent.ts), `minimal.ts`; scans `.claude/`, `.gemini/`, `.codex/`, [`.pi/agents/`](../../.pi/agents/) | `npm run pi-play:cross-agent` | `just ext-cross-agent` |
| purpose-gate | [`purpose-gate.ts`](../../extensions/purpose-gate.ts), `minimal.ts` | `npm run pi-play:purpose-gate` | `just ext-purpose-gate` |
| tool-counter | [`tool-counter.ts`](../../extensions/tool-counter.ts) | `npm run pi-play:tool-counter` | `just ext-tool-counter` |
| tool-counter-widget | [`tool-counter-widget.ts`](../../extensions/tool-counter-widget.ts), `minimal.ts`, `theme-cycler.ts` | `npm run pi-play:tool-counter-widget` | `just ext-tool-counter-widget` |
| subagent-widget | [`subagent-widget.ts`](../../extensions/subagent-widget.ts), `pure-focus.ts`, `theme-cycler.ts`; sessions under `~/.pi/agent/sessions/subagents/` | `npm run pi-play:subagent-widget` | `just ext-subagent-widget` |
| tilldone | [`tilldone.ts`](../../extensions/tilldone.ts), `theme-cycler.ts` | `npm run pi-play:tilldone` | `just ext-tilldone` |

Raw `pi` invocation examples:

```bash
pi
pi -e extensions/pure-focus.ts
pi -e extensions/minimal.ts -e extensions/theme-cycler.ts
# … same stacks as npm run pi-play:<name> / just ext-<name>
```

---

## default — Default Pi

**What it is:** Stock Pi CLI with workspace `.pi` (themes, settings) only—no repo extensions.

**Launch:** `npm run pi-play:default` or `just pi`.

**Manual test:** `pi --help` exits 0; start Pi and send a message (needs keys). Footer/status behave as Pi defaults.

---

## pure-focus

**What it is:** Hides the custom footer and clears known extension status slots so the UI is mostly conversation + editor.

**Launch:** `npm run pi-play:pure-focus`.

**Manual test:** No footer bar; no extension status text. If you stack another extension that sets status, load **pure-focus last** in `-e` order.

---

## minimal

**What it is:** Compact footer: model id + 10-block context meter. Theme cycler: **Ctrl+X** / **Ctrl+Q**, `/theme`.

**Launch:** `npm run pi-play:minimal`.

**Manual test:** Footer shows `[####------] nn%`; theme changes and swatch/widget from `theme-cycler`.

---

## cross-agent

**What it is:** Discovers commands (`.md` → `/name`), skills (`/skill:name`), agents (`@name`) from `.claude`, `.gemini`, `.codex`, and `.pi/agents`. Registers slash commands at load time. Uses minimal footer (no theme shortcuts unless you stack `theme-cycler`).

**Launch:** `npm run pi-play:cross-agent`.

**Manual test:** On session start, colored summary of discovered paths; try `/prime` if [`.claude/commands/prime.md`](../../.claude/commands/prime.md) exists.

---

## purpose-gate

**What it is:** On startup, prompts for session purpose; shows a persistent **PURPOSE** widget; injects `<purpose>` into the system prompt; blocks normal input until purpose is set.

**Launch:** `npm run pi-play:purpose-gate`.

**Manual test:** Answer the purpose dialog; widget stays visible; try sending a message only after purpose is set.

---

## tool-counter

**What it is:** Two-line footer: model + context meter + token/cost on line 1; cwd/branch + per-tool tallies on line 2.

**Launch:** `npm run pi-play:tool-counter`.

**Manual test:** Run a turn that uses tools; footer tallies update.

---

## tool-counter-widget

**What it is:** Above-editor widget with tallies per tool (colored blocks) + minimal context footer + full theme cycler (shortcuts + `/theme`).

**Launch:** `npm run pi-play:tool-counter-widget`.

**Manual test:** Widget shows `Tools (n):` after tool calls; **Ctrl+X** cycles themes.

---

## subagent-widget

**What it is:** `/sub <task>` spawns background Pi processes; live widgets; `/subcont`, `/subrm`, `/subclear` (see extension header).

**Launch:** `npm run pi-play:subagent-widget`.

**Manual test:** In a real terminal with keys: `/sub list files in extensions/` and watch widget progress. Pure-focus clears chrome; theme-cycler still available.

---

## tilldone

**What it is:** Agent tool `tilldone` for task lists (add/toggle/done, footer + status + widget). **`clear` and replacing a list via `new-list` use `ctx.ui.confirm`** before wiping tasks.

**Launch:** `npm run pi-play:tilldone`.

**Manual test:** Ask the model to use tilldone `add` tasks, then complete them; try `clear` and confirm/cancel dialogs.

---

## Automated smoke (no full TUI)

From repo root, if `pi` is on PATH:

```bash
npm run pi-play:verify
npm run pi-play:verify-if-available   # skips cleanly if pi missing
```

This only checks `pi <stack> --help` loads each bundle—not interactive proof.
