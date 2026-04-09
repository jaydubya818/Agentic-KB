// Ambient type declarations for the shared agent runtime.
// All runtime methods are typed loosely as `any` for now; tighten in a follow-up.

export function loadContract(kbRoot: string, agentId: string): any
export function listContracts(kbRoot: string): any[]
export function validateContract(c: any): any

export function loadAgentContext(
  kbRoot: string,
  contract: any,
  vars?: Record<string, any>
): { files: any[]; trace: any }

export function closeTask(kbRoot: string, contract: any, payload: any): any

export function publishBusItem(kbRoot: string, opts: any): { id: string; path: string }
export function readBusItem(kbRoot: string, channel: string, id: string): any
export function listBusItems(kbRoot: string, channel: string, opts?: Record<string, any>): any[]
export function transitionBusItem(kbRoot: string, channel: string, id: string, toState: string, actor: string): any

export function promoteLearning(kbRoot: string, opts: any): { source: string; target: string; id: string }
export function mergeRewrite(kbRoot: string, opts: any): any

export function compactHotMemory(kbRoot: string, agentId: string, tier: string): any
export function runBusTTL(kbRoot: string, opts?: any): any
export function rotateTaskLog(kbRoot: string, agentId: string, tier: string, threshold?: number): any

export function assertWriteAllowed(relPath: string, contract: any, vars?: any): { allowed: boolean; reason: string; rule: any }
export function assertReadAllowed(relPath: string, contract: any, vars?: any): { allowed: boolean; reason: string }

export function appendAudit(kbRoot: string, entry: any): void
export function appendRuntimeTrace(kbRoot: string, trace: any): void
export function readRuntimeTraces(kbRoot: string, limit?: number, filter?: any): any[]

export function parseFrontmatter(content: string): { data: any; content: string; raw: string }
export function serializeFrontmatter(data: any, body?: string): string
export function updateFrontmatter(content: string, patch: any): string
