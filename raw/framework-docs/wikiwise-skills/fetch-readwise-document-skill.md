# Wikiwise — fetch-readwise-document/SKILL.md

Source: https://github.com/TristanH/wikiwise/blob/main/Sources/Wikiwise/Resources/scaffold/skills/fetch-readwise-document/SKILL.md
Retrieved: 2026-04-12

---

## Purpose
Safely fetch full document content from Readwise Reader without blowing up the context window.

## Critical Rule
**NEVER run `reader-get-document-details` without `| jq -r '.content' > file`**
Document bodies can be 50k+ tokens. Streaming to disk is non-negotiable.

## Correct invocation
```bash
readwise reader-get-document-details --document-id <id> | jq -r '.content' > raw/readwise/<slug>.md
```

## Wrong invocations (NEVER do these)
```bash
readwise reader-get-document-details --id <id>           # wrong flag
readwise reader-get-document-details --document-id <id>  # without pipe — dumps body to context
```

## Flag note
Flag is `--document-id`, NOT `--id`. The CLI has both; they do different things.

## After fetch
Run INGEST workflow on the output file at `raw/readwise/<slug>.md`.
