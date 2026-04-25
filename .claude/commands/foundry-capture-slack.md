---
description: Capture messages from a designated Slack channel into raw/clippings/ for /foundry-ingest to route.
allowed-tools: Bash, Read, mcp__hermes__*, mcp__hermes-alan__*, mcp__hermes-mira__*, mcp__hermes-turing__*
argument-hint: "[channel-name]  (default: kb-inbox)"
---

# /foundry-capture-slack

Pulls fresh messages from a Slack capture channel and writes each one to `raw/clippings/` as a properly-frontmattered markdown file. From there, `/foundry-ingest` will sha256-dedup, type-detect, and route into the correct `raw/<subdir>/`.

This is the agent-side analogue of OpenBrain's quick-capture-from-Slack pattern, adapted to Foundry's file-over-app stack — no SaaS middleman, no embedding pipeline, just files and the existing gate.

## What it does

1. Resolve the channel: `$ARGUMENTS` if provided, else `kb-inbox`.
2. Use the available `hermes` MCP (or any of `hermes-alan`, `hermes-mira`, `hermes-turing`) to find the channel ID via `channels_list`.
3. Read the most recent N messages via `messages_read` (default N=50; surface a count).
4. For each message that is NOT a bot post, NOT a thread reply, and has at least 10 characters of body text:
   - Strip Slack-specific noise (`<@USER>` mentions kept as-is; emoji shortcodes preserved; URLs preserved).
   - Detect a leading type hint: if the message starts with `transcript:`, `paper:`, `thread:`, or `note:`, strip that prefix and pass it as `--type`.
   - Call `node scripts/lib/clipping-write.mjs --source slack --author <user-display-name> --ts <message-iso-timestamp> --text-file <tmp-path> [--type <hint>]`.
   - Use a temp file for the body (`mktemp`) to avoid shell-quoting hell.
5. Report a summary: `{written, skipped-as-duplicate, errors}` with file paths.
6. Suggest running `/foundry-ingest` next if anything was written.

## How to run it

```bash
# Default channel (kb-inbox)
/foundry-capture-slack

# Specific channel
/foundry-capture-slack engineering-thoughts
```

## Conventions for the source channel

- Dedicate a Slack channel for this. Don't point it at a noisy general channel.
- Write self-contained thoughts (one idea per message). The first line becomes the title.
- Optional type prefix steers routing: `paper: arXiv 2024.01234 — interesting RAG approach`.
- Threaded replies are skipped (avoid follow-up noise polluting the KB).
- Messages under 10 chars are skipped (avoid emoji-only / "lol" / "ack" noise).

## Idempotency

`clipping-write` dedups via canonical sha256 of `source + author + ts + text`. Re-running the command is safe — the same message will not write twice. Already-ingested messages (in `raw/.ingest-hashes.json`) are also skipped.

## Refuse list

- Do NOT modify wiki pages — clippings only.
- Do NOT delete messages from Slack after capture (leave the source intact for audit).
- Do NOT skip the dedup check.
- Do NOT write personal vault paths anywhere (Rule 13).
- Do NOT auto-trigger `/foundry-ingest` — recommend it; let the human decide.

## Related

`/foundry-capture-notes` — same pattern for Apple Notes.
`/foundry-capture` — runs both Slack + Notes captures in sequence.
`/foundry-ingest` — the next step that picks up what was captured.
