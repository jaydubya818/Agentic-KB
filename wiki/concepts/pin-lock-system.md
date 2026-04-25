---
id: 01KQ300A612EN6GR4KXEQFWK0X
title: "PIN Lock System"
type: concept
tags: [knowledge-base, authentication, safety, personal]
created: 2026-04-07
updated: 2026-04-25
visibility: private
confidence: high
---

# PIN Lock System

## Definition

The PIN Lock System is a lightweight access-control mechanism that restricts retrieval of `visibility: private` wiki content behind a numeric PIN credential. It operates across all three primary surfaces of the knowledge base: the web UI, the MCP tool layer, and the CLI.

The active PIN is `1124`.

## Why It Matters

The KB contains both public-facing concepts and private personal notes (stored under `personal/` or tagged `visibility: private`). Without a gate, any search — including those executed by agents via MCP — could inadvertently surface sensitive content. The PIN lock enforces an explicit, intentional disclosure step before private content is returned.

## How It Works

| Surface | How to authenticate |
|---|---|
| **Web UI** | Click the lock button; enter PIN when prompted |
| **MCP `search_wiki`** | Pass `scope=private` and `pin` parameters |
| **CLI `kb search`** | Pass `--scope private` flag (PIN entered interactively or via env) |

Successful retrieval of any `visibility: private` article confirms end-to-end PIN lock functionality for that surface.

## Example

```bash
# CLI
kb search --scope private "test note"

# MCP call
search_wiki(query="test note", scope="private", pin="1124")
```

## ⚠️ Contradictions

> ⚠️ **Security contradiction**: The active PIN value (`1124`) is stored in plaintext within a private note (`note/private-test-note.md`) that is itself protected by that PIN. This violates the principle of **secret separation** — the credential used to unlock content should not be readable *within* the content it protects. The PIN should be stored out-of-band (e.g. in a secrets manager, environment variable, or password vault) rather than embedded in the KB. Flagged for review.

## See Also

- [Guardrails](guardrails.md) — broader safety mechanisms for agent outputs
- [Enterprise AI Governance](enterprise-ai-governance.md) — access control in organisational contexts
- [LLM-Owned Wiki](llm-owned-wiki.md) — the wiki architecture this system sits within
- [Ingest Pipeline](ingest-pipeline.md) — where visibility metadata is assigned during document ingestion
