# Agentic-KB Refinery Run — BLOCKED

- **Job name:** agentic-kb-refinery-run
- **Job ID:** unknown / not provided by scheduler
- **Timestamp:** 2026-06-29T06:25:19-0500
- **Failed stage:** Pre-run dirty-worktree safety check, before any Refinery processing or wiki writes
- **Result:** Blocked; no raw sources processed

## Blocked reason

`git status --porcelain` showed a dirty file outside the user-authorized Refinery write paths and outside the two exact noisy log exceptions allowed by the job prompt.

User-authorized noisy log exceptions for this run:
- `logs/web-server-error.log`
- `logs/web-server.log`

Blocking dirty file:
- `logs/kb-dev-server.log`

Full pre-run status observed:

```text
 M .night-shift/state/audit-state.json
 M .night-shift/state/editor-state.json
 M logs/kb-dev-server.log
?? briefings/2026-06-26.md
?? briefings/errors/agentic-kb-audit-run-2026-06-29-0005.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-28-0557.md
?? briefings/scout-2026-06-26.md
?? briefings/scout-2026-06-28.md
?? briefings/scout-2026-06-29.md
```

Notes:
- `.night-shift/state/*` and `briefings/*` are expected/allowed Refinery write paths, so they did not block.
- `logs/kb-dev-server.log` is mentioned as an exception in `playbooks/refinery-run.md`, but the user-level job prompt was narrower and allowed only `logs/web-server-error.log` and `logs/web-server.log`. Per `hermes-obsidian-knowledge-loop` run notes, the prompt-specific dirty-worktree policy controls.

## Files read

- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/refinery-run.md`
- `wiki/index.md`
- `wiki/log.md`
- `.night-shift/state/refinery-processed.json`
- Hermes skill: `hermes-obsidian-knowledge-loop`
- Hermes skill reference: `references/agentic-kb-refinery-run-notes.md`
- Hermes skill: `brain-ops`

## Files written or attempted

- Written: `briefings/errors/agentic-kb-refinery-run-2026-06-29-0625.md`

No wiki pages, raw files, state files, or normal Refinery briefing were modified by this run.

## Files needing review

- `logs/kb-dev-server.log` — dirty and outside this run's authorized ignore list.
- Existing pre-run dirty/untracked expected-path files may also need review, but they did not block this run:
  - `.night-shift/state/audit-state.json`
  - `.night-shift/state/editor-state.json`
  - `briefings/2026-06-26.md`
  - `briefings/errors/agentic-kb-audit-run-2026-06-29-0005.md`
  - `briefings/errors/agentic-kb-refinery-run-2026-06-28-0557.md`
  - `briefings/scout-2026-06-26.md`
  - `briefings/scout-2026-06-28.md`
  - `briefings/scout-2026-06-29.md`

## Rollback guidance

Only this error briefing was created by the run. If Jay wants to remove the failed-run record after review, delete:

```bash
rm briefings/errors/agentic-kb-refinery-run-2026-06-29-0625.md
```

Do not roll back or clean `logs/kb-dev-server.log` automatically from an unattended Refinery job; it was pre-existing state outside the permitted mutation scope.

## Safest next action

Decide whether `logs/kb-dev-server.log` should be added to this scheduled job's user-level dirty-worktree allowlist, committed/cleaned separately, or left as a hard block. Then rerun the Refinery job.
