# Wikiwise — ingest/SKILL.md

Source: https://github.com/TristanH/wikiwise/blob/main/Sources/Wikiwise/Resources/scaffold/skills/ingest/SKILL.md
Retrieved: 2026-04-12

---

## Purpose
Single-source ingestion workflow. Takes a raw source and integrates it into the wiki.

## Steps
1. **Save raw** — write source content to `raw/` with appropriate subdirectory and slug filename
2. **Create source-summary** — write `wiki/summaries/<slug>.md` with full frontmatter
3. **Propagate claims** — update or create concept/pattern/framework pages with new information
4. **Cross-link aggressively** — 2-3 existing pages must link TO the new page (not just new page links out)
5. **Update index.md** — add new page to the master index
6. **Update home.md** — if content is significant enough to surface in top-level navigation
7. **Append log.md** — timestamp, source, pages created/updated, contradictions

## Key principle: cross-link aggressively
The most common ingest failure is creating a page that nobody links to. Before finishing, find 2-3 existing pages where the new content is relevant and add links from those pages to the new one. This prevents orphans and builds link density.

## Contradiction handling
If new content contradicts existing wiki content:
- Note it inline with `> ⚠️ Contradiction: [existing claim] vs [new claim]`
- Add entry to log.md contradiction section
- Do NOT silently overwrite — surface the tension

## home.md update trigger
Update home.md when:
- New page belongs in a domain hub (add to MoC)
- New pattern or concept is in the top 5 most-referenced
- Ingest reveals the "Where the KB is heading" section needs updating
