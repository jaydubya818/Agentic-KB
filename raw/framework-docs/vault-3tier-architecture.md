# Agent Vault — 3-Tier Architecture
> Raw source. Ingest raw/framework-docs/vault-3tier-architecture.md
> Author: Jay West | Date: 2026-04-08 | Status: production

---

## What It Is

The Agent Vault is a structured knowledge and memory system built at `~/.claude/vault/` for Jay's 3-tier agentic stack. It solves the problem that stock Claude agents start each session with zero memory — no knowledge of what worked, what failed, what was decided, or what standards changed. The vault gives every agent a scoped, versioned, tier-appropriate context it loads at task start, and a defined set of write targets at task end. Knowledge compounds across every task, automatically, without human curation.

The vault is separate from the Agentic-KB. The Agentic-KB (this repo) holds canonical concepts, frameworks, and entities — curated, synthesized knowledge promoted here after validation. The vault holds working memory: task logs, sprint state, gotchas as they're discovered, standards as they're decided. The two systems are complementary: vault → discovery → KB promotion is the pipeline.

---

## The 3-Tier Architecture

Jay's agentic stack has three layers:

```
Jay
 └── Orchestrator agents     (receive from Jay, decompose goals, coordinate leads)
      └── Lead agents        (coordinate workers within a domain, own quality for a phase)
           └── Worker agents (execute tasks — code, test, research, security review, DB)
```

### Tier 1: Orchestrator

Agents: `01-architecture-agent`, `02-plan-review-agent`, `architect`

Scope: Strategic. Receives goals from Jay, decomposes them into domain assignments, delegates to leads, tracks cross-project state, makes architectural rulings, writes retrospectives. Never writes production code.

Vault reads: `orchestrator/hot.md`, `orchestrator/domain/project-registry.md`, `orchestrator/domain/team-capabilities.md`, `orchestrator/process/delegation-rules.md`, relevant Agentic-KB pages.

Vault writes: `orchestrator/memory/projects/[project].md` (project state), `orchestrator/memory/decisions/` (ADRs and rulings), `orchestrator/memory/retrospectives/` (phase/project close-out), `bus/standards/` (decisions propagated to leads).

Memory lifetime: permanent. Orchestrator memory is never deleted — it's the long-term institutional record.

### Tier 2: Leads

Agents: `gsd-planner`, `03-planning-agent`, `04-task-breakdown-agent`, `gsd-roadmapper`, `gsd-plan-checker`, `gsd-assumptions-analyzer`, `gsd-nyquist-auditor`, `gsd-integration-checker`, `gsd-ui-auditor`

Four lead domains: `frontend-lead`, `backend-lead`, `qa-lead`, `arch-lead`.

Scope: Coordination. Receives task briefs from orchestrator (written to their `memory/sprint-state.md`), decomposes into worker assignments, reviews worker output, synthesizes patterns, reports back. Owns quality/standards for their domain.

Vault reads: `leads/[domain]-lead/hot.md`, `leads/[domain]-lead/memory/sprint-state.md`, `leads/[domain]-lead/domain/standards.md`, `leads/[domain]-lead/domain/worker-capabilities.md`, `bus/standards/` (orchestrator decisions to consume).

Vault writes: `leads/[domain]-lead/memory/sprint-state.md` (task status), `leads/[domain]-lead/memory/worker-log.md` (worker assignments + outcomes), `leads/[domain]-lead/domain/known-patterns.md` (synthesized at phase end), `bus/discovery/[domain]-YYYY-MM-DD-[slug].md` (findings worth promoting), `bus/standards/api-contract-[slug].md` (interface contracts for other leads).

Memory lifetime: sprint/phase-scoped. Summarized at phase end into `domain/known-patterns.md`. Worker-log entries archived to retrospectives at project close.

### Tier 3: Workers

Agents: `gsd-executor`, `gsd-debugger`, `06-code-generation-agent`, `code-reviewer`, `superpowers-code-reviewer`, `perf-analyzer`, `05-context-manager-agent`, `08-runtime-preparation-agent` (worker: coder); `gsd-verifier`, `07-task-validation-agent`, `gsd-ui-checker` (worker: tester); `gsd-phase-researcher`, `gsd-project-researcher`, `gsd-advisor-researcher`, `gsd-research-synthesizer`, `gsd-ui-researcher`, `gsd-user-profiler`, `gsd-codebase-mapper` (worker: researcher); `security-reviewer` (worker: security); `db-reviewer` (worker: db).

Five worker types: coder, tester, researcher, security, db.

Scope: Execution. Receives task brief from lead's sprint-state, executes, writes output. Does not delegate further. Does not make architectural decisions.

Vault reads: `workers/[type]/process/execution-standards.md`, `workers/[type]/domain/gotchas.md` (fast scan before every task), `workers/[type]/domain/patterns/[relevant].md` (task-specific), lead's `domain/standards.md`.

Vault writes: `workers/[type]/memory/task-logs/YYYY-MM-DD-[slug].md` (ephemeral — cleared after phase summarize-up), `workers/[type]/domain/gotchas.md` (append immediately on discovery), `workers/[type]/domain/patterns/[slug].md` (new reusable pattern), `bus/discovery/[type]-YYYY-MM-DD-[slug].md` (surface to lead), `bus/escalation/[type]-YYYY-MM-DD-[slug].md` (when blocked >30min or security finding).

Memory lifetime: ephemeral — task-scoped. Cleared or summarized after phase end via the summarize-up process. Never accumulates indefinitely.

---

## Vault Context Blocks

Every agent `.md` file in `~/.claude/agents/` now has a vault context block inserted immediately after its YAML frontmatter. The block is either a `<vault_context>` XML section (for GSD agents that use XML-section formatting) or a `## Vault Context` markdown section (for plain-markdown agents).

All 32 agents are wired. Tier breakdown: 3 orchestrator, 8 lead (across 4 domains), 20 worker (across 5 types). One file per agent — no agents unwired. Backups at `~/.claude/agents/.vault-backup-2026-04-08/`.

### What the vault context block does

The block has two parts: LOAD and WRITE.

LOAD lists the exact files to read at task start, in priority order — before any project file reading, before any tool use, before any planning. The list is short (3-5 files) and targeted. No agent loads the full vault or the full Agentic-KB. Each agent loads only what its tier and domain need for that task type.

WRITE lists the exact paths to write at task end, conditional on what was found. If a gotcha was discovered: append to `workers/[type]/domain/gotchas.md`. If a pattern emerged: create `workers/[type]/domain/patterns/[slug].md`. If a discovery is worth surfacing to the lead: write to `bus/discovery/`. If blocked: write to `bus/escalation/`. If an architectural decision was made: write to `orchestrator/memory/decisions/`. The write targets are explicit — agents don't have to decide where things go.

### Why tier-appropriate files only

A worker agent loaded with the full Agentic-KB (100+ pages) would burn context budget on irrelevant content and dilute focus on the task. A coder worker needs: its execution standards, its known gotchas, and the lead's domain standards. That's 3 files, ~150 lines. The orchestrator needs project registry, team capabilities, and delegation rules — not coder gotchas or tester checklists.

Context injection is scoped to decision scope. Workers make execution decisions. Leads make domain-coordination decisions. Orchestrators make strategic decisions. Each tier gets the context appropriate to its decision type, nothing more.

---

## The Inter-Tier Message Bus

The bus at `~/.claude/vault/bus/` is the async communication layer between tiers. It has three channels:

### bus/discovery/

Direction: upward (workers → leads → orchestrator → Agentic-KB).

Workers write raw findings here during or after task execution. Format: `[worker-type]-YYYY-MM-DD-[slug].md`. Fields include `promote_to_kb: true/false` and `status: unprocessed`.

Leads read these at phase end. For each entry: promote to `leads/[domain]-lead/domain/known-patterns.md`, update `workers/[type]/domain/gotchas.md`, or discard. Mark `status: processed`. Delete after processing.

Orchestrator reads lead-promoted discoveries with `promote_to_kb: true` at project close. Promotes worthy findings to Agentic-KB wiki pages.

### bus/escalation/

Direction: upward (workers → leads, leads → orchestrator, orchestrator → Jay).

Workers write when: blocked >30min, scope creep >50%, security finding of any severity, requirements contradiction.
Leads write when: cross-domain blocker, missing capability, conflicting orchestrator tasks.
Orchestrator escalates to Jay when: budget/vendor decision, client timeline impact, security HIGH/CRITICAL, 12-month architecture decision.

Format: `[source-tier]-YYYY-MM-DD-[slug].md`. Severity field: low/medium/high/critical. The receiving tier reads, writes a decision into the `## Response` section, marks `status: responded`. Both parties delete after resolution.

HIGH/CRITICAL findings from the security worker skip the normal lifecycle — they're written immediately and read at the next session start regardless of phase status.

### bus/standards/

Direction: downward (orchestrator/arch-lead → all leads and workers).

Orchestrator or arch-lead writes a standards update after a decision. Format: `[topic]-YYYY-MM-DD-[slug].md`. Contains: what changed, old behavior, new standard, which files to update, which tiers it applies to, a consumed-by checklist.

Leads check `bus/standards/` at every task start. If a new standard exists for their domain: update their `domain/standards.md`, propagate the rule to relevant `workers/[type]/process/execution-standards.md`, mark themselves in the consumed-by checklist. Delete the file when all applicable tiers have marked consumed.

---

## How Knowledge Compounds

The first time a worker runs on a real task, it reads its gotchas.md (empty on day 1), executes, and writes whatever it discovered back to gotchas.md and/or bus/discovery. The second task starts with those gotchas already loaded — the agent doesn't re-discover the same trap. By the fifth task, the gotchas file has a dense library of real, project-specific pitfalls. By the tenth, patterns emerge and get promoted to `domain/patterns/`. By end of sprint, the lead synthesizes everything to `known-patterns.md`. By end of project, the orchestrator promotes the broadly-applicable findings to the Agentic-KB.

This is not RAG. There's no embedding, no retrieval, no similarity search. It's a structured file system read — deterministic, versioned, transparent. Every agent sees exactly what it loaded, and exactly what it wrote. The schema (VAULT-SCHEMA.md) defines the invariants: workers never write directly to Agentic-KB, raw task memory is never promoted unsyntheized, process files are versioned, bus entries are consumed and deleted (never accumulating).

The compounding is vertical (worker → lead → orchestrator → KB) and horizontal (standards flowing down from orchestrator → leads → workers). Decisions made at the top propagate down via `bus/standards/` within one task cycle. Discoveries made at the bottom surface up through `bus/discovery/` within one phase cycle.

---

## Memory Lifecycle Summary

| Tier | Memory Location | Lifetime | Trigger to Summarize |
|------|----------------|----------|---------------------|
| Worker | `workers/[type]/memory/task-logs/` | Ephemeral | Phase end or >500 lines |
| Lead | `leads/[domain]-lead/memory/sprint-state.md` | Sprint-scoped | Phase close |
| Lead | `leads/[domain]-lead/memory/worker-log.md` | Sprint-scoped | Phase close → `domain/known-patterns.md` |
| Orchestrator | `orchestrator/memory/projects/` | Permanent | Project close → `retrospectives/` |
| Orchestrator | `orchestrator/memory/decisions/` | Permanent | Never deleted |
| Orchestrator | `orchestrator/memory/retrospectives/` | Permanent | Quarterly → Agentic-KB |

Summarize-up recipe is at `~/.claude/vault/lint/summarize-up.md`. Three steps: worker logs → lead patterns (per phase), lead patterns → orchestrator retro (per project close), orchestrator retro → Agentic-KB (per project close or quarterly sweep).

---

## vault-lint.sh

Health check script at `~/.claude/vault/lint/vault-lint.sh`. Checks:
1. All 10 required SCOPE.md files present (one per tier/domain/worker-type)
2. Stale discoveries: `bus/discovery/` entries unprocessed >7 days → warning
3. Urgent escalations: HIGH/CRITICAL open >1hr → error; any escalation open >24hr → warning
4. Unconsumed standards: `bus/standards/` active >48hr → warning
5. Oversized worker memory: task log files >500 lines → warning (summarize-up needed)
6. Hot cache bloat: orchestrator hot.md >600 words, lead hot.md >400 words → warning
7. Missing frontmatter version fields → warning

Exit 0 = clean. Exit 1 = errors. Run before starting any agent session.

---

## Key Invariants

1. Workers never write directly to Agentic-KB or `orchestrator/` — always via bus/discovery upward
2. Raw task memory is never promoted unsynthesized — always summarized first by the tier above
3. Process files are versioned (frontmatter `version:` field) — workers reload on version bump
4. `bus/` entries are consumed and deleted — never allowed to accumulate indefinitely
5. Every SCOPE.md defines explicit read list, write list, escalation triggers, output format
6. Confidence levels required on all `domain/` files — default medium if unknown
7. Hot cache has hard word limits: orchestrator 600w, leads 400w — prune LRU when exceeded

---

## Files Created

```
~/.claude/vault/
├── VAULT-SCHEMA.md
├── AGENT-TIER-MAP.md
├── orchestrator/
│   ├── SCOPE.md
│   ├── hot.md
│   ├── memory/{projects,decisions,retrospectives}/
│   ├── domain/{project-registry,team-capabilities,strategic-patterns}.md
│   └── process/{delegation-rules,escalation-paths,coordination-protocols}.md
├── leads/{frontend,backend,qa,arch}-lead/
│   ├── SCOPE.md, hot.md
│   ├── memory/{sprint-state,worker-log}.md
│   ├── domain/{standards,known-patterns,worker-capabilities}.md
│   └── process/
├── workers/{coder,tester,researcher,security,db}/
│   ├── SCOPE.md
│   ├── memory/task-logs/
│   ├── domain/{gotchas,patterns/}/
│   └── process/execution-standards.md
├── bus/{discovery,escalation,standards}/{TEMPLATE.md}
└── lint/{vault-lint.sh,summarize-up.md}
```

Total: 58 files. All 32 agents wired. Lint passes clean.
