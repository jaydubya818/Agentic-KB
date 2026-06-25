# Agentic-KB Scout Run — Blocked

- **Job name:** Agentic-KB Scout Run
- **Job ID:** unavailable (Hermes scheduled cron invocation)
- **Timestamp:** 2026-06-24T06:05:47Z / 2026-06-23-2305 local
- **Phase/stage failed:** Pre-run dirty-worktree safety check, before fetching or writing raw captures
- **Status:** BLOCKED

## Blocked reason

`git status --porcelain` found dirty files outside the Scout Run allowed write paths/exceptions.

Allowed Scout write paths/exceptions for this run:

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

Blocking dirty files outside that allowlist:

```text
 M playbooks/editor-run.md
 M playbooks/refinery-run.md
 M playbooks/scout-run.md
```

Full dirty-worktree output observed:

```text
 M .night-shift/state/audit-state.json
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
?? briefings/errors/agentic-kb-audit-run-2026-06-21-2205.md
?? briefings/errors/agentic-kb-editor-run-2026-06-17-0626.md
?? briefings/errors/agentic-kb-editor-run-2026-06-18-0649.md
?? briefings/errors/agentic-kb-editor-run-2026-06-20-0626.md
?? briefings/errors/agentic-kb-editor-run-2026-06-21-0626.md
?? briefings/errors/agentic-kb-editor-run-2026-06-22-0626.md
?? briefings/errors/agentic-kb-editor-run-2026-06-23-0626.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-17-0316.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-18-0330.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-19-0327.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-20-0316.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-21-0315.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-22-0315.md
?? briefings/errors/agentic-kb-refinery-run-2026-06-23-0315.md
?? briefings/errors/agentic-kb-scout-run-2026-06-16-2306.md
?? briefings/errors/agentic-kb-scout-run-2026-06-17-2320.md
?? briefings/errors/agentic-kb-scout-run-2026-06-18-1157.md
?? briefings/errors/agentic-kb-scout-run-2026-06-18-2310.md
?? briefings/errors/agentic-kb-scout-run-2026-06-19-2305.md
?? briefings/errors/agentic-kb-scout-run-2026-06-20-2306.md
?? briefings/errors/agentic-kb-scout-run-2026-06-21-2305.md
?? briefings/errors/agentic-kb-scout-run-2026-06-22-2320.md
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

## Files read

- `AGENTS.md`
- `house-rules.md`
- `playbooks/night-shift-map.md`
- `playbooks/scout-run.md`
- `raw/reading-list.md`
- `.night-shift/state/scout-processed.json`

## Files written or attempted

- Written: `briefings/errors/agentic-kb-scout-run-2026-06-23-2305.md`
- Attempted raw captures: none
- Attempted state updates: none
- Attempted reading-list edits: none

## Queue/state observation

The current `raw/reading-list.md` contains 7 unchecked URLs. `.night-shift/state/scout-processed.json` already records all 7 URLs as processed, with destinations under `raw/framework-docs/`:

- `https://github.com/langchain-ai/rag-from-scratch` → `raw/framework-docs/langchain-ai-rag-from-scratch.md`
- `https://github.com/chopratejas/headroom` → `raw/framework-docs/chopratejas-headroom.md`
- `https://github.com/mgechev/skills-best-practices` → `raw/framework-docs/mgechev-skills-best-practices.md`
- `https://github.com/microsoft/SkillOpt` → `raw/framework-docs/microsoft-skillopt.md`
- `https://github.com/Ar9av/obsidian-wiki` → `raw/framework-docs/ar9av-obsidian-wiki.md`
- `https://github.com/rohitg00/ai-engineering-from-scratch` → `raw/framework-docs/rohitg00-ai-engineering-from-scratch.md`
- `https://x.com/sumanth_077/status/2066530299467706495` → `raw/framework-docs/x-twitter-2066530299467706495.md`

No fetching was performed because the run must stop at the dirty-worktree gate.

## Files that may need review

- `playbooks/editor-run.md`
- `playbooks/refinery-run.md`
- `playbooks/scout-run.md`

These are pre-existing dirty playbook files outside the Scout allowlist. Scout should not proceed unattended until Jay confirms these edits are expected or they are committed/stashed/reverted.

## Rollback guidance

This run only wrote this error briefing. To roll back this run, remove:

```bash
rm briefings/errors/agentic-kb-scout-run-2026-06-23-2305.md
```

Do **not** modify the dirty playbook files automatically from this job.

## Safest next action for Jay

Review the three dirty playbook files and either commit, stash, or revert them. After the worktree is clean except for the Scout allowlist paths, rerun the Scout Run. Given the processed-state file already marks all current queue URLs as processed, the next successful Scout run will likely produce a no-op report unless new unchecked URLs are added or the state file is intentionally reset.
