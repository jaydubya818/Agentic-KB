---
id: 01KNNVX2R6XJFW5SGH7Q5WH4FX
title: Jay's Agent Design Patterns (Observed)
type: personal
category: pattern
confidence: medium
date: 2026-04-04
tags: [personal, claude-code, agent-design, patterns, tool-restriction, output-format]
---

# Jay's Agent Design Patterns (Observed)

Patterns extracted by reading all 32 agent definitions in `raw/my-agents/`. These are observations, not prescriptions — they reflect what Jay has converged on through iteration, not explicit design rules he articulated.

## 1. Persona-Role Opening (Universal)

Every agent begins with a one-sentence persona statement in a `<role>` or plain opening:
- "You are a GSD plan executor."
- "You are a performance engineer who profiles, measures, and optimizes systems."
- "You are an application security engineer specializing in web application security."

The persona statement always names the role + one defining characteristic. It never says "You are a helpful assistant that..." — it names a specific professional role.

## 2. XML Section Architecture (GSD Agents)

GSD agents use named XML sections as behavioral modules: `<role>`, `<project_context>`, `<philosophy>`, `<execution_flow>`, `<deviation_rules>`, `<checkpoint_protocol>`, `<success_criteria>`. Each section is self-contained. This enables updating one behavior (e.g., checkpoint handling) without touching others.

Simple/specialist agents (architect, code-reviewer, security-reviewer) use Markdown headers instead. The GSD agents are more complex and benefit from the XML modularity.

## 3. Tool Restriction by Role

Tool grants are tightly scoped to actual need:

| Agent Type | Tools | Rationale |
|------------|-------|-----------|
| GSD Executor | Read, Write, Edit, Bash, Grep, Glob | Builds code, no research |
| GSD Planner | + WebFetch, mcp__context7__* | Needs to research libraries |
| GSD Debugger | + WebSearch | Looks up error messages |
| GSD Mapper | Read, Bash, Grep, Glob, Write (no Edit) | Creates new docs, doesn't patch |
| GSD Assumptions Analyzer | Read, Bash, Grep, Glob | Codebase-only, no external |
| Specialist Agents | None specified | Inherit context |

Pattern: analysts and planners get web access; executors don't. Codebase-only agents don't get web access even if they're "smart" agents.

## 4. Mandatory Initial Read Protocol

Every GSD agent includes: "If the prompt contains a `<files_to_read>` block, you MUST use the `Read` tool to load every file listed there before performing any other actions. This is your primary context."

This is identical across all GSD agents — it's a system-level pattern, not per-agent customization. The orchestrator injects context via `<files_to_read>` tags; the agent reads them first.

## 5. Structured Output as Contract

Every agent has a defined output format embedded in its definition. Formats are specified to the field level:
- Code reviewer: specific severity sections with exact emoji prefixes
- GSD executor: CHECKPOINT REACHED format with exact table columns
- GSD verifier: VERIFICATION.md with specific YAML frontmatter schema

This makes agent outputs machine-parseable and consistent across invocations. The orchestrator can reliably parse what agents return.

## 6. Forbidden Pattern Statements

Several agents include explicit "never do this" rules in capital letters or bold:
- "NEVER `git add .` or `git add -A`"
- "ALWAYS use the Write tool — never use `Bash(cat << 'EOF')`"
- "RETURN ONLY CONFIRMATION"
- "Do NOT commit"

These prohibitions almost always point to real failure modes that were discovered in practice. The stronger the emphasis, the more likely it was a real problem.

## 7. Model Assignment Patterns

| Model | Agents | Rationale |
|-------|--------|-----------|
| claude-opus-4-6 | architect, security-reviewer | High-stakes decisions, expensive per call |
| claude-sonnet-4-5 | code-reviewer, perf-analyzer, db-reviewer | Quality review, good cost/performance |
| inherit | superpowers-code-reviewer | Takes spawner's model |
| (unspecified) | All GSD agents | Use system default |

Pattern: agents that produce long-lasting structural artifacts (ADRs, security reports) get Opus. Agents that run frequently (code review per feature) get Sonnet. GSD execution agents don't specify model — they run at whatever the system default is.

## 8. Success Criteria Checklists

GSD agents end with a `<success_criteria>` section of checkbox items:
```
- [ ] All tasks executed (or paused at checkpoint with full state returned)
- [ ] Each task committed individually with proper format
- [ ] SUMMARY.md created
...
```

This serves two purposes: the agent can self-verify completion, and the checklist communicates to readers exactly what "done" means for this agent.

## 9. Numbered Pipeline vs. Orchestrator Star

Two architectural styles appear in the agent set:
- **Numbered pipeline (01–07):** Rigid chain, each agent announces readiness to the next
- **GSD orchestrator star:** Central skill spawns named agents; agents don't know about each other

The numbered pipeline style is older and more brittle. The GSD star topology is more flexible — agents can be recombined into different workflows. Jay appears to have moved from pipeline to orchestrator over time.

## 10. Project Context Discovery (GSD Universal)

Every GSD agent has a `<project_context>` section instructing it to:
1. Read `./CLAUDE.md` if it exists
2. Check `.claude/skills/` for project skills (read SKILL.md only, not full AGENTS.md files)
3. Apply project-specific conventions during its work

This is a self-contained context discovery protocol that makes GSD agents project-aware without requiring the orchestrator to inject all project context. The agent discovers its own context on arrival.

## Related Concepts

- [[wiki/summaries/summary-gsd-executor]]
- [[wiki/summaries/summary-gsd-planner]]
- [[wiki/summaries/summary-gsd-framework-skills]]
- [[wiki/summaries/summary-multi-agent-patterns-skill]]
