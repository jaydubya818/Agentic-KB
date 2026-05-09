---
description: Capture Snipd podcast highlights from a designated Apple Notes folder into raw/clippings/ for /foundry-ingest to route.
allowed-tools: Bash, Read, mcp__Read_and_Write_Apple_Notes__*
argument-hint: "[folder-name]  (default: Snipd)"
---

# /foundry-capture-snipd

Pulls Snipd podcast highlights from a dedicated Apple Notes folder and writes each clip to `raw/clippings/` as a properly-frontmattered markdown file. From there, `/foundry-ingest` will sha256-dedup and route into `raw/transcripts/` (Snipd clips are short transcript fragments with takeaway notes).

Why Apple Notes and not the Snipd email export? Apple Notes is already a first-class capture lane (Rule 13 read-only, MCP wired, dedup tested). Snipd's iOS share sheet writes directly to a Notes folder; that's zero-friction for the user, zero-new-infrastructure for the KB.

## What it does

1. Resolve the folder: `$ARGUMENTS` if provided, else `Snipd`.
2. Use `mcp__Read_and_Write_Apple_Notes__list_notes` to enumerate notes in that folder.
3. For each note that has a body of at least 30 characters (Snipd clips include show + episode + quote, so they're never tiny):
   - Fetch the note body via `mcp__Read_and_Write_Apple_Notes__get_note_content`.
   - Parse Snipd's structure: the title is typically the show/episode title; the body contains a timestamped quote followed by a takeaway. Both are preserved verbatim — do NOT reformat.
   - Use the note's title as `--title`, modification date as `--ts`.
   - Write body to a temp file (`mktemp`).
   - Call `node scripts/lib/clipping-write.mjs --source snipd --title <note-title> --ts <iso> --text-file <tmp> --type transcript-clip --extra-tag podcast --extra-tag snipd`.
4. Report `{written, skipped-as-duplicate, errors}` with file paths.
5. Suggest `/foundry-ingest` next.

**Important**: this command READS Apple Notes. It does NOT delete or archive after capture — leave the source intact for audit. If you want a "processed" archive workflow, move clips manually into a `Snipd Processed` folder yourself.

## How to run it

```bash
# Default folder (Snipd)
/foundry-capture-snipd

# Custom folder
/foundry-capture-snipd "Podcast Highlights"
```

## Conventions for the source folder

- Dedicate a folder. The Snipd iOS share sheet → "Save to Notes" → pick "Snipd". Don't mix podcast highlights with general thoughts.
- One Snipd clip = one Apple Note. Don't manually combine.
- Snipd's auto-generated takeaway is preserved as-is — it's part of the source data.
- Notes under 30 chars are skipped (avoid empty Snipd shares).
- The wiki-clipping inherits `type_hint: transcript-clip` so the ingest router places it under `raw/transcripts/` alongside meeting notes and YouTube transcripts.

## Idempotency

Same canonical-sha256 dedup as `/foundry-capture-notes`. Re-running is safe; identical content collapses.

## Refuse list

- Do NOT modify wiki pages — clippings only.
- Do NOT delete or move Apple Notes after capture (read-only on the source).
- Do NOT skip the dedup check.
- Do NOT auto-trigger `/foundry-ingest` — recommend it; let the human decide.
- Do NOT collapse multiple Snipd clips into one clipping; one note = one clipping.

## Related

`/foundry-capture-notes` — same Apple Notes pattern for general thoughts.
`/foundry-capture` — runs the umbrella (Notes + Snipd).
`/foundry-ingest` — picks up what was captured and routes to `raw/transcripts/`.
