# Agentic-KB Refinery Run — Blocked

- **Job name:** agentic-kb-refinery-run
- **Job ID:** unavailable (scheduled cron context did not expose a job ID)
- **Timestamp:** 2026-06-24 03:16:21 PDT
- **Failed stage:** pre-run dirty-worktree safety check
- **Status:** blocked before wiki/raw processing

## Blocked reason

The Refinery Run must run `git status --porcelain` before making changes and stop if the worktree has dirty files outside the expected Refinery write paths and outside exactly these allowed noisy logs:

- `logs/web-server-error.log`
- `logs/web-server.log`

The worktree contains dirty files outside that allowed set, so this run did not process `raw/inbox/` or raw files marked `status: unprocessed`.

## Dirty files that blocked the run

```text
 M logs/audit.log
 M logs/kb-dev-server.log
 M playbooks/editor-run.md
 M playbooks/refinery-run.md
 M playbooks/scout-run.md
 M raw/reading-list.md
?? raw/framework-docs/ar9av-obsidian-wiki.md
?? raw/framework-docs/chopratejas-headroom.md
?? raw/framework-docs/langchain-ai-rag-from-scratch.md
?? raw/framework-docs/mgechev-skills-best-practices.md
?? raw/framework-docs/microsoft-skillopt.md
?? raw/framework-docs/rohitg00-ai-engineering-from-scratch.md
?? raw/framework-docs/x-twitter-2066530299467706495.md
```

Note: dirty files under `.night-shift/state/` and `briefings/` were not blockers because they are expected Refinery write paths. The two explicitly allowed noisy logs, if present, would also be ignored; they were not the blocking issue here.

## Files read

- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/refinery-run.md`
- Git status output from `git status --porcelain`

## Files written or attempted

- Wrote this error briefing: `briefings/errors/agentic-kb-refinery-run-2026-06-24-0316.md`

No wiki summaries, concepts, patterns, framework pages, recipes, evaluations, personal pages, index updates, log updates, or refinery state updates were attempted.

## Files that may need review

Review the blocking dirty files listed above, especially:

- `playbooks/refinery-run.md` — it currently includes broader ignore exceptions than the stricter cron instruction supplied for this run.
- `raw/reading-list.md` and untracked `raw/framework-docs/*.md` — these are raw/intake/source files and should not be mutated by this Refinery job.
- `logs/audit.log` and `logs/kb-dev-server.log` — these are not in the strict two-file noisy-log allowlist for this run.

## Rollback guidance

Do not blindly reset the worktree. Several dirty files may be intentional outputs from other Night Shift jobs or human/agent intake. Safest rollback/reconciliation path:

1. Inspect each dirty file with `git diff -- <path>` or `git status --porcelain`.
2. Commit or intentionally stash accepted playbook/state/briefing changes.
3. Decide whether raw framework-doc stubs are valid Scout outputs and should be tracked.
4. If the stricter dirty-worktree policy should be permanent, update playbooks in a separate deliberate change.
5. Re-run the Refinery Run only after the worktree has no dirty files outside expected Refinery paths and the two exact noisy logs allowed by the cron instruction.

## Safest next action for Jay

Reconcile or commit the blocking dirty files, then re-run the Agentic-KB Refinery Run. Do not widen the ignore allowlist unless that is an explicit policy decision; today's cron instruction intentionally allowed only `logs/web-server-error.log` and `logs/web-server.log`.
