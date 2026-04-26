---
description: Run all enabled quick-capture sources (Slack + Apple Notes) into raw/clippings/. Convenience wrapper.
allowed-tools: Bash, Read, mcp__hermes__*, mcp__hermes-alan__*, mcp__hermes-mira__*, mcp__hermes-turing__*, mcp__Read_and_Write_Apple_Notes__*
---

# /foundry-capture

Umbrella command — runs `/foundry-capture-slack` and `/foundry-capture-notes` in sequence, then prints a combined summary and recommends `/foundry-ingest` if anything was written.

## What it does

1. Run `/foundry-capture-slack` (default channel `kb-inbox`).
2. Run `/foundry-capture-notes` (default folder `KB Inbox`).
3. Tally the results: total written, total skipped-as-duplicate, errors per source.
4. If anything was written: surface a one-line recommendation: "Run `/foundry-ingest` next to route these into the correct `raw/<subdir>/`."
5. If nothing was written: report "Capture inboxes were empty or fully deduped — KB is current."

## When to run

- Start of a Cowork session (manual; see Hermes mode bootstrap).
- After a phone-thinking session (lots of Apple Notes captured).
- After a Slack-thinking session (multiple thoughts dropped in `#kb-inbox`).
- Before a research session — to make sure unfiled material is in raw/ before you query.

## Refuse list

- Same as the underlying commands — no auto-ingest, no source mutation, no wiki-page edits.

## Related

`/foundry-capture-slack`, `/foundry-capture-notes` — individual sources.
`/foundry-ingest` — the next step.
