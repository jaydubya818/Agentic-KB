---
title: "Agentic-KB — oh-my-mermaid Integration"
type: summary
source_file: wiki/repos/agentic-kb/repo-docs/docs/OH_MY_MERMAID.md
source_url: https://raw.githubusercontent.com/jaydubya818/Agentic-KB/main/docs/OH_MY_MERMAID.md
author: Jay West
date_published: 2026-04-07
date_ingested: 2026-04-10
tags: [agentic, observability, deployment, claude-code, knowledge-management]
key_concepts: [vault-architecture, compile-pipeline, compounding-loop]
confidence: high
---

## TL;DR

Documents the oh-my-mermaid integration for auto-generating architecture diagrams of the Agentic-KB codebase and ingesting them as raw docs for compilation into wiki pages. Engineers querying the KB get visual architecture context alongside prose.

## Workflow

1. **Scan** — Run `/omm-scan` skill in Claude Code inside the repo. Generates `.omm/` directory with Mermaid diagrams from multiple perspectives (overall structure, data flow, integrations, etc.).
2. **Ingest** — Run `./scripts/ingest-omm.sh`. Each perspective becomes a frontmattered markdown file in `raw/architecture/` tagged `architecture, mermaid, autogen`.
3. **Compile** — Hit "Compile New" in web UI or run `kb compile`. Compiler treats diagrams like any raw doc.
4. **Query** — Ask "show me how the compile pipeline flows" and the KB returns the Mermaid diagram plus prose.

## Re-running

`/omm-scan` is cheap to re-run after major refactors: `rm -rf .omm` then run the scan skill. The compiled-log picks up new files and skips unchanged ones.

## Tag Convention

Auto-generated architecture docs carry `tags: [architecture, mermaid, autogen]`. Use to filter in search or exclude from lint orphan detection (autogen files don't need inbound links).

## Compounding Loop Integration

```
.omm/ diagrams → raw/architecture/ → .compiled-log.json → Claude synth
→ wiki/*.md → /api/query → (verified answers) → raw/qa/ → next compile
```

The `raw/qa/` loop gives the system memory of its own answers. `verified: true` in frontmatter triggers ×1.25 ranking boost.

## Related Pages

- [[entities/oh-my-mermaid]]
- [[concepts/vault-architecture]]
- [[concepts/llm-wiki-compile-pipeline]]
- [[patterns/pattern-compounding-loop]]
