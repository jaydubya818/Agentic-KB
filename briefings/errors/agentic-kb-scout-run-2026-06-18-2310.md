---
title: Agentic-KB Scout Run Error Briefing
type: error-briefing
job: agentic-kb-scout-run
timestamp: 2026-06-18 23:10:12 PDT
status: blocked
---

# Agentic-KB Scout Run — Blocked

## Job
- **Name:** agentic-kb-scout-run
- **Job ID:** unavailable from cron context
- **Timestamp:** 2026-06-18 23:10:12 PDT
- **Phase/stage failed:** pre-run dirty-worktree safety check

## Blocked Reason
The Scout run stopped before fetching or writing any new raw captures because `git status --porcelain` showed dirty files outside the Scout playbook's allowed write paths.

Allowed Scout dirty/write paths are exactly:
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

Blocking dirty files outside those paths:
- `M playbooks/editor-run.md`
- `M playbooks/refinery-run.md`
- `M playbooks/scout-run.md`
- `M wiki/lint-report.md`

Full dirty status observed:

```text
 M .night-shift/state/editor-state.json
 M logs/audit.log
 M logs/kb-dev-server.log
 M playbooks/editor-run.md
 M playbooks/refinery-run.md
 M playbooks/scout-run.md
 M raw/reading-list.md
 M wiki/lint-report.md
?? .night-shift/state/refinery-processed.json
?? .night-shift/state/scout-processed.json
?? briefings/2026-06-16.md
?? briefings/errors/agentic-kb-editor-run-2026-06-17-0626.md
?? briefings/errors/agentic-kb-editor-run-2026-06-18-0649.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-17-0316.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-18-0330.md
?? briefings/errors/agentic-kb-scout-run-2026-06-16-2306.md
?? briefings/errors/agentic-kb-scout-run-2026-06-17-2320.md
?? briefings/errors/agentic-kb-scout-run-2026-06-18-1157.md
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

## Files Read
- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/scout-run.md`
- `raw/reading-list.md`
- `.night-shift/state/scout-processed.json`

## Files Written or Attempted
- Wrote this error briefing: `briefings/errors/agentic-kb-scout-run-2026-06-18-2310.md`
- No raw captures were fetched or written during this run.
- No Scout state updates were attempted.
- `raw/reading-list.md` was not modified.

## Queue / State Observation
The current unchecked URLs in `raw/reading-list.md` all already appear in `.night-shift/state/scout-processed.json` from the earlier 2026-06-18 Scout run:
- `https://github.com/langchain-ai/rag-from-scratch`
- `https://github.com/chopratejas/headroom`
- `https://github.com/mgechev/skills-best-practices`
- `https://github.com/microsoft/SkillOpt`
- `https://github.com/Ar9av/obsidian-wiki`
- `https://github.com/rohitg00/ai-engineering-from-scratch`
- `https://x.com/sumanth_077/status/2066530299467706495`

Because the pre-run dirty check blocked the job, this observation was not used to mutate state or produce a normal Scout briefing.

## Files That May Need Review
- `playbooks/scout-run.md` — modified outside current Scout run; inspect before allowing unattended Scout writes.
- `playbooks/editor-run.md` — modified outside Scout allowed paths.
- `playbooks/refinery-run.md` — modified outside Scout allowed paths.
- `wiki/lint-report.md` — modified outside Scout allowed paths.
- Existing untracked raw captures and briefings from prior runs may need to be reviewed, committed, or intentionally left as working output.

## Rollback Guidance
No Scout content changes were made in this run except this error briefing. To return to the pre-run state, remove only:

```bash
rm briefings/errors/agentic-kb-scout-run-2026-06-18-2310.md
```

Do **not** bulk-clean the working tree. The dirty files appear to include prior Night Shift outputs and playbook edits that may be intentional.

## Safest Next Action
Review the four blocking dirty files and decide whether to commit, stash, or revert them:

```bash
git diff -- playbooks/editor-run.md playbooks/refinery-run.md playbooks/scout-run.md wiki/lint-report.md
```

Once those are clean or intentionally committed, rerun Scout. Given the current state file, the next clean Scout run should likely produce a no-new-URLs/no-op report unless `raw/reading-list.md` receives additional unchecked URLs not already present in `.night-shift/state/scout-processed.json`.
