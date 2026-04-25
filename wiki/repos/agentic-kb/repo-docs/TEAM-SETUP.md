---
repo_name: "Agentic-KB"
repo_visibility: public
source_type: github
branch: main
commit_sha: e69de29bb2d1d6434b8b29ae775ad8c2e48c5391
source_path: "TEAM-SETUP.md"
imported_at: "2026-04-25T16:05:33.256Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/Agentic-KB/main/TEAM-SETUP.md"
---

# Team Setup Guide

Get the full agentic stack running on your Mac in ~15 minutes.

---

## What You're Installing

| Component | What It Does | Port |
|-----------|-------------|------|
| **Agentic-KB** | Shared engineering knowledge base — query with Claude via `kb query` or the web UI | :3002 |
| **LLM Wiki (brain)** | Personal second brain — `brain ask` queries your own Obsidian vault | CLI |
| **Claude agents + skills** | Hermes orchestrator + 33 sub-agents + skills in `~/.claude` | — |
| **MCP servers** | Exposes both KBs as tools inside Claude Desktop and Claude Code | — |

---

## Prerequisites

- macOS (Apple Silicon or Intel)
- [Node.js 18+](https://nodejs.org) — `brew install node`
- [Git](https://git-scm.com)
- [Claude Desktop](https://claude.ai/download) — installed and signed in
- [Obsidian](https://obsidian.md) — optional but recommended
- Two API keys (get them before you start):
  - **Anthropic API key** — [console.anthropic.com](https://console.anthropic.com)
  - **OpenAI API key** — [platform.openai.com](https://platform.openai.com) (for `brain ask` LLM synthesis)

---

## One-Command Install

```bash
zsh <(curl -fsSL https://raw.githubusercontent.com/jaydubya818/Agentic-KB/main/scripts/team-setup.sh)
```

The script will ask for your API keys, install paths, and Obsidian vault location, then handle everything else.

**After it finishes:**
1. Restart Claude Desktop to pick up the new MCP servers
2. Open Obsidian and point it at your new vault
3. Edit `~/Documents/Obsidian Vault/personal/hermes-operating-context.md` — fill in your P1/P2/P3 priorities
4. Reload your shell: `source ~/.zshrc`

---

## What Gets Installed Where

```
~/Agentic-KB/               ← shared engineering KB (this repo)
  web/                      ← Next.js web server (auto-starts at :3002)
  cli/kb.js                 ← kb CLI
  mcp/server.js             ← MCP server for Claude Desktop
  logs/                     ← web server logs

~/My LLM Wiki/              ← personal brain CLI
  packages/cli/             ← brain CLI
  packages/mcp/             ← MCP server for Claude Desktop
  wiki/ → (symlink)         ← points to your Obsidian vault
  .env                      ← OPENAI_API_KEY + SECOND_BRAIN_ROOT

~/.claude/                  ← Claude Code config
  agents/                   ← Hermes + 33 sub-agents
  skills/                   ← all skills (gsd, kb, graphify, etc.)

~/Documents/Obsidian Vault/ ← your personal vault (or wherever you put it)
  CLAUDE.md                 ← vault context for Claude
  personal/
    hermes-operating-context.md  ← YOUR priority stack (edit this!)
  hot.md                    ← hot cache for fast session loading
```

---

## Daily Usage

### Query the shared KB
```bash
kb query "What is the fan-out worker pattern?"
kb query "How does LangGraph handle state?" --scope all
kb search "supervisor worker"
```

### Query your personal brain
```bash
brain ask "What decisions did I make about the auth system last month?"
brain ask "What's on my plate for this sprint?"
```

### Open the web UI
```
http://localhost:3002
```

### Ingest new content into the KB
```bash
kb ingest-file path/to/article.pdf
kb ingest-youtube https://youtube.com/watch?v=...
kb compile          # rebuild the index after ingesting
```

### Use inside Claude Code
The MCP servers are automatically available. In any Claude Code session:
- `agentic-kb` tools: search, query, read wiki articles
- `second-brain` tools: ask, ingest, compile your personal vault

---

## Personalizing Hermes

Hermes is your AI orchestrator. On every session start it reads:

1. `CLAUDE.md` — vault structure and context
2. `personal/hermes-operating-context.md` — **your priority stack and open blockers**
3. `hot.md` — frequently-used patterns (≤500 words)

**The most important thing to update is `hermes-operating-context.md`.** It's what makes Hermes useful vs generic. Fill in:
- What you're working on (P1/P2/P3)
- Current blockers
- Your active projects
- Your work domains

---

## Shared KB vs Personal Brain

| | Agentic-KB | LLM Wiki (brain) |
|--|-----------|-----------------|
| **Content** | Shared team engineering knowledge | Your personal notes, projects, decisions |
| **Query tool** | `kb query` | `brain ask` |
| **LLM** | Claude (Anthropic) | OpenAI GPT |
| **Ingestion** | `kb ingest-file`, `kb ingest-youtube` | `brain ingest` (from `raw/` folder) |
| **Visibility** | Team-wide | Personal only |

---

## Troubleshooting

**Web server not responding on :3002**
```bash
launchctl kickstart -k gui/$(id -u)/com.$(whoami).agentic-kb-web
# Or check logs:
tail -f ~/Agentic-KB/logs/web-server.log
```

**`kb query` returns "No articles found"**
- The wiki index may be empty — run `kb compile`
- Try `--scope all` to include private content

**`brain ask` returns wrong results**
- Check `OPENAI_API_KEY` is set in `~/My LLM Wiki/.env`
- The search is keyword-based — use specific, unique terms from the page you're looking for
- Run `brain compile` to rebuild the index after adding new content

**MCP servers not showing in Claude**
- Restart Claude Desktop after setup
- Check `~/Library/Application Support/Claude/claude_desktop_config.json` has `agentic-kb` and `second-brain` entries

**Build fails with TypeScript errors**
```bash
cd ~/Agentic-KB/web
# The ignoreBuildErrors flag handles the pre-existing type error
npm run build
```

---

## Updating

```bash
# Pull latest KB content and code
git -C ~/Agentic-KB pull
cd ~/Agentic-KB/web && npm run build

# Pull latest brain CLI
git -C ~/My\ LLM\ Wiki pull
npm run build --prefix ~/My\ LLM\ Wiki/packages/core
npm run build --prefix ~/My\ LLM\ Wiki/packages/cli
npm run build --prefix ~/My\ LLM\ Wiki/packages/mcp

# Restart web server after code/config changes or stale behavior
launchctl kickstart -k gui/$(id -u)/com.$(whoami).agentic-kb-web
```

---

## Contributing to the Shared KB

The `wiki/` folder in Agentic-KB is the shared knowledge base. To add content:

1. Drop source files into `raw/` (markdown, PDF, YouTube URLs)
2. Run `kb ingest-file raw/your-file.md` or `kb compile`
3. Review the generated wiki page in `wiki/`
4. Submit a PR

**What belongs in the shared KB:** Engineering patterns, framework docs, architecture decisions, research findings, technical how-tos.

**What stays personal:** Project-specific decisions, your daily notes, personal priorities, anything with business-sensitive details.
