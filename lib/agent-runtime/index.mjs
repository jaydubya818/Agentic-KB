// Public entry point for the shared agent runtime.
// Consumers: web API routes, CLI, MCP server.

export * from './contracts.mjs'
export * from './identity.mjs'
export * from './paths.mjs'
export * from './memory-classes.mjs'
export * from './state-machines.mjs'
export * from './task-lifecycle.mjs'
export * from './context-loader.mjs'
export * from './writeback.mjs'
export * from './bus.mjs'
export * from './promotion.mjs'
export * from './retention.mjs'
export * from './audit.mjs'
export * from './frontmatter.mjs'
export * from './ids.mjs'

// Convenience: resolve KB root from a passed dir or default constant.
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
export const KB_ROOT_DEFAULT = path.resolve(path.dirname(__filename), '..', '..')
