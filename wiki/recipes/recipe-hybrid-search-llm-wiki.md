---
title: Hybrid Search for LLM Wiki (BM25 + Vector + Graph + RRF)
type: recipe
difficulty: advanced
time_estimate: 4-6h
prerequisites:
  - Wiki with >100 pages (index.md search starts breaking at this scale)
  - Node.js ≥ 20
  - graphify-out/graph.json (Graphify skill must have been run)
  - wiki/index.md in place
  - Understanding of [[concepts/reciprocal-rank-fusion]]
tested: false
tags: [memory, context-management, rag-systems, deployment, agentic]
---

# Recipe: Hybrid Search for LLM Wiki

## Goal
Replace flat `index.md` keyword search with a three-retriever hybrid pipeline: BM25 (keywords) + vector embeddings (semantics) + typed graph traversal (structure), fused with Reciprocal Rank Fusion. Implements RLM Pipeline Stages 1–3.

This is the implementation behind LLM Wiki v2's claim that hybrid search "replaces the index.md file that breaks past 200 pages." For this KB, trigger this implementation when the wiki exceeds ~150 pages and query relevance degrades noticeably.

---

## Prerequisites
- `wiki/` directory with `.md` files (minimum ~100 pages for this to be worth it)
- `graphify-out/graph.json` — run Graphify skill first if not present
- Node.js packages: `flexsearch` (BM25), `@xenova/transformers` (local vector embeddings)

---

## Steps

### Step 1 — Build the BM25 Index

Install: `npm install flexsearch --save`

Create `scripts/search/build-bm25-index.mjs`:

```javascript
import { Document } from 'flexsearch';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import path from 'path';

const WIKI_DIR = './wiki';
const INDEX_OUTPUT = './search/bm25-index.json';

function collectMarkdownFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectMarkdownFiles(full, files);
    } else if (entry.endsWith('.md') && !entry.startsWith('.')) {
      files.push(full);
    }
  }
  return files;
}

const index = new Document({
  document: { id: 'path', index: ['title', 'tags', 'body'] },
  tokenize: 'forward'
});

const files = collectMarkdownFiles(WIKI_DIR);
const docs = [];

for (const filePath of files) {
  const content = readFileSync(filePath, 'utf8');
  // Extract frontmatter title and tags
  const titleMatch = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  const tagsMatch = content.match(/^tags:\s*\[(.+?)\]/m);
  const body = content.replace(/^---[\s\S]*?---/, '').trim();

  docs.push({
    path: filePath,
    title: titleMatch?.[1] || path.basename(filePath, '.md'),
    tags: tagsMatch?.[1] || '',
    body: body.slice(0, 5000)  // cap body for index size
  });
}

for (const doc of docs) {
  index.add(doc);
}

// Export serialized index
const exported = {};
index.export((key, data) => { exported[key] = data; });
writeFileSync(INDEX_OUTPUT, JSON.stringify(exported, null, 2));
console.log(`BM25 index built: ${docs.length} documents → ${INDEX_OUTPUT}`);
```

Run: `node scripts/search/build-bm25-index.mjs`

---

### Step 2 — Build the Vector Index

For local inference (no API cost):
Install: `npm install @xenova/transformers --save`

Create `scripts/search/build-vector-index.mjs`:

```javascript
import { pipeline } from '@xenova/transformers';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import path from 'path';

const WIKI_DIR = './wiki';
const VECTOR_OUTPUT = './search/vector-index.json';

async function buildVectorIndex() {
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const files = collectMarkdownFiles(WIKI_DIR);
  const embeddings = [];

  for (const filePath of files) {
    const content = readFileSync(filePath, 'utf8');
    const text = content
      .replace(/^---[\s\S]*?---/, '')  // strip frontmatter
      .replace(/\[\[.*?\]\]/g, ' ')   // strip wiki links
      .slice(0, 2000);                 // cap for embedding model

    const output = await embedder(text, { pooling: 'mean', normalize: true });
    embeddings.push({
      path: filePath,
      embedding: Array.from(output.data)
    });
    process.stdout.write('.');
  }

  writeFileSync(VECTOR_OUTPUT, JSON.stringify(embeddings, null, 2));
  console.log(`\nVector index built: ${embeddings.length} documents → ${VECTOR_OUTPUT}`);
}

function collectMarkdownFiles(dir, files = []) { /* same as step 1 */ }

buildVectorIndex().catch(console.error);
```

Run: `node scripts/search/build-vector-index.mjs` (takes 5-15 min first run; model downloads ~90MB)

---

### Step 3 — Graph Traversal Retriever

Uses existing `graphify-out/graph.json` (untyped) or `graphify-out/typed-edges.json` (if typed graph is built per [[patterns/pattern-typed-knowledge-graph]]).

Create `scripts/search/graph-retriever.mjs`:

```javascript
import { readFileSync } from 'fs';

const GRAPH_PATH = './graphify-out/graph.json';

export function graphRetrieve(queryEntities, maxHops = 2, topN = 50) {
  const graph = JSON.parse(readFileSync(GRAPH_PATH, 'utf8'));

  // Build adjacency map
  const adj = new Map();
  for (const link of graph.links) {
    if (!adj.has(link.source)) adj.set(link.source, []);
    adj.get(link.source).push(link.target);
    if (!adj.has(link.target)) adj.set(link.target, []);
    adj.get(link.target).push(link.source);  // undirected for now
  }

  const scores = new Map();
  const visited = new Set();
  const queue = [...queryEntities.map(e => ({ node: e, hops: 0 }))];

  while (queue.length > 0) {
    const { node, hops } = queue.shift();
    if (visited.has(node) || hops > maxHops) continue;
    visited.add(node);

    // Score inversely proportional to hop distance
    const score = 1 / (1 + hops);
    scores.set(node, (scores.get(node) || 0) + score);

    if (hops < maxHops) {
      for (const neighbor of (adj.get(node) || [])) {
        queue.push({ node: neighbor, hops: hops + 1 });
      }
    }
  }

  return Array.from(scores.entries())
    .map(([path, score]) => ({ path, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
```

---

### Step 4 — RRF Fusion

Create `scripts/search/rrf.mjs`:

```javascript
export function reciprocalRankFusion(rankedLists, k = 60) {
  const scores = new Map();

  for (const list of rankedLists) {
    list.forEach((item, index) => {
      const id = item.path || item.id;
      const rank = index + 1;
      const rrf = 1 / (k + rank);
      scores.set(id, (scores.get(id) || 0) + rrf);
    });
  }

  return Array.from(scores.entries())
    .map(([path, score]) => ({ path, score }))
    .sort((a, b) => b.score - a.score);
}
```

---

### Step 5 — Query Entrypoint

Create `scripts/search/query.mjs`:

```javascript
import { Document } from 'flexsearch';
import { pipeline } from '@xenova/transformers';
import { graphRetrieve } from './graph-retriever.mjs';
import { reciprocalRankFusion } from './rrf.mjs';
import { readFileSync } from 'fs';

const bm25Index = JSON.parse(readFileSync('./search/bm25-index.json', 'utf8'));
const vectorIndex = JSON.parse(readFileSync('./search/vector-index.json', 'utf8'));

function cosineSim(a, b) {
  return a.reduce((sum, v, i) => sum + v * b[i], 0);
}

export async function hybridSearch(queryText, topN = 20) {
  // BM25
  const index = new Document({ document: { id: 'path', index: ['title','tags','body'] } });
  index.import(bm25Index, (key, data) => data);
  const bm25Results = index.search(queryText, { limit: 50, enrich: false })
    .flatMap(r => r.result.map((id, i) => ({ path: id, rank: i })));

  // Vector
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const qEmbed = Array.from((await embedder(queryText, { pooling:'mean', normalize:true })).data);
  const vectorResults = vectorIndex
    .map(doc => ({ path: doc.path, score: cosineSim(qEmbed, doc.embedding) }))
    .sort((a,b) => b.score - a.score)
    .slice(0, 50);

  // Graph — extract entity slugs from query
  const entitySlugs = extractEntitySlugs(queryText);  // simple regex for [[links]] or known slugs
  const graphResults = graphRetrieve(entitySlugs, 2, 50);

  // RRF fusion
  const merged = reciprocalRankFusion([bm25Results, vectorResults, graphResults]);
  return merged.slice(0, topN);
}

function extractEntitySlugs(query) {
  const wikiLinks = [...query.matchAll(/\[\[([^\]]+)\]\]/g)].map(m => m[1]);
  return wikiLinks;
}
```

---

## Verification

1. Run `node scripts/search/query.mjs "multi-agent orchestration patterns"` — confirm top results are relevant pattern pages, not just pages with exact keyword match.

2. Run with a semantic query: `"how do I prevent agents from forgetting things"` — should surface memory-related pages even without exact keyword overlap.

3. Run with a graph query that includes a wiki slug: `"[[pattern-fan-out-worker]] risks"` — should surface fan-out-worker AND its graph neighbors (failure modes, context isolation).

4. Compare against old index.md search for the same queries — hybrid should have higher relevance on semantic and graph queries.

---

## Common Failures & Fixes

**Vector model download fails:** The `@xenova/transformers` model downloads on first run. Ensure network access or pre-download: `node -e "import('@xenova/transformers').then(t => t.pipeline('feature-extraction','Xenova/all-MiniLM-L6-v2'))"`.

**BM25 index grows too large:** Cap body text at 5,000 chars in the indexer. The full wiki text is not needed for BM25 — titles and first-paragraph context are sufficient.

**Graph traversal returns irrelevant deep neighbors:** Reduce `maxHops` from 2 to 1 if too many false positives. For typed edges (when available), restrict traversal to `implements | supports | requires` types only.

**RRF favors long lists:** Cap all three retrievers at the same N (50) before fusion to prevent the large-corpus BM25 results from drowning out graph and vector signals.

---

## Next Steps
- Replace `@xenova/transformers` with Jina Embeddings API for faster build times on large wikis
- Extend graph retriever to use `typed-edges.json` for relationship-aware traversal per [[patterns/pattern-typed-knowledge-graph]]
- Wire the query entrypoint into the `mcp/` server so KB queries use hybrid search automatically
- Add result caching: cache top-10 results per query for 24h to reduce latency on repeated queries

## Related Recipes
- [[recipes/recipe-llm-wiki-setup]] — Base wiki this search runs on
- [[recipes/recipe-kb-lifecycle-hooks]] — Hooks that keep the BM25/vector indexes fresh
- [[concepts/rlm-pipeline]] — Full pipeline this implements Stages 1–3 of
- [[concepts/reciprocal-rank-fusion]] — The fusion algorithm used in Step 4
- [[patterns/pattern-typed-knowledge-graph]] — Upgrade graph retriever with typed traversal
