# House Rules — Agentic-KB Night Shift

This file is the operating charter for unattended or semi-attended agents working in the Agentic-KB Obsidian vault.

## Vault selected
- Canonical vault: `/Users/jaywest/Agentic-KB`
- This is the Agentic-KB Obsidian vault. Do not target Jay's main personal vault for this workflow.

## Pipeline mapping
The source article uses `0-raw`, `1-desk`, `2-atoms`, and `3-threads`. In this existing vault, use the native Agentic-KB schema instead:

- `raw/` = source-of-truth intake and immutable source archive. READ ONLY after capture.
- `raw/inbox/` = Jay's frictionless drop zone for messy thoughts, links, PDFs, transcripts, and snippets.
- `raw/reading-list.md` = URL queue for the Scout run.
- `.night-shift/desk/` = transient scratch space. Clear only files created by the current run.
- `wiki/summaries/` = one summary per raw source.
- `wiki/concepts/`, `wiki/patterns/`, `wiki/frameworks/`, `wiki/recipes/`, `wiki/evaluations/`, `wiki/personal/` = atomic/structured permanent notes.
- `wiki/syntheses/` = synthesis threads that weave related notes together.
- `briefings/` = human-readable night-shift outputs and audit reports.
- `playbooks/` = job definitions for scheduled workers.

## Prime directive
Every wiki claim must trace to a real source in `raw/`, `wiki/summaries/`, or an explicitly cited URL captured into `raw/`.

No source, no claim. Do not fill gaps with plausible text. Mark uncertainty as `[UNVERIFIED]` when preserving a user-captured claim that lacks independent verification.

## Authority boundaries
Agents may write only to:
- `.night-shift/desk/`
- `wiki/`
- `briefings/`
- `outputs/`
- `.night-shift/state/`

Agents may create new files under `raw/inbox/` only when Jay explicitly asks to capture something. Scheduled jobs must not modify raw captures or original sources.

Agents must not write to:
- Jay's main vault: `/Users/jaywest/Documents/Obsidian Vault/`
- `raw/` originals, except explicit capture into `raw/inbox/`
- `.git/`
- logs unless the playbook explicitly says append-only

## Working rules
1. Read `AGENTS.md` and this file before writing.
2. Preserve raw sources; never summarize over the original.
3. Before creating a new wiki page, search for an existing page to extend.
4. Every new wiki page must be linked from `wiki/index.md` and at least one relevant existing page before the run is complete.
5. Contradictions are valuable. Add a `[FRICTION]` block to the new/updated page and append the issue to `wiki/log.md`.
6. Never delete. Mark stale pages as deprecated or retired and explain why.
7. Recipe pages default to `tested: false` unless Jay explicitly confirms a real test.
8. Append to `wiki/log.md`; never overwrite it.
9. End every run with a briefing or a clear no-op report.
10. If a merge, deletion, or interpretation is ambiguous, leave a briefing item for Jay instead of forcing it.

## Idempotency
Every scheduled run must be safe to execute twice. Use `.night-shift/state/` to record processed file paths, hashes, and timestamps. If the same source has already been processed and its hash has not changed, skip it and report the skip.
