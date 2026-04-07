---
title: Write and Register a Custom MCP Server
type: recipe
difficulty: intermediate
time_estimate: 45-60 minutes
prerequisites:
  - Node.js 18+ or Bun
  - Claude Code CLI installed
  - "@modelcontextprotocol/sdk" package
tested: false
tags: [mcp, tool-use, typescript, claude-code, integration]
---

## Goal

Write a TypeScript MCP server with two tools and register it in Claude Code. After completing this recipe, Claude Code will have access to your custom tools in every session, accessible as `mcp__your-server__tool-name`.

This recipe builds a "notes" MCP server with `create_note` and `search_notes` tools — simple enough to follow but realistic enough to extend.

See [[frameworks/framework-mcp]] for protocol architecture.
See [[entities/mcp-ecosystem]] for examples of production MCP servers.

---

## Prerequisites

```bash
mkdir notes-mcp-server && cd notes-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk
npm install -D typescript tsx @types/node
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "outDir": "./dist"
  }
}
```

`package.json` — add:
```json
{
  "type": "module",
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "start": "node dist/index.js"
  }
}
```

---

## Steps

### Step 1 — Write the Server

```typescript
// src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  TextContent,
} from "@modelcontextprotocol/sdk/types.js"
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "fs"
import { join } from "path"

// Configuration
const NOTES_DIR = process.env.NOTES_DIR ?? join(process.env.HOME!, ".notes-mcp")

// Ensure notes directory exists
mkdirSync(NOTES_DIR, { recursive: true })

// Helper functions
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

function loadNote(filename: string): { title: string; content: string; created: string } | null {
  try {
    const raw = readFileSync(join(NOTES_DIR, filename), "utf-8")
    const lines = raw.split("\n")
    const titleLine = lines.find(l => l.startsWith("# "))
    const createdLine = lines.find(l => l.startsWith("Created: "))
    return {
      title: titleLine ? titleLine.slice(2) : filename.replace(".md", ""),
      content: raw,
      created: createdLine ? createdLine.slice(9) : "unknown"
    }
  } catch {
    return null
  }
}

// Create the MCP server
const server = new Server(
  {
    name: "notes-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {}
    }
  }
)

// Tool definitions
const TOOLS: Tool[] = [
  {
    name: "create_note",
    description: `Create a new note with a title and content. Notes are persisted to disk and searchable.
Use for: capturing decisions, documenting findings, storing code snippets, writing summaries.
Returns: confirmation with the note's file path.`,
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Note title. Will be used as filename (slugified)."
        },
        content: {
          type: "string",
          description: "Note body in markdown format."
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Optional tags for categorization."
        }
      },
      required: ["title", "content"]
    }
  },
  {
    name: "search_notes",
    description: `Search notes by keyword. Returns matching note titles and a snippet of content.
Use for: finding previously captured information, checking if a topic is already documented.
Returns: list of matching notes with titles, dates, and content previews.`,
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search term. Case-insensitive substring match against title and content."
        },
        max_results: {
          type: "number",
          description: "Maximum number of results to return. Default: 5."
        }
      },
      required: ["query"]
    }
  }
]

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }))

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request): Promise<{ content: TextContent[] }> => {
  const { name, arguments: args } = request.params

  if (name === "create_note") {
    const { title, content, tags = [] } = args as {
      title: string
      content: string
      tags?: string[]
    }

    const slug = slugify(title)
    const filename = `${slug}.md`
    const filePath = join(NOTES_DIR, filename)
    const now = new Date().toISOString()

    const tagLine = tags.length > 0 ? `\nTags: ${tags.join(", ")}` : ""
    const noteContent = `# ${title}\nCreated: ${now}${tagLine}\n\n${content}`

    writeFileSync(filePath, noteContent, "utf-8")

    return {
      content: [{
        type: "text",
        text: `Note created: ${filePath}\nTitle: ${title}\nSlug: ${slug}`
      }]
    }
  }

  if (name === "search_notes") {
    const { query, max_results = 5 } = args as { query: string; max_results?: number }
    const queryLower = query.toLowerCase()

    let files: string[]
    try {
      files = readdirSync(NOTES_DIR).filter(f => f.endsWith(".md"))
    } catch {
      return { content: [{ type: "text", text: "Notes directory is empty." }] }
    }

    const matches: { title: string; created: string; preview: string }[] = []

    for (const file of files) {
      if (matches.length >= max_results) break
      const note = loadNote(file)
      if (!note) continue
      if (note.content.toLowerCase().includes(queryLower)) {
        // Find the matching line for preview
        const matchingLine = note.content
          .split("\n")
          .find(l => l.toLowerCase().includes(queryLower)) ?? ""
        matches.push({
          title: note.title,
          created: note.created,
          preview: matchingLine.trim().slice(0, 150)
        })
      }
    }

    if (matches.length === 0) {
      return { content: [{ type: "text", text: `No notes found matching "${query}".` }] }
    }

    const resultText = matches
      .map((m, i) => `${i + 1}. **${m.title}** (${m.created.slice(0, 10)})\n   Preview: ${m.preview}`)
      .join("\n\n")

    return {
      content: [{
        type: "text",
        text: `Found ${matches.length} note(s) matching "${query}":\n\n${resultText}`
      }]
    }
  }

  throw new Error(`Unknown tool: ${name}`)
})

// Start the server
const transport = new StdioServerTransport()
await server.connect(transport)
// Server is now running — waiting for requests via stdin/stdout
```

### Step 2 — Build the Server

```bash
npm run build
# Outputs dist/index.js
```

Test it manually (optional):
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node dist/index.js
```
Expected: JSON response with your two tools listed.

### Step 3 — Register in Claude Code

Find or create `~/.claude/mcp_servers.json`:

```json
{
  "mcpServers": {
    "notes": {
      "command": "node",
      "args": ["/absolute/path/to/notes-mcp-server/dist/index.js"],
      "env": {
        "NOTES_DIR": "/Users/yourname/.notes-mcp"
      }
    }
  }
}
```

Critical: use the **absolute path** to `dist/index.js`. Relative paths don't work.

### Step 4 — Verify Registration

Restart Claude Code (or start a new session):
```bash
claude
```

In the session, ask:
```
What tools do you have available? Do you have any notes tools?
```

Claude Code should list `mcp__notes__create_note` and `mcp__notes__search_notes`.

### Step 5 — Test the Tools

Still in Claude Code:
```
Create a note titled "MCP Server Setup" with content: "I successfully built and registered a custom MCP server today. Key steps: build TypeScript, absolute path in mcp_servers.json, restart Claude Code."

Then search my notes for "MCP".
```

Expected: Claude Code calls `mcp__notes__create_note`, then calls `mcp__notes__search_notes` and finds the note you just created.

---

## Verification Checklist

- [ ] `npm run build` succeeds with no TypeScript errors
- [ ] `echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node dist/index.js` returns tool list
- [ ] `mcp_servers.json` has absolute path and valid JSON
- [ ] New Claude Code session shows notes tools in tool list
- [ ] `create_note` creates a file in `NOTES_DIR`
- [ ] `search_notes` finds a note created with `create_note`
- [ ] Tool call with invalid args returns a useful error message (not a crash)

---

## Common Failures & Fixes

### Failure: Claude Code doesn't show the MCP tools
Causes (in order of likelihood):
1. **Relative path in mcp_servers.json**: use absolute path — `pwd` in the project directory to get it
2. **Server crashes on start**: test with the manual echo command; check stderr for errors
3. **JSON syntax error in mcp_servers.json**: validate with `python3 -m json.tool ~/.claude/mcp_servers.json`
4. **Didn't restart Claude Code**: tools are only registered at session start
5. **Wrong module format**: ensure `"type": "module"` in package.json if using ESM imports

### Failure: Server starts but tool calls fail
Cause: runtime error in the tool handler. Fix: add try-catch in every tool handler and return `{ content: [{ type: "text", text: "Error: " + message }] }` — don't let exceptions propagate; the MCP host can't handle them gracefully.

### Failure: `NOTES_DIR` contains spaces and path breaks
Fix: quote the path properly in `mcp_servers.json`:
```json
"NOTES_DIR": "/Users/jay west/notes"  // spaces are fine in JSON string values
```

---

## Extension Ideas

1. **Add `list_notes` tool**: return all note titles and dates sorted by creation time
2. **Add `update_note` tool**: append to an existing note rather than creating a new one
3. **Add full-text search with ranking**: score matches by frequency and title match
4. **Add a `resources` section**: expose notes as MCP resources (readable by URI) in addition to tools
5. **Publish to npm**: add a bin script and `npx my-notes-server` as the command — zero-install for teammates

---

## Related Recipes

- [[recipes/recipe-llm-wiki-setup]] — use MCP to expose your wiki as tools
- [[recipes/recipe-build-tool-agent]] — consume MCP tools from a custom agent
- [[frameworks/framework-mcp]] — protocol architecture reference
- [[entities/mcp-ecosystem]] — existing servers you can use today
