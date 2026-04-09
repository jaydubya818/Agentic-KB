// Public entry point for repo-runtime module.
// Consumers: web API routes, CLI, MCP server.

export * from './registry.mjs'
export * from './paths.mjs'
export * from './metadata.mjs'
export * from './sync.mjs'
export * from './writeback.mjs'
export * from './bus.mjs'
export * from './context-loader.mjs'
export * from './templates.mjs'

// Convenience: resolve KB root from a passed dir or default constant.
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
export const KB_ROOT_DEFAULT = path.resolve(path.dirname(__filename), '..', '..')
