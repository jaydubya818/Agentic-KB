---
id: 01KNNVX3MHCJ7QP45NR8KT2WXZ
title: Use Your LLM Wiki as Codebase Memory
type: recipe
difficulty: intermediate
time_estimate: 30-60 minutes to set up, then ongoing
prerequisites:
  - An existing codebase (any language/framework)
  - Claude Code or MCP-connected KB
  - Basic familiarity with the [[concepts/llm-wiki-pattern]]
tested: false
tags: [memory, context-management, claude-code, pattern-llm-wiki, prompt-engineering, tool-use]
---

## Goal

Wire your Agentic KB into a coding project so Claude has persistent memory of your codebase's components, architecture decisions, API contracts, and rejected patterns — across every session. Without this, every new [[framework-claude-code]] session starts blind: it re-discovers your component library, asks about design decisions you've already settled, and occasionally re-proposes approaches you already rejected.

This recipe extends the [[concepts/llm-wiki-pattern]] into coding-project territory. The wiki becomes your project's living documentation layer — written by Claude, read by Claude, compounding over time.

---

## Prerequisites

- Agentic KB running (web server at `localhost:3002` and/or [[mcp-ecosystem]] server connected)
- A codebase you're actively working in with [[framework-claude-code]]
- `CLAUDE.md` in your project root (or willing to create one)

---

## Steps

### Step 1 — Create a Project Namespace in raw/

Inside `raw/`, create a folder for your project:

```
raw/
└── projects/
    └── {your-project-slug}/
        ├── codebase-snapshot.md   # high-level overview you write once
        ├── components/            # drop component files or excerpts here
        ├── api-contracts/         # OpenAPI specs, type definitions, schema files
        ├── decisions/             # Architecture decisions and their rationale
        └── sessions/              # Export notable Claude sessions here
```

Write `codebase-snapshot.md` manually — this is the one file you author. Keep it under 500 words:

```markdown
# Project: {name}
Stack: React 18, TypeScript, Shadcn/ui, Tailwind, Postgres
State: Zustand
Routing: React Router v6
API: REST, base URL /api/v1, auth via Bearer token in Authorization header

## Key constraints
- All new UI components must use Shadcn primitives — no raw HTML elements
- No class components — hooks only
- API calls go through src/lib/api.ts, never fetch() directly
- Form validation: Zod schemas, never ad-hoc if/else checks

## What NOT to suggest
- Redux (rejected in ADR-001, too much boilerplate for our scale)
- Axios (replaced with native fetch wrapper, see src/lib/api.ts)
- CSS modules (we standardized on Tailwind)
```

### Step 2 — Add a `components/` and `decisions/` Section to wiki/

Your KB's `wiki/` directory needs two new subdirectories for this use case:

```bash
mkdir -p wiki/projects/{your-project-slug}/components
mkdir -p wiki/projects/{your-project-slug}/decisions
```

These follow the same frontmatter schema as other wiki pages. Component pages use `type: concept` with a `category: component` tag. Decision pages use `type: pattern` with `category: decision`.

**Component page template** (`wiki/projects/{slug}/components/data-table.md`):
```markdown
---
title: DataTable Component
type: concept
tags: [component, shadcn, react, {project-slug}]
confidence: high
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

## TL;DR
Reusable paginated data table built on Shadcn Table + TanStack Table v8.

## Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| data | T[] | yes | Row data array |
| columns | ColumnDef<T>[] | yes | TanStack column definitions |
| pageSize | number | no | Default 20 |
| onRowClick | (row: T) => void | no | Row selection handler |

## Shadcn dependencies
`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, `Button` (pagination)

## Usage example
\`\`\`tsx
<DataTable data={users} columns={userColumns} onRowClick={handleUserSelect} />
\`\`\`

## Known gotchas
- Column `id` must be unique — TanStack will silently break sorting if two columns share an id
- `onRowClick` fires on the entire row including action buttons — wrap action buttons in `e.stopPropagation()`
```

**Decision page template** (`wiki/projects/{slug}/decisions/adr-001-no-redux.md`):
```markdown
---
title: "ADR-001: No Redux"
type: pattern
category: decision
tags: [decision, state-management, {project-slug}]
confidence: high
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

## Decision
Use Zustand for global state. Do not introduce Redux or Redux Toolkit.

## Context
Project has ~15 screens, moderate shared state (auth, user profile, notifications). Redux overhead (boilerplate, devtools setup, action naming) exceeds benefit at this scale.

## Alternatives rejected
- **Redux Toolkit**: still requires action/slice/selector ceremony. Rejected 2026-01.
- **Jotai**: considered, but team is already fluent in Zustand.

## Consequences
All new global state goes in `src/stores/`. Co-locate store slice with the feature it serves.
```

### Step 3 — Ingest Your Codebase into the KB

Drop source files into `raw/projects/{slug}/` then trigger ingestion. For a first pass, focus on:

1. **Component index**: paste your `src/components/` directory listing with file sizes — Claude will request what it needs
2. **Key source files**: drop the 5-10 most-referenced files (your API client, auth hooks, main layout, etc.)
3. **Existing docs**: any README sections, Storybook stories, or Confluence pages about the project

Trigger compilation:
```bash
kb compile
# or via MCP:
compile_wiki()
```

Claude reads the raw sources and writes structured wiki pages under `wiki/projects/{slug}/`.

### Step 4 — Update CLAUDE.md in Your Project Root

Add a section to your project's `CLAUDE.md` that points Claude at the KB:

```markdown
## Knowledge Base

Before starting any task, consult the Agentic KB for project context:
- Components: search_wiki(query: "{component name}", scope: "public")
- Decisions: read_article(slug: "projects/{slug}/decisions/adr-NNN")
- Architecture: read_article(slug: "projects/{slug}/codebase-snapshot")

After completing any task, update the KB if you:
- Created a new component → create wiki/projects/{slug}/components/{name}.md
- Made an architectural decision → create wiki/projects/{slug}/decisions/adr-NNN.md
- Discovered a gotcha or constraint → add to the relevant component or decision page
```

### Step 5 — Add the "Consult First, Update After" Prompt Wrapper

For every non-trivial coding task, prepend this to your prompt:

```
Before starting: search the KB for relevant components, decisions, and constraints.
After completing: update the KB with any new components, decisions, or gotchas discovered.

Task: {your actual request}
```

You can bake this into a [[framework-claude-code]] slash command or a `CLAUDE.md` instruction so it runs automatically.

### Step 6 — Export Sessions Periodically

After any session where significant decisions were made, export the conversation into `raw/projects/{slug}/sessions/YYYY-MM-DD-{topic}.md` and run `kb compile`. This is how the KB learns from your actual work rather than just your initial documentation.

---

## Verification

After setup, test with a fresh [[framework-claude-code]] session (no prior context):

1. Ask: *"What UI components do we have for displaying tabular data?"* — Claude should cite the KB's component pages, not guess.
2. Ask: *"Should I use Redux for this new feature?"* — Claude should reference ADR-001 and recommend Zustand without you having to explain it.
3. Add a new component and ask Claude to document it → verify a new page appears in `wiki/projects/{slug}/components/`.

If Claude answers from KB citations rather than general knowledge, the loop is working.

---

## Common Failures & Fixes

### Failure: Claude ignores the KB and answers from general knowledge
Cause: The `CLAUDE.md` instruction is too weak or the [[mcp-ecosystem]] server isn't connected. Fix: Make the instruction more explicit — "You MUST search the KB before answering any question about this codebase" — and verify `search_wiki` is available as an [[mcp-ecosystem]] tool.

### Failure: KB pages get out of sync with actual code
Cause: The "update after" step gets skipped when you're moving fast. Fix: Add it to your git pre-commit hook or a [[framework-claude-code]] post-task hook — run `kb lint` after any session to surface stale pages flagged by `updated` date drift vs. file modification dates.

### Failure: Component pages are too verbose and blow the context budget
Cause: Claude writes everything it knows about a component. Fix: Add to your `wiki/schema.md` a max-length rule for component pages (e.g., "component pages must not exceed 300 words; prefer tables over prose").

---

## Next Steps

1. **Auto-ingest on git push**: use the GitHub Actions webhook (`kb-ingest.yml`) to automatically ingest merged PRs as decision records
2. **Add an `api-contracts/` section**: ingest your OpenAPI spec so Claude knows every endpoint signature without being told
3. **Multi-project namespacing**: if you have multiple codebases, use the KB's namespace RBAC to keep them isolated in `wiki/projects/`
4. **Lint for drift**: add `kb lint` to CI to surface wiki pages where `updated` date is more than 30 days behind the corresponding source file's `git log` date

---

## Related Recipes

- [[recipes/recipe-llm-wiki-setup]] — foundational setup this recipe extends
- [[recipes/recipe-claude-code-hooks]] — automate the "update after" step via hooks
- [[recipes/recipe-mcp-server]] — how the KB [[mcp-ecosystem]] server exposes wiki data to [[framework-claude-code]]
- [[patterns/pattern-hot-cache]] — keep your most-referenced component pages in `wiki/hot.md` for zero-latency retrieval
