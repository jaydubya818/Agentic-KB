---
title: "Compounding Loop (Q&A → raw → compile → wiki)"
type: pattern
category: memory
problem: "LLM answers to queries are ephemeral — each query rediscovers knowledge from scratch with no memory of past answers."
solution: "Save verified Q&A answers back to raw/, compile them into the wiki, and let future queries cite past answers — each compile pass makes the system smarter."
tradeoffs: ["More wiki pages → richer answers", "Unverified answers can introduce noise", "Compile cost grows with vault size"]
tags: [agentic, memory, knowledge-management, llm-wiki, compounding]
confidence: high
sources: ["[[summaries/agentic-kb-obsidian-graph]]", "[[summaries/agentic-kb-oh-my-mermaid]]", "[[summaries/agentic-kb-readme]]"]
created: 2026-04-10
updated: 2026-04-10
---

## Problem

Every LLM query is stateless. Even if the system produces an excellent synthesis answer, that knowledge evaporates — the next query starts over from the same raw corpus. The system never gets smarter from being used.

## Solution

When the user verifies a query answer as correct, save it back to `raw/qa/` with `verified: true` in frontmatter. The next compile pass treats it like any other raw document: Claude reads it, integrates it into the relevant wiki pages, and the autolinker connects it to canonical entities. Future queries can now cite the compiled Q&A as a source. The system compounds.

```
/api/query reads wiki/
     ↓
Claude synthesizes answer
     ↓
User saves + marks verified: true → raw/qa/{slug}.md
     ↓
Next /api/compile reads raw/qa/
     ↓
Updates wiki/*.md with new cross-references
     ↓
autolink.py inserts wikilinks
     ↓
Obsidian derives new backlinks
     ↓
Graph grows denser, next query is richer
```

## Implementation Sketch

```javascript
// Save verified Q&A to raw/qa/
await fs.writeFile(`raw/qa/${slug}.md`, `---
type: qa
verified: true
question: "${question}"
date: "${today}"
tags: [${tags.join(', ')}]
---

${answer}
`)

// ranking.ts: boost verified Q&A
if (meta.verified === true) score *= 1.25
```

## Tradeoffs

| Pro | Con |
|---|---|
| System gets smarter with use | Unverified answers pollute the corpus |
| Past reasoning reused without re-querying | Compile cost scales with vault size |
| Citations become traceable over time | Old answers may become stale |

## When To Use

Any KB that runs repeated queries over a growing corpus where answers compound in value — internal team knowledge bases, personal research tools, engineering documentation systems.

## When NOT To Use

High-velocity domains where knowledge changes faster than the compile cadence. Don't use the compounding loop for anything where yesterday's answer is likely wrong today (e.g., live pricing, incident status).

## Real Examples

- Agentic-KB: `raw/qa/` stores verified user queries; `verified: true` triggers ×1.25 ranking boost in `web/src/lib/ranking.ts`
- Each compile folds Q&A back into `wiki/`, the autolinker inserts wikilinks, and Obsidian backlinks grow automatically

## Related Patterns

- [[patterns/pattern-llm-wiki]]
- [[patterns/pattern-hot-cache]]
- [[patterns/pattern-two-step-ingest]]
- [[concepts/rlm-pipeline]]
