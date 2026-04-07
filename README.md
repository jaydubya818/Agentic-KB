# Agentic Engineering Knowledge Base
> Jay West | Built: 2026-04-04 | Maintained by LLM

## Quick Start

**Open in Obsidian**: Add `/Users/jaywest/Agentic-KB` as a new vault.

**Start querying**:
```bash
cd /Users/jaywest/Agentic-KB
claude "Read the CLAUDE.md and wiki/hot.md, then answer: [your question]"
```

**Ingest a new source**:
1. Drop file into `raw/` (papers/, transcripts/, framework-docs/, etc.)
2. Run: `claude "Ingest raw/[your-file] following the INGEST workflow in CLAUDE.md"`

**Lint the wiki**:
```bash
claude "Run the LINT workflow from CLAUDE.md and file the report in wiki/syntheses/"
```

## What's Inside

| Section | Count | Purpose |
|---------|-------|---------|
| `wiki/concepts/` | 20 | Universal agentic concepts |
| `wiki/patterns/` | 15 | Reusable design patterns |
| `wiki/frameworks/` | 11 | Tool/framework reference |
| `wiki/entities/` | 8 | People, companies, models |
| `wiki/summaries/` | 16 | Per-source summaries |
| `wiki/recipes/` | 8 | Copy-paste how-to guides |
| `wiki/evaluations/` | 2 | Framework comparisons |
| `wiki/personal/` | 3 | Jay's patterns & philosophy |
| **Total** | **83** | |

## Raw Sources

| Directory | Contents |
|-----------|---------|
| `raw/my-agents/` | 32 agent definitions from ~/.claude/agents/ |
| `raw/my-skills/` | 29 skill files from ~/.claude/skills/ |
| `raw/transcripts/` | Karpathy & Nate Herk LLM wiki transcripts |
| `raw/framework-docs/` | Karpathy gist |
| `raw/papers/` | Drop PDFs → md here |
| `raw/code-examples/` | Annotated code patterns |
| `raw/conversations/` | Notable Claude Code sessions |
| `raw/changelogs/` | Framework version notes |

## Key Files
- `CLAUDE.md` — Schema, workflows, rules
- `wiki/index.md` — Master catalog
- `wiki/hot.md` — Hot cache (read first)
- `wiki/log.md` — Operation audit log

## Graph View Colors (Obsidian)
- 🟢 Green: Concepts
- 🟠 Orange: Patterns  
- 🔵 Blue: Frameworks
- 🔴 Red: Entities
- 🟤 Brown: Recipes
- 🟣 Purple: Evaluations
