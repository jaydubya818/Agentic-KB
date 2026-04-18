---
id: 01KNNVX2R6KAJ4E312RWFKVTF8
title: Private Test Note
type: concept
visibility: private
tags: [private, test]
created: 2026-04-07
---

# Private Test Note

This is a **private** test article used to verify the PIN lock system works end-to-end.

## TL;DR

If you can read this, PIN `1124` is working correctly across web, CLI, and [[mcp-ecosystem]].

## What This Verifies

- Web UI: 🔒 button → enter PIN → private articles searchable and readable
- CLI: `kb search "private" --scope private` returns this article
- [[mcp-ecosystem]]: `search_wiki` with `scope: "private", pin: "1124"` returns this article
- `read_article` with `slug: "personal/private-test-note", pin: "1124"` returns full content
