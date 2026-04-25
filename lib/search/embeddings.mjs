// Embeddings provider — STUB INTERFACE ONLY.
// Activate when: wiki >= 500 pages OR keyword search recall < 60%.
// Track recall via lint reports; revisit at next milestone if signal flips.
//
// Plan when activating:
//   1. Pick provider: local (Ollama bge-m3) for offline, OpenAI for hosted.
//   2. Implement EmbeddingProvider concrete class.
//   3. Add `wiki/_meta/embeddings.sqlite` for vector store (sqlite-vec).
//   4. Wire into web/src/lib/graph-search.ts as a 5th bucket (semantic, 15%).
//   5. Track per-query embedding cost via lib/agent-runtime/cost-meter.mjs.
//
// Until then: this file documents the seam.

/**
 * @typedef {Object} EmbeddingProvider
 * @property {string} id
 * @property {string} model
 * @property {number} dim
 * @property {(texts: string[]) => Promise<number[][]>} embed
 */

export const NOT_ACTIVATED = true

export function makeProvider(/* opts */) {
  throw new Error('embeddings: not activated. See lib/search/embeddings.mjs header for plan.')
}
