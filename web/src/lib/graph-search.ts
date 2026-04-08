/**
 * graph-search.ts
 *
 * Semantic search over the Graphify knowledge graph (graphify-out/graph.json).
 * Complements the existing keyword scanner — finds conceptually related pages
 * even when query words don't appear in the title or content.
 *
 * Strategy:
 *  1. Score all nodes by how well their label matches the query tokens
 *  2. For matched nodes, traverse 1-hop links to pull in connected pages
 *  3. Check hyperedges — if any member node matches, include all members
 *  4. Return ranked list of { filePath, score, matchReason }
 */
import fs from 'fs'
import path from 'path'
import { DEFAULT_KB_ROOT } from '@/lib/articles'
import { rankMultiplier, rankBreakdown } from '@/lib/ranking'

// ── Graph types ───────────────────────────────────────────────────────────────

interface GraphNode {
  id: string
  label: string
  source_file: string
  file_type: string
  community: number
}

interface GraphLink {
  source: string   // node id
  target: string   // node id
  relation: string
  confidence: string
  confidence_score: number
  weight: number
  source_file: string
}

interface GraphHyperedge {
  id: string
  label: string
  nodes: string[]  // node ids
  relation: string
  confidence: string
  confidence_score: number
  source_file: string
}

interface KnowledgeGraph {
  nodes: GraphNode[]
  links: GraphLink[]
  hyperedges: GraphHyperedge[]
}

export interface GraphSearchResult {
  filePath: string      // absolute path on disk
  relPath: string       // relative to vaultRoot, for matching with article meta
  score: number         // final score after decay + hotness (higher = more relevant)
  baseScore: number     // raw graph match score before ranking multiplier
  decay: number         // temporal decay factor (0.5–1.0)
  hotness: number       // hotness multiplier (1.0–1.5)
  matchReason: string   // human-readable explanation
  nodeLabel: string     // the graph node label that matched
  relation?: string     // edge relation if arrived via traversal
}

// ── Graph loader (cached per process) ────────────────────────────────────────

let _graphCache: KnowledgeGraph | null = null
let _graphMtime = 0
const GRAPH_PATH = path.join(DEFAULT_KB_ROOT, 'graphify-out', 'graph.json')

function loadGraph(): KnowledgeGraph | null {
  try {
    const stat = fs.statSync(GRAPH_PATH)
    const mtime = stat.mtimeMs
    if (_graphCache && mtime === _graphMtime) return _graphCache
    const raw = fs.readFileSync(GRAPH_PATH, 'utf8')
    _graphCache = JSON.parse(raw) as KnowledgeGraph
    _graphMtime = mtime
    return _graphCache
  } catch {
    return null
  }
}

// ── Scoring helpers ───────────────────────────────────────────────────────────

/** Tokenise a string into lowercase words, stripping punctuation */
function tokenise(str: string): string[] {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2)
}

/** Score how well queryTokens match a label (0–1) */
function labelScore(label: string, queryTokens: string[]): number {
  if (!label || queryTokens.length === 0) return 0
  const labelTokens = tokenise(label)
  const labelStr = label.toLowerCase()

  let score = 0
  for (const qt of queryTokens) {
    // Exact token match in label tokens
    if (labelTokens.includes(qt)) { score += 1; continue }
    // Substring match inside the full label string
    if (labelStr.includes(qt)) { score += 0.6; continue }
    // Partial token overlap (e.g. "deploy" matches "deployment")
    if (labelTokens.some(lt => lt.startsWith(qt) || qt.startsWith(lt))) { score += 0.3 }
  }
  return Math.min(score / queryTokens.length, 1)
}

// ── Main search function ──────────────────────────────────────────────────────

export function searchGraph(
  query: string,
  vaultRoot: string = DEFAULT_KB_ROOT,
  limit = 10
): GraphSearchResult[] {
  const graph = loadGraph()
  if (!graph) return []

  const queryTokens = tokenise(query)
  if (queryTokens.length === 0) return []

  const results = new Map<string, GraphSearchResult>()

  // Build node lookup map
  const nodeById = new Map<string, GraphNode>()
  for (const node of graph.nodes) {
    nodeById.set(node.id, node)
  }

  // Build adjacency: nodeId → [{linkedNodeId, relation, confidence_score}]
  const adjacency = new Map<string, Array<{ nodeId: string; relation: string; score: number }>>()
  for (const link of graph.links) {
    if (!adjacency.has(link.source)) adjacency.set(link.source, [])
    if (!adjacency.has(link.target)) adjacency.set(link.target, [])
    adjacency.get(link.source)!.push({ nodeId: link.target, relation: link.relation, score: link.confidence_score })
    adjacency.get(link.target)!.push({ nodeId: link.source, relation: link.relation, score: link.confidence_score })
  }

  function addResult(node: GraphNode, baseScore: number, reason: string, relation?: string) {
    if (!node.source_file) return
    const absPath = path.join(vaultRoot, node.source_file)
    if (!fs.existsSync(absPath)) return

    const { decay, hotness, multiplier } = rankBreakdown(absPath, node.source_file)
    const finalScore = baseScore * multiplier

    const existing = results.get(node.id)
    if (!existing || finalScore > existing.score) {
      results.set(node.id, {
        filePath: absPath,
        relPath: node.source_file,
        score: finalScore,
        baseScore,
        decay,
        hotness,
        matchReason: reason,
        nodeLabel: node.label,
        relation,
      })
    }
  }

  // Pass 1: Direct node label matching
  const directHits = new Set<string>()
  for (const node of graph.nodes) {
    const s = labelScore(node.label, queryTokens)
    if (s >= 0.3) {
      addResult(node, s, `label match (${Math.round(s * 100)}%)`)
      directHits.add(node.id)
    }
  }

  // Pass 2: 1-hop traversal from direct hits
  for (const nodeId of directHits) {
    const neighbours = adjacency.get(nodeId) || []
    for (const { nodeId: nId, relation, score: edgeScore } of neighbours) {
      const neighbour = nodeById.get(nId)
      if (!neighbour || directHits.has(nId)) continue
      const traversalScore = edgeScore * 0.55  // discount for indirect
      if (traversalScore >= 0.25) {
        addResult(neighbour, traversalScore, `linked via "${relation}"`, relation)
      }
    }
  }

  // Pass 3: Hyperedge expansion
  // If any node in a hyperedge matches, include all members
  for (const hyper of graph.hyperedges) {
    const hyperScore = labelScore(hyper.label, queryTokens)
    const memberHit = hyper.nodes.some(nId => directHits.has(nId))

    if (hyperScore >= 0.3 || memberHit) {
      const baseScore = Math.max(hyperScore, 0.45) * hyper.confidence_score
      for (const nId of hyper.nodes) {
        const node = nodeById.get(nId)
        if (!node) continue
        addResult(
          node,
          baseScore,
          `part of cluster: "${hyper.label.slice(0, 60)}"`,
          hyper.relation
        )
      }
    }
  }

  // Sort by score desc, deduplicate by filePath, trim to limit
  const seen = new Set<string>()
  return [...results.values()]
    .sort((a, b) => b.score - a.score)
    .filter(r => {
      if (seen.has(r.filePath)) return false
      seen.add(r.filePath)
      return true
    })
    .slice(0, limit)
}

/** Check whether a graph.json exists and is readable */
export function graphAvailable(): boolean {
  try { fs.accessSync(GRAPH_PATH, fs.constants.R_OK); return true }
  catch { return false }
}
