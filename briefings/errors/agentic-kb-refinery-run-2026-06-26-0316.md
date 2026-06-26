# Agentic-KB Refinery Run — Blocked

- **Job name:** agentic-kb-refinery-run
- **Job ID:** unavailable in cron context
- **Timestamp:** 2026-06-26T03:16:27-0700
- **Failed stage:** pre-run dirty-worktree safety check, before any Refinery processing or wiki writes

## Blocked reason

The run stopped because `git status --porcelain` showed dirty files outside the paths allowed by the job-level Refinery safety policy.

The job instruction allows dirty files only under expected Refinery write paths:

- `.night-shift/state/`
- `briefings/`
- `wiki/summaries/`
- `wiki/concepts/`
- `wiki/patterns/`
- `wiki/frameworks/`
- `wiki/recipes/`
- `wiki/evaluations/`
- `wiki/personal/`
- `wiki/index.md`
- `wiki/log.md`

It also allows exactly these noisy logs:

- `logs/web-server-error.log`
- `logs/web-server.log`

Current dirty files outside that allowlist:

```text
 M logs/kb-dev-server.log
 M wiki/syntheses/synthesis-react-as-native-trajectory-eval.md
?? wiki/syntheses/synthesis-skills-as-evaluable-artifacts.md
```

Full `git status --porcelain` observed:

```text
 M .night-shift/state/editor-state.json
 M logs/kb-dev-server.log
 M wiki/concepts/skills.md
 M wiki/index.md
 M wiki/log.md
 M wiki/syntheses/synthesis-react-as-native-trajectory-eval.md
?? briefings/2026-06-25.md
?? briefings/errors/agentic-kb-scout-run-2026-06-25-2305.md
?? wiki/syntheses/synthesis-skills-as-evaluable-artifacts.md
```

## Files read

- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/refinery-run.md`
- Hermes skill reference: `hermes-obsidian-knowledge-loop/references/agentic-kb-refinery-run-notes.md`

## Files written or attempted

- Written: `briefings/errors/agentic-kb-refinery-run-2026-06-26-0316.md`
- No raw files, wiki pages, summaries, state files, or normal refinery briefing were modified by this run.

## Files that may need review

- `logs/kb-dev-server.log` — dirty runtime log not allowed by this job prompt.
- `wiki/syntheses/synthesis-react-as-native-trajectory-eval.md` — dirty synthesis page outside Refinery expected paths.
- `wiki/syntheses/synthesis-skills-as-evaluable-artifacts.md` — untracked synthesis page outside Refinery expected paths.

## Rollback guidance

This run only created this error briefing. If cleanup is desired, remove or commit this file after reviewing the blocked condition. Do not reset or clean the other dirty files until their ownership is clear.

## Safest next action

Resolve or explicitly allow the dirty `logs/kb-dev-server.log` and `wiki/syntheses/*` changes, then rerun the Refinery job. If those synthesis changes belong to the Editor Run, commit/stash them or expand the next job's allowlist intentionally rather than letting Refinery proceed against an ambiguous worktree.
