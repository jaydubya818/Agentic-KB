---
id: 01M0BS7JQRAAPSJCK0RCXJAXYR
title: "Hot Cache Pattern"
type: pattern
tags: [llm-wiki, memory, context, agents, orchestration]
created: 2026-04-25
updated: 2026-10-28
last_verified: 2026-10-28
visibility: public
confidence: medium
related: [llm-wiki, agent-memory-architecture]
source: transcripts/nate-herk-llm-wiki.md
---

# Hot Cache Pattern

## When to Use
Use this pattern when an agent repeatedly needs a small set of high-frequency, high-value context (recent facts, active preferences, common answers) and re-deriving it from a full [[llm-wiki]] or knowledge base on every query is wasteful. It's especially valuable for executive-assistant-style agents that field the same categories of questions daily (schedules, contacts, active projects).

## Structure
A hot cache is a small file budgeted by the `hot.md` convention's own header as **≤500 words** — in practice roughly 1,000–4,000 characters once formatting and links are included, not a literal ~500-character file. (Verified 2026-10-28 against `wiki/hot.md`, `agents/leads/sofie/hot.md`, and `agents/orchestrators/architecture-agent/hot.md`: sizes range from 133 bytes to ~4.1 KB, consistent with a words budget rather than a strict character cap.) It sits at the top of an agent's read order:

1. Agent reads `hot.md` (the cache) first.
2. If the answer isn't there, agent reads the top-level `index.md`.
3. If still not resolved, agent reads a domain-specific subindex.
4. Only as a last resort does the agent perform a full search across wiki pages.

This mirrors the existing `hot.md` convention already used across agent profiles in this KB (e.g. `agents/leads/sofie/hot.md`, `agents/orchestrators/architecture-agent/hot.md`), confirming this pattern is already in active use rather than purely theoretical.

## Example
An executive assistant agent's `CLAUDE.md` points at a wiki path. On a query like "what's on my calendar today," the agent checks `hot.md` first — which already contains today's schedule summary — instead of crawling the full wiki graph. Only unusual or novel questions trigger deeper index traversal or search, per the instruction: "Don't read from the wiki unless you actually need it."

## Trade-offs
- **Pro**: Reduces token usage and latency for the majority of routine queries.
- **Pro**: Keeps agents fast without requiring a vector DB or embeddings refresh.
- **Con**: Cache can go stale if not refreshed regularly (needs a clear update/eviction policy).
- **Con**: Fixed small size (≤500 words) means only the highest-value context fits — requires discipline about what qualifies as "hot."

## Related Patterns
- [[llm-wiki]] — the broader knowledge base structure this pattern sits within
- [Agent memory architecture](../concepts/agent-memory-architecture.md)
