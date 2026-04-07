# Agentic KB — MCP Server

Exposes the knowledge base as MCP tools for Claude Desktop, Claude Code, and any agent.

## Tools

| Tool | Description |
|------|-------------|
| `search_wiki` | Full-text search across articles |
| `read_article` | Read a specific article by slug |
| `read_index` | Get the master catalog |
| `list_articles` | List articles in a section |
| `query_wiki` | AI-powered WikiQuery via streaming API |

## Setup (Claude Desktop)

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "agentic-kb": {
      "command": "node",
      "args": ["/Users/jaywest/Agentic-KB/mcp/server.js"],
      "env": {
        "KB_API_URL": "http://localhost:3002",
        "PRIVATE_PIN": "jay1234"
      }
    }
  }
}
```

## Setup (Claude Code / any MCP client)

```bash
node /Users/jaywest/Agentic-KB/mcp/server.js
```

## CLI

```bash
# Search public wiki
node /Users/jaywest/Agentic-KB/cli/kb.js search "multi-agent orchestration"

# Search including private
PRIVATE_PIN=jay1234 node /Users/jaywest/Agentic-KB/cli/kb.js search "tool design" --scope all

# Ask a question
node /Users/jaywest/Agentic-KB/cli/kb.js query "What is the best pattern for supervisor-worker agents?"

# Read an article
node /Users/jaywest/Agentic-KB/cli/kb.js read concepts/tool-use

# List a section
node /Users/jaywest/Agentic-KB/cli/kb.js list frameworks

# Check pending ingestion queue
node /Users/jaywest/Agentic-KB/cli/kb.js pending
```

## Symlink for convenience

```bash
sudo ln -sf /Users/jaywest/Agentic-KB/cli/kb.js /usr/local/bin/kb
```

Then just: `kb search "tool use"` from anywhere.
