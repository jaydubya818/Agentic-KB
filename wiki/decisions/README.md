---
title: Decisions Log
type: moc
tags: [decisions, moc, operational]
created: 2026-04-20
updated: 2026-04-20
---

# Decisions Log
> Every durable decision made on a call, in a session, or in a message thread gets its own page here.
> LLM-authored by INGEST. Jay flips `reviewed: true` after validation.

## Naming
`decision-{YYYY-MM-DD}-{slug}.md` — date is the date the decision was made, not the ingest date.

## Page Schema
```yaml
---
title: string                  # one-line decision, declarative
type: decision
date: YYYY-MM-DD               # when the decision was made
domain: string                 # e.g. client-ops, architecture, vendor, personnel
deciders: []                   # names
source: [[path/to/transcript]] # wiki link to the summary or raw source
supersedes: []                 # wiki links to prior decisions this overrides
confidence: high | medium | low
reviewed: false
reviewed_date: ""
tags: []
---
```

## Required Sections
1. **Decision** — one declarative sentence.
2. **Context** — why this came up, what triggered it.
3. **Alternatives Considered** — what else was on the table, why rejected.
4. **Consequences** — what changes operationally as a result.
5. **Revisit Trigger** — what would cause this to be reopened.
6. **Source** — `[[wiki link]]` to transcript summary or session note.

## Index
<!-- INGEST prepends new decisions here. Most recent first. -->

### Architecture Decision Records (ADRs)
- [[decisions/ADR-001-mcp-sdk-migration|ADR-001 — Defer MCP SDK Server → McpServer migration]] (deferred, 2026-04-25)
