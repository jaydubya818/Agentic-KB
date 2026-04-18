---
title: Vault Foundation
type: moc
category: structure
tags: [vault, obsidian, structure, para, zettelkasten, templates, metadata]
created: 2026-04-13
updated: 2026-04-13
---

# Vault Foundation

The structural bedrock of the Agentic-KB. Covers folder architecture, note organization philosophy, template systems, metadata conventions, and attachment handling. Everything here is about how the vault is wired — not what's in it.

---

## Folder Structure

This vault uses a hybrid PARA/[[llm-wiki-pattern]] model adapted for agentic engineering:

- **PARA layer** — Projects, Areas, Resources, Archive maps cleanly to `projects/`, `wiki/personal/`, `wiki/concepts|patterns|frameworks/`, and `raw/` respectively.
- **[[llm-wiki-pattern]] layer** — Atomic concept and pattern pages in `wiki/concepts/` and `wiki/patterns/` function as permanent notes with bidirectional links. Summaries in `wiki/summaries/` are literature notes. Syntheses in `wiki/syntheses/` are synthesis notes.
- **LLM-owned layer** — `wiki/` is agent-maintained. `raw/` is human-curated and immutable. The split enforces provenance hygiene.

Key directories:

| Directory | Role | Owner |
|-----------|------|-------|
| `raw/` | Source truth — papers, transcripts, Jay's agent/skill definitions | Human (immutable) |
| `wiki/concepts/` | Permanent atomic concept notes | LLM |
| `wiki/patterns/` | Reusable design pattern pages | LLM |
| `wiki/frameworks/` | Framework reference pages | LLM |
| `wiki/summaries/` | Literature notes (1:1 with raw sources) | LLM |
| `wiki/syntheses/` | Cross-source analysis | LLM |
| `wiki/recipes/` | Step-by-step implementation guides | LLM |
| `wiki/personal/` | Jay's validated patterns, war stories, operating context | LLM (Jay's voice) |
| `wiki/mocs/` | Maps of Content — domain hub pages | LLM |
| `wiki/prompt-library/` | Reusable prompts and Claude slash commands | LLM |
| `wiki/daily-systems/` | Daily/weekly review templates and cadence docs | LLM |
| `knowledge-systems/research-engine/` | 6-lens research module | LLM |

---

## MOCs & Hub Notes

Every domain has a Map of Content — a hub page that provides structured navigation and context. Current MoCs:

- [[mocs/orchestration|Orchestration]] — Multi-agent, frameworks, [[pattern-fan-out-worker]] patterns
- [[mocs/memory|Memory]] — Memory systems, RLM pipeline, [[pattern-hot-cache]]
- [[mocs/tool-use|Tool Use]] — [[mcp-ecosystem]], permissions, tool design
- [[mocs/evaluation|Evaluation]] — [[llm-as-judge]], trajectory eval, benchmarks
- [[mocs/vault-foundation|Vault Foundation]] ← you are here
- [[mocs/claude-integration|Claude Integration]] — Hermes, CLAUDE.md, [[mcp-ecosystem]] tools, session memory
- [[mocs/core-plugins|Core Plugins]] — Obsidian plugin stack for the KB
- [[mocs/knowledge-workflows|Knowledge Workflows]] — Capture, process, connect, research
- [[mocs/automation|Automation]] — Skills, hooks, auto-tagging, maintenance
- [[mocs/advanced-techniques|Advanced Techniques]] — Agentic note-taking, vault-as-context
- [[mocs/visualization|Visualization]] — Graph view, canvas, knowledge maps
- [[mocs/maintenance|Maintenance & Optimization]] — Health checks, backup, performance
- [[mocs/resources|Community & Resources]] — Plugin recommendations, best practices
- [[mocs/evolution|Evolution & Scaling]] — Multi-vault, long-term growth

**2-click rule:** every page in the vault must be reachable from [[home]] in ≤2 clicks (Home → MoC → Page).

---

## Templates System

Templates live in `knowledge-systems/research-engine/templates/` for research artifacts and are defined by schema in [[schema]]:

- [[knowledge-systems/research-engine/templates/research-question-intake|Research Intake]] — Required pre-research gate
- [[knowledge-systems/research-engine/templates/deep-dive-template|Deep Dive]] — Full 6-lens project
- [[knowledge-systems/research-engine/templates/decision-memo-template|Decision Memo]] — Options → recommendation
- [[knowledge-systems/research-engine/templates/executive-summary-template|Executive Summary]] — 500-word verdict
- [[knowledge-systems/research-engine/templates/project-template|Project]] — Full project workspace
- [[knowledge-systems/research-engine/templates/source-template|Source]] — Individual source capture

Wiki page templates are defined by frontmatter schema in [[CLAUDE.md]] — concept, pattern, framework, recipe, summary, synthesis, personal page types all have required sections.

---

## Metadata & Dataview

Frontmatter schema is enforced by page type. Every wiki page has:
- `type` — concept | pattern | framework | recipe | summary | synthesis | personal | moc
- `tags` — domain tags from the taxonomy in [[CLAUDE.md]]
- `confidence` — high | medium | low (honest, not aspirational)
- `created` / `updated` — ISO dates
- `status` — stable | evolving | deprecated (concept pages)

See [[schema]] for the full field reference and [[CLAUDE.md]] for all required sections per page type.

**Dataview queries** (for Obsidian rendering): use standard Dataview syntax against frontmatter fields. Common useful queries: pages by `confidence: low` (candidates for verification), pages by `type: framework` where `last_checked` is stale, pages with `tested: false` older than 30 days.

---

## Attachment Management

Raw source files (PDFs, audio transcripts) land in `raw/` subdirectories:
- `raw/papers/` — Academic PDFs, converted to `.md`
- `raw/transcripts/` — Video/podcast transcripts
- `raw/framework-docs/` — External documentation snapshots
- `raw/my-agents/` — Jay's `~/.claude/agents/*.md` definitions
- `raw/my-skills/` — Jay's `~/.claude/skills/*/SKILL.md` files
- `raw/my-hooks/` — Hook configurations
- `raw/conversations/` — Notable exported [[framework-claude-code]] sessions

**Rule:** `raw/` is immutable. LLMs read it, never write it. All processed output goes to `wiki/`.

---

## Related

- [[schema]] — Full frontmatter field reference
- [[mocs/claude-integration|Claude Integration MoC]]
- [[home]] — Visual front door
- [[index]] — Master catalog
