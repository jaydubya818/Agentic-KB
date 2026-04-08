# Obsidian Knowledge Graph — Agentic-KB

How this vault works as a shared, queryable knowledge graph on top of the
Agentic-KB compile loop. Adapted from the Obsidian Knowledge Graph Guide.

## Core distinction: wikilinks vs backlinks

- **Wikilink** — forward link you write: `[[pattern-supervisor-worker]]`
- **Backlink** — reverse link Obsidian derives automatically from wikilinks

You never "create" a backlink. Wikilinks are the only thing we write; the
backlink panel on every note is a consequence. The autolinker's entire job
is to insert wikilinks for canonical entities; Obsidian does the rest.

## Stable IDs

Every markdown file in `wiki/` and `raw/` carries a stable ULID in
frontmatter (`id: 01JRK...`). Paths can change when the compiler
reorganizes — IDs cannot. Use `resolveById()` in `web/src/lib/ids.ts` for
citations that must survive moves. Backfill is idempotent:

```bash
node scripts/backfill-ids.mjs
```

New pages written by `/api/compile` and Q&A docs written by
`/api/query/save` get IDs automatically.

## Note schema (frontmatter)

```yaml
---
id: 01JRK4X2H8M6N3P5QZ7W9T1YBD
type: concept          # concept | pattern | framework | entity | synthesis | qa
status: stable         # stable | active | draft | archived
title: "Multi-Agent Systems"
tags: [multi-agent, orchestration]
parent:                # hierarchical
related:               # lateral — list of [[wikilinks]]
depends_on:            # hard dependency
works_with:            # people / systems
sources:               # raw/ docs this was compiled from
created: 2026-04-07
updated: 2026-04-08
---
```

Only `id`, `type`, `title`, `tags` are required. Add typed relationships
as you need them — don't pre-populate everything.

## Folder layout

```
wiki/
  concepts/        # ideas, vocabulary
  patterns/        # pattern-*.md
  frameworks/      # framework-*.md
  entities/        # people, orgs, tools
  recipes/         # step-by-step how-tos
  evaluations/     # benchmarks + judge harness notes
  summaries/       # compiled digests (including saved Q&A)
  syntheses/       # lint reports, cross-cutting rollups
raw/
  webhooks/        # external push ingest (per-namespace)
  qa/              # saved Q&A (Compounding Loop)
  architecture/    # oh-my-mermaid scans
  articles/ transcripts/ twitter/ ...
```

## Autolinker

`scripts/autolink.py` inserts wikilinks for approved canonical entities
from `scripts/entity-map.json`. It never touches frontmatter, code blocks,
inline code, existing wikilinks, markdown links, or HTML comments.

**Dry-run first** (always):

```bash
python3 scripts/autolink.py \
  --vault /Users/jaywest/Agentic-KB \
  --entity-map scripts/entity-map.json \
  --folder /wiki/ \
  --first-only \
  --report reports/autolink-dry.md
```

**Review the report**, then write-run:

```bash
python3 scripts/autolink.py \
  --vault /Users/jaywest/Agentic-KB \
  --entity-map scripts/entity-map.json \
  --folder /wiki/ \
  --first-only --write \
  --report reports/autolink-write.md
```

Default flag `--first-only` links the first occurrence per file only —
enough to create a navigable entry point without visual noise.

### Entity map rules

- Canonical names must be distinctive; avoid generic English
- Short acronyms (MCP, BMAD, CoT) → `case_sensitive: true`
- Review `reports/autolink-*.md` before every write run
- `raw/webhooks/`, `.obsidian/`, `assets/`, `node_modules/` are skipped

### Known cosmetic issue: self-links

Running the autolinker over `wiki/entities/andrej-karpathy.md` will
insert `[[andrej-karpathy]]` inside the page itself. Obsidian handles
self-links gracefully (renders as a plain link back to the same file).
To suppress, either hand-edit the entity pages or extend `autolink.py`
to skip when `target basename == current file stem`.

## Plugin stack

**Core (no install):** Backlinks, Properties, Graph view, Canvas, Daily
Notes, Templates.

**Essential community plugins:**

- **Dataview** — query the vault like a database. Powers orphan checks
  and the relationship dashboards below.
- **Templater** — guided note creation that auto-injects the frontmatter
  schema above.
- **Advanced URI** — already installed; lets the wiki web UI deep-link
  into Obsidian commands (e.g. graph view).

**Add later, after the schema is stable:**
- Excalidraw, ExcaliBrain, Extended Graph, Graph Link Types,
  Smart Connections, QuickAdd

## Dataview dashboards

### Orphans (no links in or out)

```dataview
TABLE file.folder
FROM ""
WHERE length(file.inlinks) = 0 AND length(file.outlinks) = 0
SORT file.name ASC
```

Run this weekly as a hygiene check. Anything that shows up is either
genuinely standalone or missed by the autolinker — candidate for adding
to `entity-map.json`.

### Patterns dashboard

```dataview
TABLE status, related
FROM "wiki/patterns"
WHERE type = "pattern"
SORT file.name ASC
```

### Recently-modified concepts

```dataview
TABLE updated, tags
FROM "wiki/concepts"
SORT updated DESC
LIMIT 20
```

## Integration with the compile loop

```
raw/            wikilinks inserted    backlinks derived      graph updates
  |                   |                     |                    |
  v                   v                     v                    v
Compile  →  wiki/*.md  →  autolink.py  →  Obsidian Backlinks  →  Graph View
                                                     ^
                                                     |
                                              /api/query cites
                                              wiki/ pages →
                                              user saves Q&A →
                                              raw/qa/ →
                                              next compile loops back
```

The compounding loop is the key: `/api/query` reads `wiki/`, user saves
the answer back to `raw/qa/`, next compile folds it into `wiki/`, the
autolinker injects wikilinks to canonical entities, Obsidian derives new
backlinks, and the graph grows denser without manual maintenance.

## Operating checklist

- [ ] Commit before every autolink write run
- [ ] Always dry-run first; scan the report
- [ ] Use `--first-only` unless you deliberately want saturation
- [ ] Keep `entity-map.json` human-curated; propose changes via PR
- [ ] Never let an AI write directly to canonical notes without review
- [ ] Run orphan check weekly; grow `entity-map.json` from the results
- [ ] Re-run `backfill-ids.mjs` after bulk imports
