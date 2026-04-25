---
repo_name: Pi
repo_visibility: private
source_type: github
branch: main
commit_sha: 1a669c97bc2760e9298c6ff3d892feea5426fc09
source_path: "e2e-test-report.md"
imported_at: "2026-04-25T16:01:56.260Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/Pi/main/e2e-test-report.md"
archived_at: "2026-04-25T16:05:44.796Z"
---

# E2E Test Report — pi-multi-team-local
**Date:** 2026-04-04
**Mode:** PI_MOCK=1 (no real API calls)
**Tester:** Claude (automated via osascript)
**App version:** post Phase 5 polish (chat-ui.tsx, main.tsx)

---

## 1. Commands Run

```
# Precheck (prior session)
npm run typecheck
npm run lint

# Interactive run (this session)
PI_MOCK=1 npm run start

# In-app sequence (osascript keystroke delivery):
/help
d                          # toggle debug on
d                          # toggle debug off
/debug                     # toggle debug on (via command)
ls -la                     # shell-guard check
/reload
# Prompt A
show the most important files in this repo
# Prompt B
ask all teams for 2 improvements to this project
# Prompt C
plan -> engineer -> validate a small UI/UX improvement for this app that makes the interface easier to understand for a first-time user
# Prompt D
@engineering inspect the backend and propose one safe refactor
# Prompt E
@validation review recent changes and report risks
Ctrl+C                     # clean exit

# Artifact inspection (post-exit)
ls .runtime/sessions/
cat .runtime/sessions/2026-04-04T05-45-36-aCzcVdd-/summary.md
cat .runtime/sessions/2026-04-04T05-45-36-aCzcVdd-/artifacts.json
cat .runtime/sessions/2026-04-04T05-45-36-aCzcVdd-/policy-violations.json
cat .runtime/sessions/2026-04-04T05-45-36-aCzcVdd-/routing-decisions.jsonl
cat .runtime/sessions/2026-04-04T05-45-36-aCzcVdd-/topology.json
cat .runtime/sessions/2026-04-04T05-45-36-aCzcVdd-/timing.json
head -30 .runtime/sessions/2026-04-04T05-45-36-aCzcVdd-/git-diff.patch
cat .runtime/sessions/2026-04-04T05-45-36-aCzcVdd-/changed-files.json
ls .runtime/sessions/2026-04-04T05-45-36-aCzcVdd-/artifacts/
```

---

## 2. Real Use Case Walkthrough

**Use case:** "Inspect this repo, identify a safe UI/UX improvement, plan it, implement it, validate it, produce artifacts."

This was exercised via Prompt C: `plan -> engineer -> validate a small UI/UX improvement for this app that makes the interface easier to understand for a first-time user`.

**What happened (mock):** The orchestrator dispatched the Planning Lead, Engineering Lead, and Validation Lead in sequence. Each returned a mock JSON contract. Session `2026-04-04T05-44-40-O1BJvhNx` was created with 7 artifacts (3 per lead plus mock.txt shared). Routing mode was the default `all_teams` (no `@mention` prefix). The status bar showed the full agent tree with per-agent token and cost tracking after the turn completed.

In live mode this would be the real workflow — but in mock mode the "improvement" is never actually reasoned about; each agent returns the same canned JSON with `"objective":"mock"`.

---

## 3. What Worked

- **App startup:** `PI_MOCK=1 npm run start` launched cleanly every time. Header rendered correctly with the two system welcome messages.
- **Workers hidden by default:** StatusBar confirmed `Tab=workers (off by default)` on first render without toggling.
- **`d` key debug toggle:** System messages `· Debug on` and `· Debug off` appeared correctly on consecutive presses.
- **`/debug` command toggle:** Message `· Debug mode on — JSON shown raw` confirmed.
- **Shell guard:** Input `ls -la` correctly intercepted: `"ls" looks like a shell command. Run it in your terminal after exiting with Ctrl+C.`
- **`/reload` command:** `· Config reloaded (multi-team.yaml)` confirmed on first attempt after Enter was submitted.
- **All-team prompts (A, B, C):** All three leads (Planning, Engineering, Validation) responded. Session created, artifact count 7, path printed to screen.
- **`@engineering` mention routing (Prompt D):** Only Orchestrator + Engineering Lead fired. Planning and Validation token counts remained at their prior value (420 tokens) while Engineering jumped to 560. Artifact count was 3 (engineering-only).
- **`@validation` mention routing (Prompt E):** Only Orchestrator + Validation Lead fired. QA Engineer and Security Reviewer workers within validation team also produced artifacts (`qa_engineer.md`, `security_reviewer.md`). Planning and Engineering remained at prior counts.
- **Agent tree in status bar:** After each turn, the full tree (Orch → Plan Lead, Eng Lead, Val Lead → workers) rendered with per-agent cost and token counts. Token counts accumulated correctly across turns.
- **Session path on-screen:** `· session → /Users/jaywest/.../sessions/<id>` printed after every completed turn.
- **Clean exit:** `Ctrl+C` returned to `jaywest@jays-MacBook-Pro pi-multi-team-local %` shell prompt with no error output.

---

## 4. What Failed or Was Awkward

- **Prompt B double-send required:** The first keystroke batch for Prompt B fired text but Enter didn't register, leaving the text stuck in the input buffer. A second focused osascript block was needed to deliver Enter. Root cause: Terminal focus was not reliably held between the text keystroke and the return keystroke across two separate tool calls. Workaround: combine keystroke + return in a single `tell process` block with `delay 0.5` between them.

- **Debug mode was ON for all prompts:** The UX checks earlier in the session toggled debug on and left it on. All Prompts A–E therefore displayed raw JSON output instead of the formatted `tryParseContract` view. This means the `lineAccent`, `isBlockedMsg` blocked-message indicator, and `tryParseContract` formatted display were **not visually exercised** during the prompt run. They require debug OFF + a real contract-formatted response.

- **Mock agent responses have no semantic content:** All artifact files contain only `# Mock artifact\nagent: <name>\nrole: <role>`. The system correctly tracks them as artifacts and reports `validation_status: pass`, but there is no way to verify that meaningful contract parsing, `lineAccent`, or blocked-message display work correctly in mock mode alone.

- **timing.json shows all zeros:** In mock mode, `elapsed_ms` is 0 for all agents and `totals_ms` is 0. The timing data file exists but is not meaningful.

- **plans/ and validation/ dirs are empty:** In mock mode these subdirectories are created but contain nothing. In live mode they would hold structured plan and validation output files.

---

## 5. Interactive UX Verification

Behaviors confirmed via actual osascript keystroke delivery and Terminal content reads:

| Feature | Verified? | Evidence |
|---|---|---|
| Header renders on startup | ✅ Yes | Two system welcome messages visible |
| Workers hidden by default | ✅ Yes | StatusBar: `Tab=workers (off by default)` |
| `d` toggles debug on | ✅ Yes | `· Debug on` system message |
| `d` toggles debug off | ✅ Yes | `· Debug off` system message |
| `/debug` command | ✅ Yes | `· Debug mode on — JSON shown raw` |
| Shell guard intercepts `ls -la` | ✅ Yes | Error message with shell command warning |
| `/reload` reloads config | ✅ Yes | `· Config reloaded (multi-team.yaml)` |
| Tab toggles workers | ❌ Not verified | Tab is intercepted by Terminal's UI layer before reaching Ink raw mode |
| `lineAccent` colored lines | ❌ Not verified | Debug was ON; raw JSON shown instead |
| `isBlockedMsg` red indicator | ❌ Not verified | No blocked responses in mock mode |
| `tryParseContract` formatted view | ❌ Not verified | Debug was ON throughout prompt run |
| `@mention` routing | ✅ Yes | D and E correctly routed to single teams |
| Session path in status bar | ✅ Yes | Session ID displayed in bottom bar after each turn |
| Agent tree in status bar | ✅ Yes | Full tree with costs/tokens post-turn |
| Ctrl+C clean exit | ✅ Yes | Returned to shell prompt |

---

## 6. Session Artifact Verification

Inspected session: `2026-04-04T05-45-36-aCzcVdd-` (Prompt E — `@validation`)

| File | Present | Content meaningful? |
|---|---|---|
| `summary.md` | ✅ | Lists 5 changed files (package.json, 2 scripts, chat-ui.tsx, main.tsx) |
| `artifacts.json` | ✅ | 3 artifacts, all validation_status=pass, 0 missing_references |
| `policy-violations.json` | ✅ | `{"violations":[]}` — clean |
| `routing-decisions.jsonl` | ✅ | Correctly identifies `team_mention` mode, routes to validation team only |
| `topology.json` | ✅ | Lists all 3 configured teams: planning, engineering, validation |
| `timing.json` | ✅ (present) | All zeros in mock mode — not meaningful |
| `git-diff.patch` | ✅ | Real diff of actual recent changes to the repo |
| `changed-files.json` | ✅ | 5 files listed, `generated_at` timestamp correct |
| `artifacts/` | ✅ | 3 files: mock.txt (validation_lead), qa_engineer.md, security_reviewer.md |

Additional directories present but not fully inspected: `agents/`, `memory_snapshots/`, `plans/` (empty), `prompts/`, `transcripts/`, `validation/` (empty), `conversation.jsonl`, `events.jsonl`.

The `artifacts.json` `produced_by_agent` array correctly attributes each artifact to its generating agent. The `required_expected` array correctly specifies that orchestrator and validation_lead owed `report`, `test_report`, and `risk_review` kind artifacts — and `missing_required_by_agent` is empty, meaning all required artifacts were produced (even as mock stubs).

---

## 7. Live Mode Result

**Skipped.** No `ANTHROPIC_API_KEY` was available in the test environment. Live mode requires the key to be set; without it the app would fall back to an error on first real agent call. Cannot report live mode behavior from this run.

To test live mode: set `ANTHROPIC_API_KEY` and run `npm run start` (without `PI_MOCK=1`). The first real prompt would take 30–120s per turn depending on model and prompt complexity.

---

## 8. Top 3 Practical Friction Points

**1. Keystroke delivery is fragile across osascript tool-call boundaries.**
Text and Enter must be in the same `tell process` block with an explicit `delay` between them. Splitting them across two tool calls causes Terminal to lose focus and drop the Enter. This is an automation-layer issue, not a bug in the app — but it means any automated test harness using osascript needs to be written carefully. Human users typing naturally will never hit this.

**2. Debug mode state persists across the session and is easy to leave on.**
There is no visual indicator in the UI that debug is ON between messages — only the system message at toggle time. A user who toggled `/debug` earlier in a session will see raw JSON for all subsequent agent responses, including the formatted contract view, `lineAccent`, and blocked-message indicator. A persistent `debug:on` badge in the status bar exists (visible in the captured output: `workers:off  debug:on`) but is easy to miss. Consider making it more prominent or resetting debug to off on `/reload`.

**3. Mock mode cannot verify the most important new display features.**
`lineAccent` (per-line accent coloring), `isBlockedMsg` (blocked message red border indicator), and `tryParseContract` (JSON contract pretty-printer) all require: (a) debug OFF, and (b) a realistic contract-formatted response from an agent. Mock mode produces neither. Verifying these features requires either a live API call or a purpose-built fixture test that injects a realistic agent response into the chat state.

---

## 9. Final Verdict

**The system works correctly as a mock orchestration shell.** All routing, session artifact creation, config reload, shell guard, debug toggle, and clean exit behaviors function as designed. The status bar, agent tree, session path display, and welcome messages all render correctly.

**The Phase 5 UI/UX polish is present and mechanically correct** — the code compiles cleanly, passes Biome lint, and the features exist in the rendered output. However, `lineAccent`, `isBlockedMsg`, and `tryParseContract` display could not be visually confirmed in this test run due to debug mode being active during the prompt sequence. These features need a targeted fixture test or a live-mode run with debug OFF to be fully verified.

**No regressions found.** None of the existing features (routing, shell guard, session artifacts, agent tree) were broken by the Phase 5 changes.

**Recommended next steps:**
1. Add a fixture-based unit test that mounts a `MessageRow` with a known contract JSON body and debug:off, and asserts that `lineAccent` colors and `isBlockedMsg` indicator render.
2. Run one live-mode prompt (with API key) with debug OFF to confirm the full display pipeline end-to-end.
3. Investigate Tab key delivery to Ink — currently unverifiable via osascript because Terminal intercepts `key code 48` before it reaches the process stdin.
