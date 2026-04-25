---
id: 01KQ2X9RBJXDWYD7J499GT7R0T
title: "Readwise Reader → Wikiwise Ingest"
type: recipe
tags: [knowledge-base, workflow, tools, retrieval, automation]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [pattern-safe-cli-document-fetch, concepts/ingest-pipeline, concepts/context-management]
source: https://github.com/TristanH/wikiwise/blob/main/Sources/Wikiwise/Resources/scaffold/skills/fetch-readwise-document/SKILL.md
---

# Readwise Reader → Wikiwise Ingest

Step-by-step guide for safely fetching a document from Readwise Reader and feeding it into the Wikiwise INGEST workflow. This recipe operationalises the [Safe CLI Document Fetch pattern](../patterns/pattern-safe-cli-document-fetch.md).

## Prerequisites

- Readwise CLI installed and authenticated
- `jq` installed (`brew install jq` or equivalent)
- A Wikiwise scaffold with an `INGEST` workflow configured
- The document's Readwise `id` (visible in the Reader URL or via list commands)

## Steps

### 1. Identify the document ID

Locate the Readwise Reader document ID. This is the identifier used with `--document-id`, **not** `--id` (which is a different CLI operation).

### 2. Choose a slug

Pick a short, descriptive kebab-case slug for the output file, e.g. `karpathy-llm-intro`.

### 3. Fetch and pipe to disk

```bash
readwise reader-get-document-details --document-id <id> | jq -r '.content' > raw/readwise/<slug>.md
```

> ⚠️ **Never omit the pipe.** Document bodies regularly exceed 50,000 tokens. Running the command without `| jq -r '.content' > file` will dump the entire body into the agent context and likely cause a context overflow. See [Context Management](../concepts/context-management.md).

### 4. Verify the output file

```bash
wc -l raw/readwise/<slug>.md   # sanity check — should be non-empty
head -20 raw/readwise/<slug>.md  # confirm readable content
```

### 5. Run the INGEST workflow

Pass the file path to the Wikiwise INGEST workflow:

```
INGEST: raw/readwise/<slug>.md
```

The INGEST workflow handles parsing, chunking, and any downstream wiki compilation steps.

## Output

- Raw document content written to `raw/readwise/<slug>.md`
- Downstream: wiki page(s) created or updated by the INGEST workflow

## Common Mistakes

| Mistake | Consequence |
|---|---|
| Using `--id` instead of `--document-id` | Fetches wrong resource or fails silently |
| Omitting the `jq` pipe | Context window overflow — critical failure |
| Omitting the `> file` redirect | Same as above — body streamed inline |
| Running INGEST on wrong path | No-op or file-not-found error |

## See Also

- [Safe CLI Document Fetch pattern](../patterns/pattern-safe-cli-document-fetch.md) — the underlying pattern this recipe implements
- [Ingest Pipeline concept](../concepts/ingest-pipeline.md) — what happens after the fetch
- [Context Management concept](../concepts/context-management.md) — why pipe-to-disk is mandatory
