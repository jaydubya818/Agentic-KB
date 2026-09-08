# Agentic-KB Editor Run — BLOCKED (Dirty Worktree)

- **Job name:** agentic-kb-editor-run
- **Job ID:** scheduled cron (2026-09-08 early-morning Editor Run)
- **Timestamp:** 2026-09-08T08:03:59-0700 (PDT)
- **Phase/stage where it failed:** Pre-run dirty-worktree gate (before any wiki/state/briefing writes)
- **Status:** BLOCKED — job halted before making changes

## Error / Blocked Reason

`git status --porcelain` returned dirty files outside the Editor Run's allowed write paths
(`.night-shift/state/`, `briefings/`, `wiki/syntheses/`) and outside the two exact noisy-log
exceptions (`logs/web-server-error.log`, `logs/web-server.log`) that the user instruction
and `playbooks/editor-run.md` permit ignoring.

Per the user's strict instruction and the playbook's pre-run gate, the job stops before
making changes. It does NOT attempt to clean, stage, or commit these pre-existing dirty
files.

## Dirty Files Found (outside allowed Editor write paths)

| Path | Status | Why it blocks |
|---|---|---|
| `raw/framework-docs/linkedin-com-posts-samiran-sarkar-ai-agenticai-agentharness-aiagents-activity-7500938393292468225-2-zj.md` | `??` untracked | Inside protected `raw/` — Editor must never modify raw files. Also not an Editor write path. |
| `wiki/lint-report.md` | ` M` modified | Editor write paths are `.night-shift/state/`, `briefings/`, `wiki/syntheses/`. `wiki/lint-report.md` is not one of them. |
| `wiki/repos/agentic-kb/bus/escalation/escalation-2026-09-08-001.md` | `??` untracked | Not an Editor write path; appears to be from a different job/agent. |

### Files inside the allowed/ignored set (do NOT block — listed for transparency)

| Path | Status | Notes |
|---|---|---|
| `.night-shift/state/scout-processed.json` | ` M` modified | `.night-shift/state/` is an allowed Editor write path — would not block. Likely left dirty by a prior Scout run. |
| `briefings/scout-2026-09-07.md` | `??` untracked | `briefings/` is an allowed Editor write path — would not block. |

## Files Read (this run)

- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/editor-run.md`
- `.night-shift/state/editor-state.json`
- `git status --porcelain`, `git log --oneline -5`, `git diff --name-only -- raw`

## Files Written or Attempted

- None. The job halted at the pre-run gate before any wiki, state, or briefing writes.
- This error briefing is the only write (to the allowed `briefings/errors/` path).

## Files That May Need Review

- `raw/framework-docs/linkedin-com-posts-samiran-sarkar-...md` — untracked capture in
  protected `raw/`. Likely written by a Scout run or external capture process that did not
  commit. Jay or the Scout job owner should decide whether to commit, move to
  `raw/inbox/`, or remove.
- `wiki/lint-report.md` — modified but uncommitted. The last commit message mentions a
  lint run that was skipped due to an API error (`e31cb2b`). This modification may be a
  partial lint result that was never committed; review before committing.
- `wiki/repos/agentic-kb/bus/escalation/escalation-2026-09-08-001.md` — untracked
  escalation note under `wiki/repos/agentic-kb/bus/`. Appears to originate from a
  different job/agent (runtime triage / escalation bus), not the Editor. Review whether
  this path schema is intended and whether it should be committed by its owning job.

## Rollback Guidance

No rollback needed — the Editor made no changes this run. The worktree state is
exactly as it was before the job started.

## Safest Next Action for Jay

1. Review the three blocking dirty files above.
2. Decide for each: commit, remove, or assign to the owning job.
3. Specifically for `raw/framework-docs/linkedin-com-posts-samiran-sarkar-...md`: since
   `raw/` is source-of-truth and protected, confirm the Scout run (or capture process)
   that created it commits it or routes it to `raw/inbox/` instead.
4. Once the worktree is clean outside the Editor's allowed paths, re-run the Editor Run
   (or let the next scheduled run proceed). The Editor will then perform its normal
   24h-change review and synthesis pass.

If Jay wants the Editor to proceed despite the dirty worktree, that requires explicit
approval to override the dirty-worktree gate — do not self-authorize.
