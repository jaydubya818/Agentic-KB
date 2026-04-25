---
id: 01KQ2X9RBHNYT2MYN4A4KSMY6G
title: "Safe CLI Document Fetch (Pipe-to-Disk)"
type: pattern
tags: [cli-safety, context-management, tools, workflow, knowledge-base]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [context-management, ingest-pipeline, concepts/agent-failure-modes]
source: https://github.com/TristanH/wikiwise/blob/main/Sources/Wikiwise/Resources/scaffold/skills/fetch-readwise-document/SKILL.md
---

# Safe CLI Document Fetch (Pipe-to-Disk)

A safety pattern for fetching large documents via CLI tools when document body size may exceed safe inline context limits. Defined concretely in the Wikiwise `fetch-readwise-document` skill, but applicable to any CLI that can return token-heavy payloads.

## When to Use

- When calling a CLI command that returns structured JSON containing a large `content` or `body` field
- When document sizes are unbounded or known to reach 50,000+ tokens
- When the output will feed into an LLM context (agent, compile pipeline, etc.)
- Whenever inline streaming of document body would risk [context window overflow](../concepts/context-management.md)

## Structure

1. **Invoke** the CLI command with the correct flags
2. **Pipe** the output through a field-extraction filter (e.g. `jq -r '.content'`) to discard envelope metadata and isolate the body
3. **Redirect** the extracted content to a file on disk at a predictable path
4. **Hand off** the file path to the downstream workflow — never the inline content

## Example

The canonical Wikiwise invocation for Readwise Reader documents:

```bash
# CORRECT — pipes body to disk
readwise reader-get-document-details --document-id <id> | jq -r '.content' > raw/readwise/<slug>.md
```

**Wrong invocations (never do these):**

```bash
# WRONG — incorrect flag (--id is a different operation)
readwise reader-get-document-details --id <id>

# WRONG — missing pipe, dumps full body into context
readwise reader-get-document-details --document-id <id>
```

> ⚠️ **Critical Rule**: `reader-get-document-details` must NEVER be invoked without `| jq -r '.content' > file`. Document bodies can exceed 50,000 tokens. Streaming to disk is non-negotiable.

### Flag Note

The Readwise CLI exposes both `--document-id` and `--id`. These are **not aliases** — they perform different operations. Always use `--document-id` when fetching full document content.

## Trade-offs

| Pro | Con |
|---|---|
| Prevents context window overflow entirely | Requires a writable filesystem |
| Output is reusable / inspectable | Adds a `jq` dependency |
| Decouples fetch from downstream processing | File management (cleanup, naming) must be handled |
| Safe for unbounded document sizes | Slightly more complex invocation |

## Related Patterns

- [Ingest Pipeline](../concepts/ingest-pipeline.md) — the downstream workflow that consumes the fetched file
- [Context Management](../concepts/context-management.md) — foundational concept motivating this pattern
- [Agent Failure Modes](../concepts/agent-failure-modes.md) — context overflow is a common silent failure mode

## ⚠️ Contradictions

> The source states `--id` and `--document-id` are both valid CLI flags that "do different things" but does not specify what `--id` does. It is unclear whether `--id` retrieves a different resource type, operates on a different entity, or silently fails. Users should not assume the two flags are aliases. Flagged for clarification against Readwise CLI docs.

## See Also

- [Ingest Pipeline concept](../concepts/ingest-pipeline.md)
- [Context Management concept](../concepts/context-management.md)
- [Agent Failure Modes](../concepts/agent-failure-modes.md)
