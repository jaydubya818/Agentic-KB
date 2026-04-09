---
title: Tech Stack — LLMwiki
type: canonical
repo_name: llmwiki
doc_type: tech_stack
tags: [canonical, llmwiki]
status: current
created: 2026-04-09
updated: 2026-04-09
---

# LLMwiki — Tech Stack

## CLI Tool

- **Language**: Node.js (JavaScript/TypeScript)
- **Package manager**: npm
- **Key modules**:
  - filesystem (read wiki pages)
  - markdown-it (parse Markdown frontmatter)
  - commander (CLI argument parsing)

**Command**: `npm run query "your question"`

**Location**: `/Users/jaywest/My\ LLM\ Wiki/packages/cli`

## Web UI

- **Framework**: React 18+ (Vite bundler)
- **Language**: TypeScript
- **Key libraries**:
  - lucide-react (icons)
  - tailwindcss (styling)
  - react-router (navigation)
- **Backend**: Express (Node.js)

**Location**: `/Users/jaywest/My\ LLM\ Wiki/packages/web`

**URL**: `http://localhost:3000/llmwiki`

## MCP Server

- **Framework**: Claude MCP SDK
- **Port**: 9001
- **Protocol**: Model Context Protocol (JSON-RPC)
- **Tools**: query_kb, list_topics, get_related

**Location**: `/Users/jaywest/My\ LLM\ Wiki/packages/mcp`

## Data Format

### Index (wiki/index.md)
```markdown
| Slug | Title | Type | Tags | Confidence | Status |
|------|-------|------|------|-----------|--------|
| pattern-supervisor-worker | Supervisor-Worker | pattern | orchestration, multi-agent | high | stable |
```

### Hot Cache (wiki/hot.md)
```markdown
## Most Accessed Patterns (480 / 600 words)

[[pattern-supervisor-worker]] — multi-agent orchestration (8 queries/week)
[[recipe-streaming-tokens]] — token generation efficiency (6 queries/week)
...
```

## Search

### Current (Keyword-based)
- Linear scan of index
- Match query words against title, tags
- Rank by type (patterns first) and confidence

### Planned (Full-text)
- **Technology**: Meilisearch or Elasticsearch
- **Index**: All wiki pages (title, body, metadata)
- **Latency target**: <500ms

## Performance

| Operation | Target | Current |
|-----------|--------|---------|
| CLI query (cached) | <100ms | 50–100ms ✓ |
| CLI query (full wiki) | <2s | 800ms–1.5s ✓ |
| Web page load | <300ms | 200–400ms |
| MCP query | <100ms | 50–80ms ✓ |
| Index rebuild | <30s | ~20s ✓ |

## Scaling

| Metric | Current | Capacity |
|--------|---------|----------|
| Wiki size | ~400KB | 50MB+ (no bottleneck) |
| Index size | ~50KB | 5MB+ (in memory) |
| Concurrent queries | 10+ | 1000+ (async) |

## Deployment

- CLI: Installed locally via npm, runs in user shell
- Web: Docker container or direct Node.js process
- MCP: Standalone process, connected to Claude Code

## Dependencies

```yaml
Core:
  - node (>=18)
  - npm

CLI:
  - markdown-it
  - commander

Web:
  - react
  - vite
  - tailwindcss
  - express

MCP:
  - @anthropic-sdk/mcp

Future (full-text search):
  - meilisearch
  - elasticsearch (optional)
```

## CI/CD

- **Tests**: Jest (unit + integration)
- **Linting**: ESLint
- **Type checking**: TypeScript
- **Build**: Vite (web), tsc (Node)

## Security

- No authentication (local use)
- File access restricted to wiki/ directory
- MCP server on localhost:9001 only (no public exposure)
