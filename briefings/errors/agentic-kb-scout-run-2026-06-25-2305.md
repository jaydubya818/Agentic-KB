# Agentic-KB Scout Run — Blocked/Error Briefing

- **Job name:** Agentic-KB Scout Run
- **Job ID:** not provided by scheduler
- **Timestamp:** 2026-06-25 23:05:51 PDT
- **Phase/stage failed:** pre-run dirty-worktree safety check, before URL fetches or raw captures

## Blocked reason

Scout is a mutable scheduled job and must block when `git status --porcelain` shows dirty files outside the Scout allowed paths.

Allowed Scout write paths/exceptions for this run were exactly:

- `.night-shift/state/`
- `briefings/`
- `raw/framework-docs/`
- `raw/transcripts/`
- `raw/code-examples/`
- `logs/web-server-error.log`
- `logs/web-server.log`
- `logs/audit.log`
- `logs/kb-dev-server.log`
- `raw/reading-list.md`

`git status --porcelain` returned dirty files outside those paths:

```text
 M .night-shift/state/editor-state.json
 M logs/kb-dev-server.log
 M wiki/concepts/skills.md
 M wiki/index.md
 M wiki/log.md
 M wiki/syntheses/synthesis-react-as-native-trajectory-eval.md
?? briefings/2026-06-25.md
?? wiki/syntheses/synthesis-skills-as-evaluable-artifacts.md
```

Blocking files outside Scout's allowed paths:

```text
 M wiki/concepts/skills.md
 M wiki/index.md
 M wiki/log.md
 M wiki/syntheses/synthesis-react-as-native-trajectory-eval.md
?? wiki/syntheses/synthesis-skills-as-evaluable-artifacts.md
```

The allowed/noisy files were not treated as blockers:

```text
 M .night-shift/state/editor-state.json
 M logs/kb-dev-server.log
?? briefings/2026-06-25.md
```

## Files read

- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/scout-run.md`
- `raw/reading-list.md`
- `.night-shift/state/scout-processed.json`

## Files written or attempted

- Written: `briefings/errors/agentic-kb-scout-run-2026-06-25-2305.md`
- Attempted raw captures: none
- Attempted state updates: none
- Attempted normal Scout report: none

## URL processing result

No URLs were fetched. The job stopped before network extraction because the dirty-worktree guard fired.

The current `raw/reading-list.md` queue contains seven unchecked URLs, and all seven already appear in `.night-shift/state/scout-processed.json` from the prior Scout state. Because the run was blocked before processing, no idempotency state was changed.

## Files that may need review

These files should be reviewed before the next unattended Scout run:

- `wiki/concepts/skills.md`
- `wiki/index.md`
- `wiki/log.md`
- `wiki/syntheses/synthesis-react-as-native-trajectory-eval.md`
- `wiki/syntheses/synthesis-skills-as-evaluable-artifacts.md`

## Rollback guidance

Do not rollback automatically from Scout. These look like wiki/editor changes from another workflow and may be legitimate. Safest review commands:

```bash
cd /Users/jaywest/Agentic-KB
git status --porcelain
git diff -- wiki/concepts/skills.md wiki/index.md wiki/log.md wiki/syntheses/synthesis-react-as-native-trajectory-eval.md
git diff --stat
```

For the untracked synthesis file, inspect it directly before deciding whether to keep, stage, or remove:

```bash
sed -n '1,220p' wiki/syntheses/synthesis-skills-as-evaluable-artifacts.md
```

## Safest next action for Jay

Review or commit/stash the dirty wiki changes, then rerun Scout. If those wiki changes are expected output from Editor/Refinery, land them before the next unattended Scout cycle so source capture jobs are not blocked by unrelated mutable wiki work.
