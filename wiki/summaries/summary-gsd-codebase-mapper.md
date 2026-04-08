---
id: 01KNNVX2RC6SXVHYKVPYANQREC
title: GSD Codebase Mapper Agent
type: summary
source_file: raw/my-agents/gsd-codebase-mapper.md
author: Jay West
date_ingested: 2026-04-04
tags: [agentic, claude-code, agent-definition, gsd, codebase-analysis, documentation]
key_concepts: [focus-area-routing, write-and-return, prescriptive-documentation, forbidden-files, four-focus-areas]
confidence: high
---

# GSD Codebase Mapper Agent

## Key Purpose

Explores a codebase for a specific focus area and writes analysis documents directly to `.planning/codebase/`. Its job is to reduce the orchestrator's context load by writing findings to disk rather than returning them. Spawned by `/gsd:map-codebase` with one of four focus areas.

## Tools Granted

`Read, Bash, Grep, Glob, Write` — Color: cyan. Notably has Write but not Edit (it creates new documents, doesn't patch existing code). No web access — it only analyzes what's already in the codebase.

## Design Decisions

### Write-and-Return Pattern

The mapper's output goes to disk, not to its caller. It returns only a brief confirmation (~10 lines) stating what was written and where. This is the opposite of most agents that return findings inline.

**Why this matters:** The orchestrator's context stays clean. If the mapper returned its full analysis, the orchestrator would accumulate 200+ lines of codebase findings before even starting to plan. Writing to disk means the planner reads exactly the documents it needs, when it needs them.

### Four Focus Areas with Fixed Document Outputs

| Focus | Documents Written |
|-------|------------------|
| `tech` | STACK.md, INTEGRATIONS.md |
| `arch` | ARCHITECTURE.md, STRUCTURE.md |
| `quality` | CONVENTIONS.md, TESTING.md |
| `concerns` | CONCERNS.md |

Downstream consumers (planner, executor) load these documents selectively based on the type of work they're doing. A UI phase loads CONVENTIONS.md and STRUCTURE.md; a database phase loads ARCHITECTURE.md and STACK.md.

### Prescriptive Over Descriptive

Documents guide future agents writing code, so they must be prescriptive:
- "Use camelCase for functions" (prescriptive — guides behavior)
- NOT "Some functions use camelCase" (descriptive — doesn't guide)
- NOT "The service handles users" (vague — no file path)

Every finding must include a backtick-formatted file path. No vague references.

### Forbidden Files Protocol

The mapper explicitly lists files it will never read or quote: `.env`, `*.pem`, `*.key`, credential files, SSH keys, cloud service credentials, package manager auth tokens. It notes existence only. Rationale included in the definition: "Your output gets committed to git. Leaked secrets = security incident."

### Current-State-Only Rule

"Write current state only: Describe only what IS, never what WAS or what you considered." No temporal language, no mention of exploration paths. The output documents are reference materials, not investigation logs.

### Structured Templates

Each document type has a complete fill-in-the-blank template embedded in the agent definition. The mapper fills templates rather than inventing formats, ensuring consistency across different projects and mapper invocations.

## Prompt Patterns Observed

- **"RETURN ONLY CONFIRMATION"** in capital letters — strong signal that returning findings inline was a real problem before this rule was added.
- **Why-this-matters section:** The definition includes a `<why_this_matters>` section explaining how downstream agents consume these documents. Giving the agent the consumption context helps it write more useful output.
- **Exploration commands by focus area:** Each focus area has specific bash commands for exploration. The agent doesn't improvise how to scan a codebase — it follows a defined exploration protocol.
- **Template embedded in definition:** Rather than referencing an external template file, the full document templates are in the agent definition. This makes the agent self-contained but increases definition length.

## Related Concepts

- [[wiki/summaries/summary-gsd-planner]]
- [[wiki/summaries/summary-gsd-executor]]
- [[wiki/personal/personal-agent-design-observations]]

## Sources

- `raw/my-agents/gsd-codebase-mapper.md`
