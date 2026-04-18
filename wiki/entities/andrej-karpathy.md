---
id: 01KNNVX2QNRXD9HHWP1VAX9WWE
title: "Andrej Karpathy"
type: entity
tags: [research, llm, knowledge-base, agents]
created: 2025-01-01
updated: 2026-04-07
visibility: public
confidence: high
related: [concepts/llm-wiki, patterns/pattern-llm-wiki, entities/openai]
source: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
---

# [[andrej-karpathy]]

AI researcher and educator. Formerly at [[openai]] (co-founder) and Tesla (Director of AI). Known for influential educational content on deep learning and LLMs.

## Relevance to Agentic KB

[[andrej-karpathy]] authored the **[[llm-wiki]] Pattern** — a lightweight architecture for LLM-maintained knowledge bases. The pattern has been widely adopted for personal and enterprise knowledge management.

### [[llm-wiki]] Pattern (Gist)

Published as a GitHub Gist, the pattern defines:
- A three-layer architecture: Raw Sources → Wiki → Schema
- Three operations: Ingest, Query, Lint
- Special files: `index.md` (catalog) and `log.md` (append-only log)
- Implementation guidance: Obsidian frontend, Git for version history

> "Left vague so that you can hack it and customize it to your own project."

The schema (a `CLAUDE.md` or equivalent system prompt) is intended to co-evolve with the user's needs — making the pattern deliberately extensible rather than prescriptive.

## See Also

- [LLM Wiki Concept](../concepts/llm-wiki.md)
- [LLM Wiki Pattern](../patterns/pattern-llm-wiki.md)
- [Key Agentic Researchers](../entities/key-agentic-researchers.md)
