// Ambient type declarations for the shared repo runtime.
// All runtime methods are typed loosely as `any` for now.

export function loadRegistry(kbRoot: string): any
export function saveRegistry(kbRoot: string, registry: any): void
export function getRepo(kbRoot: string, name: string): any | null
export function upsertRepo(kbRoot: string, record: any): any
export function listRepos(kbRoot: string, opts?: Record<string, any>): any[]
export function markSynced(kbRoot: string, name: string, sha?: string): any

export function repoWikiRoot(repo: string): string
export function repoDocsRoot(repo: string): string
export function repoCanonicalRoot(repo: string): string
export function repoAgentMemoryRoot(repo: string, tier: string, agentId: string): string
export function repoBusRoot(repo: string, channel: string): string
export function repoTasksRoot(repo: string): string
export function repoRewritesRoot(repo: string, type: string): string
export function importedDocPath(repo: string, sourceRelPath: string): string
export function isImportedDoc(relPath: string): boolean
export function isOperationalDoc(relPath: string): boolean
export function assertNotImportedDoc(relPath: string): void

export function makeImportedFrontmatter(opts: any): string
export function parseImportedMeta(content: string): any
export function isImportedContent(content: string): boolean

export function syncRepo(kbRoot: string, name: string, opts?: any): Promise<any>

export function closeRepoTask(kbRoot: string, repo: string, contract: any, payload: any): any
export function dryRunCloseRepoTask(kbRoot: string, repo: string, contract: any, payload: any): any
export function validateRepoCloseTaskPayload(contract: any, payload: any): any
export function appendRepoProgress(kbRoot: string, repo: string, entry: string, agentId?: string): string
export function writeRepoTaskLog(kbRoot: string, repo: string, taskId: string, agentId: string, entry: string): string

export function publishRepoBusItem(kbRoot: string, repo: string, opts: any): { id: string; path: string }
export function readRepoBusItem(kbRoot: string, repo: string, channel: string, id: string): any
export function listRepoBusItems(kbRoot: string, repo: string, channel: string, opts?: any): any[]
export function transitionRepoBusItem(kbRoot: string, repo: string, channel: string, id: string, newStatus: string): any

export function loadRepoContext(kbRoot: string, repo: string, contractOrOpts?: any, vars?: any): { files: any[]; trace: any }

export function generateCanonicalTemplate(docType: string, repo: string, vars?: any): string
export function generateHomePage(repo: string, vars?: any): string
export function generateProgressPage(repo: string): string
export function generateRepoCLAUDE(repo: string, vars?: any): string
