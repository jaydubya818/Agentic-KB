# notes-to-factory — 2026-11-01

## 1. Ledger

**Merges:** 1

| Repo | SHA | Source | Gate reached | Revert |
|---|---|---|---|---|
| AI-FDE-Agent | `d26fa50` | backlog `docs/NIGHTLY-BACKLOG.md` 2026-09-01 — "The JavaScript half has no unit test runner" | Full code gate: typecheck, lint, test (6/6), production build, failing-then-passing regression (OPERATOR_ID break/revert), fresh-clone install+test+lint+typecheck+build all green | `git clone https://github.com/jaydubya818/AI-FDE-Agent && cd AI-FDE-Agent && git revert -m 1 d26fa50 && git push origin main` |

**PRs opened:** 0.

## 2. ACTION REQUIRED

- **AI-FDE-Agent** — the new `apps/web` unit test runner (`pnpm test`) is not wired into `.github/workflows/verify.yml`'s javascript job. This run has no `workflow` scope. Whoever has that scope should add a `pnpm test` step so the runner is part of the actual CI check cycle, which is what the backlog item was really asking for.
- **Twinz** — leaked `VERCEL_TOKEN` (open since 2026-09-01) still redacted at HEAD only, rotation on the Vercel dashboard unconfirmed. Not re-checked this run.
- **Twinz** — backlog is stale: 12 Open items all dated 2026-09-01, referencing PRs/branches not re-verified since. Not drained from this run; needs a dedicated re-audit (confirm which PRs/branches still exist) before any item there can be trusted as a drain candidate.
- **SellerFi** — two 2026-08-28/08-31 items (merge nightly branch; rotate committed Stripe webhook secret) remain unverified. Open PRs re-confirmed via `gh pr list`: #221–#224, unchanged.
- **MissionControl** — open PRs re-confirmed via `gh pr list`: #241 (changelog links) and #242 (todo links), both docs-only `daily-fix` PRs awaiting human merge.
- **obsidian-vault** — `.obsidian-api-key` still tracked and unrotated. Not re-checked this run, carried forward from 2026-10-28.
- Kill switch: not set. Disk: 71 GiB free on `/`. No disk pressure.

## 3. Harvest

| Class | Count |
|---|---|
| Apple Notes seen (modified since last run) | 1 |
| — skipped, body < 120 bytes (Screen 2) | 1 |
| — skipped, credential-shaped (Screen 1) | 0 |
| — ingested into `raw/clippings/` | 0 |
| KB candidates/action-tracker/recently-added reviewed | yes, nothing actionable |

**Rejected items, with reason:**

- Apple Note `p9874` ("New Note", modified 2026-10-31 11:10 local) — body was a single object-replacement character (pasted image/screenshot, no text). Under the 120-byte floor; skipped per Screen 2.
- `wiki/action-tracker.md` Open section — empty.
- `wiki/candidates.md`, `wiki/recently-added.md` — all single-source research themes or KB syntheses; none maps to a repo code change.

## 4. Proposals

No harvest-sourced `IMPLEMENT` decisions this run (0 work orders from Notes/KB).

**Drain-phase screening** (Phase 2e), since harvest came up empty:

| Item | Repo | Decision | Reason |
|---|---|---|---|
| Persist `LoopResult.sanitizations` to its own artifact | Agentic-Pi-Harness | `NOT_APPLICABLE` (re-confirmed) | Its own 2026-10-29 near-miss sub-bullet: `docs/SCHEMAS.md` §5 still documents the golden path as emitting no sidecars for these schemas; wiring it reverses a documented statement — a decision, not a patch. Looked like the strongest candidate from its top line alone; the full entry (read this run, not just the first line) disqualifies it. |
| `WorkerModeControls.allowExclusiveTools` inert control, metrics-sink throw, Level C `--semantic` can't fail, `PiHarnessError.retryable` unused, `write_file` magic string ×3, HOOK-SECURITY.md gap, bridge drops constraints, `SessionContextSchema`/`ToolAuditRecordSchema` inert, ESLint path | Agentic-Pi-Harness | `BACKLOG` (already recorded) | Each explicitly self-declares "a decision, not a patch" / "a design proposal" / "Tier B" in its own text, or fails the no-interface-change bar. |
| Worker success-claim gate, WorkspaceContext leak, `loadContextBundle` host paths, `"bus"` memory class, per-agent contract unused, console test coverage, no CI, `actor` filter bug, `HARNESS_OPERATOR_TOKEN` shared secret, nightly-branch housekeeping pointer, console action-guard mirroring, unbounded state growth, `evaluateStepPolicy` trust | hermes-harness-missioncontrol | `BACKLOG` (already recorded) | Same pattern: decision-for-Jay, response-shape/interface change, or auth/secrets exclusion. The `actor`-filter item (the exact example named in this job's own calibration note) is explicitly recorded as "the fix is a decision" between two incompatible schema changes. |
| Eight dead chapter links | ai-software-factory-mastery | `NOT_APPLICABLE` | Explicitly "a content decision for the maintainer" (publish vs. rewrite vs. plain-text). |
| (none) | morning-review | — | Open backlog section is empty. |
| JavaScript half has no unit test runner | **AI-FDE-Agent** | **IMPLEMENT** | Pure, additive dev-tooling gap: `lib/api.ts`/`lib/hosted-demo.ts` have real pure/deterministic logic (`getAuthLoginUrl`, `ApiError`, `hostedDemoRequest`'s Node-side fallback) and zero unit coverage. No existing framing as a decision. Acceptance evidence observed: new tests red on a deliberate break, green after revert; full gate green; fresh clone clean. |

## 5. Backlog delta

| Repo | Added | Closed | Moved to not-applicable |
|---|---|---|---|
| AI-FDE-Agent | 0 | 1 ("no unit test runner") | 0 |
| Agentic-Pi-Harness | 0 | 0 | 0 |
| hermes-harness-missioncontrol | 0 | 0 | 0 |
| ai-software-factory-mastery | 0 | 0 | 0 |
| All others | 0 | 0 | 0 |

## 6. Hygiene

- Agentic-Pi-Harness: created and removed one worktree (`ntf/2026-11-01-sanitization-artifact`) before any edits, once its backlog entry's own near-miss sub-bullet disqualified it. Worktree count confirmed back to baseline (4) immediately after removal.
- AI-FDE-Agent: worked in a plain `git clone` under `/tmp/ntf/` (this repo has no persistent local checkout — routing table lists it as clone-only) plus one fresh-clone copy for the pre-push verification gate. Both removed after the push succeeded. No worktrees left open anywhere.
- No stale-worktree counts worth flagging beyond last run's carried-forward MissionControl (66) / SellerFi (8) / Agentic-KB (3) figures, not re-counted this run.
