---
id: 01KNNVX2QWP0WXED8KH2N8K1JE
---

# Hot Cache
> ≤500 words | Most-used patterns and concepts | Updated: 2026-04-04

## Jay's Default Framework Decision
- **Experimental MVP / evolving requirements** → GSD (`/gsd:new-project`)
- **Locked spec / enterprise** → BMAD (`bmad-init` skill)
- **High-stakes feature (auth, payments, agents)** → Superpowers (TDD + verification)
- **Simple task <3 files** → Direct Claude (no framework overhead)

## Most-Used Patterns

**Fan-out Worker**: Spawn N parallel agents in a single message → aggregate results → return. Claude Code's Agent tool: multiple calls in one response = true parallelism. See [[summaries/summary-graphify-skill]] for working example.

**Supervisor-Worker**: Central orchestrator routes to specialists. Orchestrator has full tools; workers have restricted sets. Beware the Telephone Game Problem: supervisors paraphrase sub-agent responses incorrectly. Fix with a `forward_message` tool that bypasses synthesis when the sub-agent's response is final.

**Plan-Execute-Verify**: Separate planner, executor, verifier agents. Each has focused context; no single agent holds all three roles. GSD implementation: planner creates PLAN.md (2–3 tasks, ≤50% context), executor commits atomically per task, verifier does goal-backward analysis (trusts code, not SUMMARY claims). See [[summaries/summary-gsd-framework-skills]].

**Hot Cache**: ≤500-word summary file. Read first on every query. Update when a pattern is queried 3+ times. Prevents re-reading full wiki on common queries. See [[summaries/summary-nate-herk-llm-wiki]] (95% token reduction with wiki vs. RAG).

**Read-Before-Write**: Every mutating agent operation preceded by a read of current state. Prevents silent overwrites. GSD executor: `git status --short` before every commit staging.

**Write-and-Return**: Agents write analysis to disk, return only brief confirmation. Keeps orchestrator context clean. See [[summaries/summary-gsd-codebase-mapper]].

## GSD Deviation Rules (Executor)
- **Rule 1**: Auto-fix bugs (no permission needed)
- **Rule 2**: Auto-add missing critical functionality (auth, validation, error handling)
- **Rule 3**: Auto-fix blocking issues (missing deps, broken imports)
- **Rule 4**: STOP for architectural changes (new table, framework swap) — ask user

3 failed fix attempts on one task → document and move on. Never infinite fix loops.

## Model Tiering
- `claude-haiku-4-5`: leaf tasks, grep, simple Q&A, boilerplate → cheapest/fastest
- `claude-sonnet-4-6`: orchestration, default for most tasks → best cost/quality
- `claude-opus-4-6`: complex arch, security audits, long-lasting structural artifacts → use sparingly

## Context Window Survival
1. Read only targeted sections (offset+limit on large files >2000 lines)
2. Grep before reading (`grep -n "functionName" file` → use offset)
3. Compact at 75% context (auto-compact trigger in Claude Code)
4. Use hot.md to avoid re-reading common context
5. Agents write findings to disk (Write-and-Return pattern) — don't return large bodies to orchestrator

## Memory Systems Quick Guide
- **Prototype**: Filesystem (structured JSON with timestamps)
- **Scale**: Mem0 or vector store for semantic search + multi-tenant
- **Complex reasoning**: Zep/Graphiti for temporal knowledge graphs (94.8% DMR accuracy)
- **Full control**: Letta for agent self-management of memory

Key finding: Letta's filesystem agents scored 74% on LoCoMo using basic file operations, beating Mem0's specialized tools at 68.5%. Tool complexity matters less than reliable retrieval.

## Key File Locations
- Agents: `~/.claude/agents/`
- Skills: `~/.claude/skills/`
- This KB: `/Users/jaywest/Agentic-KB/`
- Raw sources: `/Users/jaywest/Agentic-KB/raw/`
- LLM Wiki harness: `/Users/jaywest/My LLM Wiki/`
