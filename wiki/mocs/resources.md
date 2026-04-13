---
title: Community & Resources
type: moc
category: structure
tags: [resources, plugins, best-practices, learning, templates, community]
created: 2026-04-13
updated: 2026-04-13
---

# Community & Resources

Curated external references, plugin recommendations, best practices, and learning resources for agentic engineering with Claude + Obsidian.

---

## Plugin Recommendations

Essential plugins for the Agentic-KB stack (all from Obsidian community):

| Plugin | Author | Purpose | Priority |
|--------|--------|---------|---------|
| Dataview | blacksmithgu | Queryable frontmatter, live dashboards | Essential |
| Templater | SilentVoid13 | Dynamic templates with JavaScript | Essential |
| Obsidian Git | Vinzent03 | Auto-commit backup + git history | Essential |
| Terminal | Namikaze09 | Shell inside Obsidian → Claude Code | Essential |
| Periodic Notes | liamcain | Daily/weekly/monthly note templates | High |
| QuickAdd | chhoumann | Fast note capture from command palette | High |
| Advanced URI | Vinzent03 | Deep vault links from external apps/scripts | High |
| Graph Analysis | SkepticMystic | Link strength metrics + community detection | Medium |
| Juggl | HEmile | Interactive filterable graph view | Medium |
| Excalidraw | zsolt.vician | Hand-drawn diagrams embedded in notes | Medium |
| Linter | platers | Auto-enforce frontmatter schema on save | Medium |

**Anti-recommendations** (avoid for this vault type):
- Database plugins (Notion-style) — defeats the plain-text philosophy
- Sync plugins other than git — risk of conflict with the agentic write layer
- AI plugins that auto-modify notes — conflicts with LLM-ownership rules in CLAUDE.md

---

## Best Practices

Distilled from Jay's operating experience (see [[personal/personal-jays-framework-philosophy]]):

**On vault structure:**
- Folder depth > 3 levels creates navigation friction. Flatten aggressively.
- MOC pages beat folders for discovery. Use folders for containment, MoCs for navigation.
- `raw/` immutability is non-negotiable — violating it makes provenance untrustworthy.

**On Claude integration:**
- CLAUDE.md is a contract. When Claude violates it, fix the contract, not the behavior.
- Hot cache discipline: if hot.md exceeds 500 words, prune the oldest entries — not the most-linked ones.
- Session-start reads cost ~5 seconds and prevent hours of context-free drift. Always pay the cost.

**On knowledge quality:**
- One `high` confidence claim backed by two independent sources beats ten `medium` claims.
- `[UNVERIFIED]` is not shame — it's an honest audit trail. Don't delete it; resolve it.
- Synthesis pages are worth more than 10 summaries. Invest in synthesis.

**On automation:**
- Automate the capture step (Wikiwise, Readwise → raw/) and the maintenance step (lint).
- Don't automate the synthesis step — that's where judgment matters most.
- Every automation adds a dependency. Add dependencies only when the benefit is clear.

---

## Shared Vault Templates

The Agentic-KB is itself a shareable template for any engineer who wants an LLM-maintained engineering KB. Key files to share:

- `CLAUDE.md` — the full schema and workflow spec
- `wiki/mocs/` — all MoC pages as navigation scaffolding
- `knowledge-systems/research-engine/` — the full research module
- `wiki/prompt-library/` — the prompt library
- `wiki/daily-systems/` — daily/weekly system templates

**Vault template registry (external):**
- Obsidian Forum: obsidian.md/forum → Templates & Showcase
- GitHub: search `obsidian-vault-template` for community-maintained starters
- Obsidian October submissions: annual community vault showcase

---

## Learning Resources

**Foundational reading (all ingested into this KB):**
- [[summaries/karpathy-llm-wiki-video]] — Karpathy's LLM wiki pattern (the seed concept)
- [[summaries/karpathy-llm-wiki-gist]] — Karpathy's gist with implementation details
- [[summaries/summary-layered-agent-memory-obsidian]] — 3-tier vault architecture for agents
- [[summaries/summary-research-skill-graph]] — 6-lens research methodology
- [[summaries/vault-3tier-architecture]] — formal vault architecture analysis

**External resources (web search for current links):**
- Anthropic Claude Code documentation — `docs.claude.ai`
- MCP specification — `modelcontextprotocol.io`
- LangGraph documentation — for orchestration framework reference
- Obsidian Help — `help.obsidian.md`
- Obsidian Community Discord — `discord.gg/obsidianmd`

**YouTube channels worth following:**
- Andrej Karpathy — LLM fundamentals and wiki patterns
- David Shapiro — agentic AI patterns and Claude Code usage
- Nicole van der Hoeven — Obsidian workflows and PKM

**Key papers in `raw/papers/`:** see [[index]] → Summaries for full list of ingested academic sources.

---

## Related

- [[personal/personal-jays-framework-philosophy]] — Jay's opinionated framework preferences
- [[mocs/core-plugins|Core Plugins]] — Plugin setup guide
- [[mocs/evolution|Evolution & Scaling]] — Long-term KB growth patterns
- [[index]] — Master catalog
