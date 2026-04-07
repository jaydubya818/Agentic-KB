# Agentic KB — Wiki Schema

> This file is read by `/api/compile` as a system prompt for Claude.
> It defines how raw documents should be compiled into wiki pages.
> Edit this file to evolve conventions as the KB grows.

---

## Directory Structure

All wiki pages live under `wiki/` and belong to exactly one section:

| Section | What goes here |
|---|---|
| `concepts/` | Definitions, mental models, foundational ideas (e.g. agent loop, context window, tool use) |
| `patterns/` | Reusable design patterns for building agents (name with `pattern-` prefix) |
| `frameworks/` | Third-party frameworks and tools (LangChain, CrewAI, AutoGen, etc.) |
| `entities/` | People, companies, projects, systems that recur across the KB |
| `recipes/` | Step-by-step how-tos and implementation guides |
| `evaluations/` | Benchmark results, model comparisons, capability assessments |
| `summaries/` | Condensed summaries of specific raw documents (papers, articles, talks) |
| `syntheses/` | Cross-source syntheses that draw from multiple raw documents |
| `personal/` | Jay's personal notes, preferences, stack decisions (visibility: private) |

---

## Frontmatter Schema

Every wiki page MUST have this frontmatter:

```yaml
---
title: "Human-readable title"
type: concept | pattern | framework | entity | recipe | evaluation | summary | synthesis | personal
tags: [tag1, tag2, tag3]
created: YYYY-MM-DD
updated: YYYY-MM-DD
visibility: public | private
---
```

Optional fields:
```yaml
confidence: high | medium | low | speculative
related: [other-page-slug, another-page-slug]
source: url or filename of the raw document this was compiled from
```

Rules:
- `visibility: private` for anything in `personal/` or marked sensitive in the raw doc
- `confidence: speculative` for anything inferred, not explicitly stated in the source
- `tags` should be 2–5 lowercase kebab-case tags. Reuse existing tags rather than creating new ones.

---

## Page Naming

- Filenames are **kebab-case**, no spaces: `multi-agent-orchestration.md`
- Patterns always prefixed: `pattern-supervisor-worker.md`
- Summaries include source: `summary-karpathy-llm-wiki.md`
- Entities use full name: `anthropic.md`, `jay-west-agent-stack.md`

---

## Content Style

### Page length
- **Concepts**: 200–500 words. Define the idea clearly, give an example, note common pitfalls.
- **Patterns**: 300–600 words. Include a `## When to Use`, `## Structure`, `## Example`, `## Trade-offs`.
- **Summaries**: 150–300 words. Capture the 3–5 key ideas, not a full rewrite.
- **Syntheses**: 400–800 words. Explicitly note where sources agree, where they diverge.

### Required sections by type

**Patterns** must include:
```markdown
## When to Use
## Structure
## Example
## Trade-offs
## Related Patterns
```

**Concepts** must include:
```markdown
## Definition
## Why It Matters
## Example
```

**Frameworks** must include:
```markdown
## What It Does
## Key Concepts
## When to Use It
## Limitations
```

### Cross-references
- Use markdown links to related pages: `[supervisor-worker pattern](../patterns/pattern-supervisor-worker.md)`
- Mention 2–4 related pages per article — but only link pages that genuinely exist
- Add a `## See Also` section at the bottom for related pages

### Contradiction handling
- If a raw doc contradicts an existing wiki page, add a blockquote:
  ```
  > ⚠️ **Contradiction**: This source claims X. [Existing page](link.md) says Y. Flagged for review.
  ```
- Do NOT silently overwrite existing claims

### Quotes
- Preserve notable direct quotes from the raw source, formatted as blockquotes
- Attribute with the source title, not the raw filename

---

## What NOT to Do

- Do not create more than 3 pages per raw document — synthesise, don't fragment
- Do not duplicate content already well-covered in an existing page — update it instead
- Do not create stub pages with fewer than 100 words — wait until there's enough to say
- Do not include raw file paths, ingestion timestamps, or internal metadata in page content
- Do not put everything in `summaries/` — use the correct section for the content type

---

## Tag Vocabulary (reuse these)

`agents`, `orchestration`, `tools`, `memory`, `context`, `patterns`, `llm`, `evaluation`,
`prompting`, `safety`, `deployment`, `architecture`, `retrieval`, `rag`, `knowledge-base`,
`workflow`, `automation`, `claude`, `openai`, `frameworks`, `research`, `personal`,
`jay-stack`, `enterprise`, `mcp`, `obsidian`

---

## Compile Behaviour

When compiling a raw document:

1. **Identify** the 1–3 most important ideas in the document
2. **Check** whether an existing wiki page already covers each idea
   - If yes: update that page with new information, note the source
   - If no: create a new page in the correct section
3. **Write** clean, structured markdown following the rules above
4. **Cross-reference** at least 2 related existing pages
5. **Log** what was created/updated in `wiki/log.md`

Priority order when in doubt about section placement:
`patterns/` > `concepts/` > `frameworks/` > `summaries/`
