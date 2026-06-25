# Agentic-KB Audit Run — Blocked

- **Job name:** agentic-kb-audit-run
- **Job ID:** unavailable in cron context
- **Timestamp:** 2026-06-21T22:05:56-0700
- **Failed stage:** Pre-write dirty-worktree safety check
- **Status:** blocked

## Reason
The audit run is report-only but still writes an audit briefing and audit state. Night Shift rules require `git status --porcelain` before any scheduled/autonomous write and require the job to stop if there are dirty files outside the job's expected write paths, ignoring only `logs/web-server-error.log` and `logs/web-server.log`.

`git status --porcelain` showed pre-existing dirty/untracked files outside this audit job's allowed write set:

```text
M .night-shift/state/editor-state.json
 M logs/audit.log
 M logs/kb-dev-server.log
 M playbooks/editor-run.md
 M playbooks/refinery-run.md
 M playbooks/scout-run.md
 M raw/reading-list.md
?? .night-shift/state/refinery-processed.json
?? .night-shift/state/scout-processed.json
?? briefings/2026-06-16.md
?? briefings/errors/agentic-kb-editor-run-2026-06-17-0626.md
?? briefings/errors/agentic-kb-editor-run-2026-06-18-0649.md
?? briefings/errors/agentic-kb-editor-run-2026-06-20-0626.md
?? briefings/errors/agentic-kb-editor-run-2026-06-21-0626.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-17-0316.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-18-0330.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-19-0327.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-20-0316.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-21-0315.md
?? briefings/errors/agentic-kb-scout-run-2026-06-16-2306.md
?? briefings/errors/agentic-kb-scout-run-2026-06-17-2320.md
?? briefings/errors/agentic-kb-scout-run-2026-06-18-1157.md
?? briefings/errors/agentic-kb-scout-run-2026-06-18-2310.md
?? briefings/errors/agentic-kb-scout-run-2026-06-19-2305.md
?? briefings/errors/agentic-kb-scout-run-2026-06-20-2306.md
?? briefings/refinery-2026-06-16.md
?? briefings/scout-2026-06-15.md
?? briefings/scout-2026-06-18.md
?? raw/framework-docs/ar9av-obsidian-wiki.md
?? raw/framework-docs/chopratejas-headroom.md
?? raw/framework-docs/langchain-ai-rag-from-scratch.md
?? raw/framework-docs/mgechev-skills-best-practices.md
?? raw/framework-docs/microsoft-skillopt.md
?? raw/framework-docs/rohitg00-ai-engineering-from-scratch.md
?? raw/framework-docs/x-twitter-2066530299467706495.md
```

Several dirty paths are especially relevant to safety:
- `raw/reading-list.md` is modified.
- New `raw/framework-docs/*.md` files are untracked.
- Night Shift playbooks have local modifications.
- Log files dirty are not the two explicitly allowlisted noisy logs.

## Files read
- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/audit-run.md`
- `.night-shift/state/audit-state.json`
- `git status --porcelain` output
- File listings under `wiki/` and `raw/` were queried before the dirty-worktree block was enforced.

## Files written or attempted
- Written: `briefings/errors/agentic-kb-audit-run-2026-06-21-2205.md`
- Attempted: normal audit briefing `briefings/audit-2026-06-21.md` was not written.
- Attempted: audit integrity checks were not completed.

## Files that may need review
- `raw/reading-list.md`
- `raw/framework-docs/ar9av-obsidian-wiki.md`
- `raw/framework-docs/chopratejas-headroom.md`
- `raw/framework-docs/langchain-ai-rag-from-scratch.md`
- `raw/framework-docs/mgechev-skills-best-practices.md`
- `raw/framework-docs/microsoft-skillopt.md`
- `raw/framework-docs/rohitg00-ai-engineering-from-scratch.md`
- `raw/framework-docs/x-twitter-2066530299467706495.md`
- `playbooks/editor-run.md`
- `playbooks/refinery-run.md`
- `playbooks/scout-run.md`
- `.night-shift/state/editor-state.json`
- `.night-shift/state/refinery-processed.json`
- `.night-shift/state/scout-processed.json`
- `logs/audit.log`
- `logs/kb-dev-server.log`
- Prior untracked Night Shift briefings and error briefings listed above.

## Rollback guidance
No wiki or raw files were modified by this audit run. The audit-run artifacts created/updated are this error briefing and `.night-shift/state/audit-state.json` with `status: blocked_dirty_worktree`. If these audit-run artifacts are not useful, remove the error briefing and restore the prior audit state from git or backup:

```bash
rm briefings/errors/agentic-kb-audit-run-2026-06-21-2205.md
git checkout -- .night-shift/state/audit-state.json
```

Do not clean or reset the pre-existing dirty files until Jay decides whether they should be committed, ignored, or discarded.

## Safest next action
Review and resolve the dirty worktree first. Minimum safe path: commit or intentionally stash the Night Shift/playbook/raw changes, add any legitimate generated briefings/state files to git or `.gitignore` policy, then re-run the audit. The audit should not run against this worktree until those changes are accounted for.
