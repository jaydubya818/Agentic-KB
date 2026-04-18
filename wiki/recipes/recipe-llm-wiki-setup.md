---
id: 01KNNVX2R8581VZ6F4YE5QN7JH
title: Set Up a Karpathy-Style LLM Knowledge Base
type: recipe
difficulty: beginner
time_estimate: 60-90 minutes
prerequisites:
  - Obsidian installed (optional but recommended)
  - Node.js 18+ for the CLI harness
  - Basic markdown knowledge
tested: false
tags: [knowledge-base, wiki, karpathy, obsidian, mcp, memory]
---

## Goal

Set up a personal LLM knowledge base (KB) in the style [[andrej-karpathy]] popularized: plain-text markdown files, structured for LLM context injection, queryable via CLI and [[mcp-ecosystem]]. The KB grows as you learn; agents write to it; you query it for context in future sessions.

This is the same pattern that produced the Agentic-KB you're reading now. Time to first useful query: under an hour.

See [[entities/andrej-karpathy]] for the intellectual origin of this pattern.
See [[evaluations/eval-memory-approaches]] for why file-based wiki beats vector DB for this use case.

---

## Prerequisites

```bash
# Check Node.js version
node --version  # Need 18+

# Install Obsidian (optional, for visual browsing)
# Download from obsidian.md

# Check git (for version control)
git --version
```

---

## Steps

### Step 1 — Create the Directory Structure

```bash
mkdir -p ~/my-llm-wiki/{wiki,raw}
mkdir -p ~/my-llm-wiki/wiki/{concepts,patterns,frameworks,entities,summaries,syntheses,recipes,evaluations,personal}
mkdir -p ~/my-llm-wiki/raw/{papers,transcripts,framework-docs,code-examples}
cd ~/my-llm-wiki
git init
```

### Step 2 — Write Your CLAUDE.md (Schema File)

This is the most important file — it tells agents how to read and write to your KB.

```bash
cat > CLAUDE.md << 'EOF'
# My LLM Wiki — Schema

## Purpose
Personal compounding knowledge base for [YOUR DOMAIN]. Written for LLM context injection.

## Structure
wiki/concepts/     — universal concepts
wiki/frameworks/   — tools, frameworks, libraries
wiki/entities/     — people, companies, projects
wiki/recipes/      — step-by-step how-to guides
wiki/evaluations/  — comparisons and benchmarks
wiki/personal/     — my validated patterns and lessons
raw/               — immutable source material (never LLM-written)

## File Naming
- Lowercase hyphenated: concept-name.md
- Framework pages: framework-{name}.md
- Recipe pages: recipe-{task}.md
- Evaluation pages: eval-{topic}.md

## Frontmatter Schema (all pages)
---
title: string
type: concept | framework | recipe | evaluation | entity | personal
tags: []
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

## Required Page Sections
### Concept pages: TL;DR, Definition, How It Works, When To Use, Risks
### Framework pages: Overview, Core Concepts, Strengths, Weaknesses, Example, Integration
### Recipe pages: Goal, Prerequisites, Steps, Verification, Common Failures

## Linking
Use Obsidian wiki links: [[concepts/tool-use]] or [[frameworks/framework-gsd]]
Link first mention of any concept or entity.
No orphan pages — every page needs at least one inbound link.

## Rules
1. Never modify raw/ — read-only source material
2. Dense writing — assume the reader (LLM) is expert-level
3. No orphan pages
4. Honest confidence levels — default to medium when uncertain
5. Mark unverified claims [UNVERIFIED]
EOF
```

### Step 3 — Create Your First Three Pages

Seed the KB with what you know. Start with a concept you understand deeply:

```bash
# Create your first concept page
cat > wiki/concepts/my-first-concept.md << 'EOF'
---
title: [Your Core Concept]
type: concept
tags: []
created: 2026-04-04
updated: 2026-04-04
---

## TL;DR
One sentence. No jargon.

## Definition
One paragraph. What is this, precisely?

## How It Works
Step-by-step mechanism.

## When To Use
Conditions that indicate this concept applies.

## Risks & Pitfalls
Top 3 failure modes.
EOF
```

Create an index file:
```bash
cat > wiki/index.md << 'EOF'
# Wiki Index

## Concepts
- [[concepts/my-first-concept]] — [one-line description]

## Frameworks
(empty — add as you ingest)

## Entities
(empty — add as you ingest)
EOF
```

Create the [[pattern-hot-cache]]:
```bash
cat > wiki/hot.md << 'EOF'
# Hot Cache (≤500 words)
Most-accessed context. Updated when a concept is referenced 3+ times in queries.

## [First entry when you have one]
EOF
```

### Step 4 — Set Up the Query CLI

Create a minimal query CLI:

```bash
mkdir -p packages/cli/src
cd packages/cli
npm init -y
npm install @anthropic-ai/sdk glob
npm install -D typescript tsx @types/node
```

```typescript
// packages/cli/src/query.ts
import Anthropic from "@anthropic-ai/sdk"
import { glob } from "glob"
import { readFileSync } from "fs"
import { join } from "path"

const client = new Anthropic()
const KB_PATH = process.env.KB_PATH ?? join(process.env.HOME!, "my-llm-wiki")

async function searchWiki(query: string): Promise<string[]> {
  const files = await glob("**/*.md", { cwd: join(KB_PATH, "wiki"), absolute: true })
  const queryLower = query.toLowerCase()
  return files.filter(file => {
    const content = readFileSync(file, "utf-8").toLowerCase()
    return content.includes(queryLower)
  })
}

async function queryKB(question: string): Promise<void> {
  // Step 1: Find relevant pages
  const words = question.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  const relevantFiles = new Set<string>()

  for (const word of words.slice(0, 5)) {  // search top 5 keywords
    const matches = await searchWiki(word)
    matches.slice(0, 3).forEach(f => relevantFiles.add(f))  // top 3 per keyword
  }

  // Always include hot cache and index
  relevantFiles.add(join(KB_PATH, "wiki/hot.md"))
  relevantFiles.add(join(KB_PATH, "wiki/index.md"))

  // Step 2: Build context from relevant files
  let context = ""
  for (const file of relevantFiles) {
    try {
      const content = readFileSync(file, "utf-8")
      const relativePath = file.replace(KB_PATH + "/wiki/", "")
      context += `\n\n---\n[[${relativePath.replace(".md", "")}]]\n${content.slice(0, 3000)}`
    } catch { /* file not found */ }
  }

  if (!context) {
    console.log("No relevant wiki pages found for this query.")
    return
  }

  // Step 3: Query with context
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: `You are a knowledge base assistant. Answer questions using ONLY the wiki context provided.
If the answer isn't in the context, say "Not in KB" and suggest what page would help.
Always cite which wiki pages your answer comes from.`,
    messages: [{
      role: "user",
      content: `Wiki context:\n${context}\n\n---\nQuestion: ${question}`
    }]
  })

  const answer = response.content
    .filter(b => b.type === "text")
    .map(b => b.text)
    .join("\n")

  console.log(answer)
}

const question = process.argv.slice(2).join(" ")
if (!question) {
  console.error("Usage: npx tsx src/query.ts <your question>")
  process.exit(1)
}

await queryKB(question)
```

Add to `package.json`:
```json
{ "scripts": { "query": "KB_PATH=/path/to/your/wiki tsx src/query.ts" } }
```

### Step 5 — Set Up Obsidian (Recommended)

1. Open Obsidian → "Open folder as vault"
2. Select `~/my-llm-wiki/wiki/`
3. Enable: Settings → Core Plugins → Templates, Backlinks
4. Set wiki links to be relative paths
5. Install community plugins:
   - **Obsidian Git**: auto-commit wiki changes (set: commit every 15 min)
   - **Obsidian Web Clipper**: clip web pages directly into `raw/`

Configure Web Clipper to save to `raw/transcripts/` or `raw/framework-docs/` as markdown.

### Step 6 — Write Your First INGEST

Take any article, video transcript, or doc you've read recently and run an ingest:

Paste into [[framework-claude-code]] (with your wiki open):
```
Ingest this content into my wiki at ~/my-llm-wiki/.

Source content:
[paste your content]

Follow the INGEST workflow from CLAUDE.md:
1. Extract concepts, patterns, frameworks, key claims
2. Create wiki/summaries/{slug}.md
3. Update or create relevant concept/framework pages
4. Cross-link bidirectionally
5. Update wiki/index.md
```

### Step 7 — Set Up [[framework-claude-code]] Integration

Add to your project's `.claude/settings.json` or `~/.claude/settings.json`:
```json
{
  "env": {
    "LLM_WIKI_PATH": "/path/to/your/wiki"
  }
}
```

Add to your `~/.claude/CLAUDE.md` (or project CLAUDE.md):
```markdown
## Knowledge Base
My LLM wiki is at $LLM_WIKI_PATH.
When working on tasks, check if relevant concepts or patterns are documented there.
After discovering something new, offer to ingest it into the wiki.
```

---

## Verification

1. Create a page, then query for it:
```bash
# Create a page about "tool use"
echo '---\ntitle: Tool Use\ntype: concept\n---\n## TL;DR\nTool use lets LLMs call external functions.' > wiki/concepts/tool-use.md

# Query it
cd packages/cli && npm run query "what is tool use"
# Should cite [[concepts/tool-use]] in the response
```

2. Test ingest workflow: paste a paragraph from any tech article and ask [[framework-claude-code]] to ingest it. Verify it creates a `wiki/summaries/` file.

3. Verify linking: after creating 3 pages, run `grep -r "\[\[" wiki/ | head -20` to confirm cross-links exist.

---

## Common Failures & Fixes

### Failure: Query returns "Not in KB" for things I've documented
Cause: keyword search isn't matching because the query uses different words than the page. Fix: improve the search in `query.ts` to also search page titles and tags; or switch to embeddings-based search (adds complexity — only needed at 100+ pages).

### Failure: Pages are orphaned (no inbound links)
Cause: skipped the linking step during ingestion. Fix: add a lint script that checks for orphans:
```bash
# Find pages with no inbound links
for page in wiki/**/*.md; do
  name=$(basename $page .md)
  if ! grep -r "\[\[$name" wiki/ > /dev/null 2>&1; then
    echo "ORPHAN: $page"
  fi
done
```

### Failure: [[pattern-hot-cache]] grows too large (>600 words)
Fix: enforce the 500-word limit in your lint script; prune least-recently-queried entries.

---

## Next Steps

1. **Add [[mcp-ecosystem]] server**: expose the wiki as tools for other agents — [[recipes/recipe-mcp-server]]
2. **Add the full harness**: implement the full Ingest/Query/Lint workflows from CLAUDE.md
3. **Set up graphify**: after 20+ pages, run a knowledge graph visualization to find orphan clusters
4. **Add evaluation pages**: start scoring frameworks and tools you use — these become your most-queried pages

---

## Related Recipes

- [[recipes/recipe-mcp-server]] — expose this KB as [[mcp-ecosystem]] tools
- [[recipes/recipe-context-compression]] — handle long sessions that reference many KB pages
- [[evaluations/eval-memory-approaches]] — why this approach was chosen over vector DB
- [[entities/andrej-karpathy]] — origin of this pattern
