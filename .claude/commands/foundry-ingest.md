---
description: Process everything in raw/clippings/ — route, ingest, and dedupe.
allowed-tools: Bash, Read, Edit, Write
---

# /foundry-ingest

Drop anything new into `raw/clippings/`. This command processes the inbox end-to-end.

## What it does

1. Run hash-based dedup gate to skip files already ingested.
2. For each remaining clipping: detect type (article, paper, transcript, framework doc, conversation, social) and route to the correct `raw/<subdir>/` per CLAUDE.md INGEST step 0.
3. For each routed file: shell out to `kb ingest-file <path>` to convert + write summary.
4. Append a one-line entry per file to `wiki/log.md` and `wiki/recently-added.md`.
5. Record file hashes to `raw/.ingest-hashes.json` so re-runs are idempotent.

## How to run it

Execute the dedup + routing script first, then the per-file ingest:

```bash
node scripts/ingest-dedup.mjs --inbox raw/clippings --route
```

The script handles routing, hash recording, and shells out to `kb ingest-file` for each new item. It is idempotent — re-running with no new files is a no-op.

## Output

Print a compact summary in this exact shape (Foundry style):

```
Ingested 5:
  - article:    karpathy-llm-wiki.md  → raw/articles/
  - transcript: hermes-standup-04-21.md → raw/transcripts/
  - paper:      attention-is-all-you-need.md → raw/papers/
  - article:    ...
  - article:    ...

Skipped 2 (already ingested via hash match).
```

## Refuse list

- Do NOT write to the personal Obsidian vault (`~/Documents/Obsidian Vault/`). Read-only.
- Do NOT create wiki pages here — that is `/foundry-compile`'s job.
- Do NOT delete files from `raw/clippings/`. Move them to the correct `raw/<subdir>/`.
- Do NOT skip the hash check. Idempotency is the contract.

## Related

`/foundry-compile` runs after ingest to turn sources into wiki pages.
`/foundry-lint` shows what is queued and what is healthy.
