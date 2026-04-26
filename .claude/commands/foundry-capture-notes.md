---
description: Capture notes from a designated Apple Notes folder into raw/clippings/ for /foundry-ingest to route.
allowed-tools: Bash, Read, mcp__Read_and_Write_Apple_Notes__*
argument-hint: "[folder-name]  (default: KB Inbox)"
---

# /foundry-capture-notes

Pulls notes from a dedicated Apple Notes folder and writes each one to `raw/clippings/` as a properly-frontmattered markdown file. From there, `/foundry-ingest` will sha256-dedup and route into the correct `raw/<subdir>/`.

Apple Notes is the right capture surface for thinking on the phone, in the car (dictation), or away from the laptop. This command makes it a first-class input lane for the wiki.

## What it does

1. Resolve the folder: `$ARGUMENTS` if provided, else `KB Inbox`.
2. Use `mcp__Read_and_Write_Apple_Notes__list_notes` to enumerate notes in that folder.
3. For each note that has a body of at least 10 characters:
   - Fetch the note body via `mcp__Read_and_Write_Apple_Notes__get_note_content`.
   - Detect a leading type hint on the title or first line (`transcript:`, `paper:`, `thread:`, `note:`); strip and pass as `--type`.
   - Use the note's title as `--title`, modification date as `--ts`.
   - Write body to a temp file (`mktemp`) to avoid shell-quoting hell.
   - Call `node scripts/lib/clipping-write.mjs --source apple-notes --title <note-title> --ts <iso> --text-file <tmp> [--type <hint>]`.
4. Report `{written, skipped-as-duplicate, errors}` with file paths.
5. Suggest `/foundry-ingest` next.

**Important**: this command READS Apple Notes. It does NOT delete or archive after capture — leave the source intact for audit. If you want a "processed" archive workflow, move the note manually into a `KB Processed` folder yourself; that keeps the agent on read-only ground per Rule 13's spirit.

## How to run it

```bash
# Default folder (KB Inbox)
/foundry-capture-notes

# Specific folder
/foundry-capture-notes "Research Inbox"
```

## Conventions for the source folder

- Dedicate a folder. Don't point at your main notes — captures should be intentional.
- One note = one thought. The title becomes the wiki-clipping title.
- Optional type prefix: `paper: arXiv 2024.01234 — interesting RAG approach`.
- Notes under 10 chars are skipped.
- Pictures/attachments are dropped (clippings are text-first; for PDFs, drop them in `raw/clippings/` directly via Finder).

## Idempotency

Same canonical-sha256 dedup as `/foundry-capture-slack`. Re-running is safe; identical content collapses.

## Refuse list

- Do NOT modify wiki pages — clippings only.
- Do NOT delete or move Apple Notes after capture (read-only on the source).
- Do NOT skip the dedup check.
- Do NOT auto-trigger `/foundry-ingest` — recommend it; let the human decide.

## Related

`/foundry-capture-slack` — same pattern for Slack.
`/foundry-capture` — runs both Slack + Notes captures in sequence.
`/foundry-ingest` — picks up what was captured.
