---
description: Run all enabled quick-capture sources (currently Apple Notes only) into raw/clippings/. Convenience wrapper.
allowed-tools: Bash, Read, mcp__Read_and_Write_Apple_Notes__*
---

# /foundry-capture

Umbrella command — runs the enabled capture sources in sequence, then prints a combined summary and recommends `/foundry-ingest` if anything was written.

**Currently enabled:** Apple Notes only.

**Intentionally disabled:** Slack capture exists (`/foundry-capture-slack`) for users with a personal Slack workspace. It is NOT invoked by this umbrella because the operator (Jay) uses Slack only for work, and corporate Slack content has retention/DLP/audit obligations that don't belong in a personal KB pushed to public GitHub.

## What it does

1. Run `/foundry-capture-notes` (default folder `KB Inbox`).
2. Tally the results: total written, total skipped-as-duplicate, errors per source.
3. If anything was written: surface a one-line recommendation: "Run `/foundry-ingest` next to route these into the correct `raw/<subdir>/`."
4. If nothing was written: report "Capture inboxes were empty or fully deduped — KB is current."

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
