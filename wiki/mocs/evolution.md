---
title: Evolution & Scaling
type: moc
category: structure
tags: [scaling, multi-vault, team, long-term, evolution, ai-integration]
created: 2026-04-13
updated: 2026-04-13
---

# Evolution & Scaling

How the KB grows without collapsing. Covers new skill development, multi-vault management, team collaboration patterns, long-term knowledge evolution, and next-level AI integration.

---

## New Skill Development

Skills compound — each new skill is available to all future sessions and agents. The skill development lifecycle:

**Identify:** a task you perform repeatedly that Claude handles inconsistently → skill candidate.

**Design:** write the SKILL.md. Required sections: trigger conditions, pre-conditions, step-by-step procedure, output format, quality checks, failure modes.

**Test:** run the skill on 3 different inputs. Mark `tested: true` with date in the summary page.

**Register:** add to `raw/my-skills/` as a source, add to `wiki/summaries/summary-{skill-name}.md` after ingest, update [[entities/jay-west-agent-stack]].

**Promote:** after 5+ successful uses, add the skill's core pattern to `wiki/patterns/` as a permanent pattern page.

Current skill development priorities (from [[personal/hermes-operating-context]]):
- Research engine execution — run 2 live research projects to validate the methodology
- Auto-INGEST trigger — detect new files in `raw/` and trigger INGEST automatically
- KB→Obsidian graph sync — keep the main Obsidian vault linked to Agentic-KB

---

## Multi-Vault Management

Jay currently operates two separate knowledge stores:
1. **Agentic-KB** — engineering-focused, LLM-maintained, strict schema
2. **`~/Documents/Obsidian Vault/`** — personal PKM, human-maintained, flexible structure

**Cross-vault principles:**
- The Agentic-KB is the source of truth for engineering knowledge. The main vault can reference it, not the reverse.
- Do not copy content between vaults — link instead.
- For federated search (searching both vaults in one query), use the `mcp__obsidian__*` MCP tools to read the main vault, and `mcp__agentic-kb__*` for the engineering KB.

**Planned: `wiki/personal/obsidian-vault-map.md`** — a map of which folders in the main Obsidian vault are worth ingesting into Agentic-KB on demand. Closes the cross-vault gap identified in the ByteRover analysis.

**If vault count grows beyond 2:**
- Introduce a `meta/` vault — a lightweight index of all vaults with entry points
- Each vault gets a `VAULT.md` (analogous to CLAUDE.md) that describes its purpose, schema, and audience
- Cross-vault links use absolute paths, not wiki links

---

## Team Collaboration

The current KB is single-user. If it ever expands to a team:

**What scales cleanly:**
- The schema (CLAUDE.md) — any agent can follow it
- The INGEST workflow — multiple contributors can add to `raw/` without coordination
- The MoC structure — domain hubs absorb new pages without restructuring

**What needs coordination:**
- `wiki/hot.md` — one owner, not merged by committee (becomes inconsistent fast)
- `wiki/personal/` — namespaced by contributor: `wiki/personal/{name}/`
- Conflict resolution — `wiki/log.md` is the audit trail; contradictions require explicit resolution, not silent overwrite (see [[system/policies/contradiction-policy]])

**Git workflow for teams:**
- Main branch = stable wiki
- Feature branches = in-progress ingestion sessions
- PR review = Hermes does a lint pass on proposed changes before merge
- Never force-push to main — log is append-only and must remain intact

---

## Long-term Knowledge Evolution

A KB that doesn't evolve becomes a liability. Patterns for sustained quality:

**Deprecation over deletion.** Don't delete stale pages — mark `status: deprecated` and add a note explaining why. The deprecation itself is knowledge.

**Confidence decay.** Information ages. Frameworks evolve. Models improve. A claim marked `high` confidence in 2025 may be `medium` by 2026. The `last_checked` and `updated` fields exist to surface this.

**Annual synthesis.** Once per year: run EXPLORE workflow across the full KB, identify the 5 most interesting synthesis opportunities, produce 5 new `wiki/syntheses/` pages. This is how the KB builds intellectual capital, not just volume.

**Pruning.** After 2+ years, some summaries will be superseded by better sources. Prune with care: remove the summary, redirect inbound links to the better source, log the removal.

**The compounding threshold.** A KB starts compounding when: (1) new information connects to ≥3 existing pages, (2) Hermes can answer novel questions using only KB content, and (3) synthesis pages are cited more often than source summaries. Aim for this threshold within the first 200 pages.

---

## Next-Level AI Integration

Where the KB is headed:

**Graph database layer.** When the ontology-lite flat files in [[knowledge-systems/research-engine/knowledge/relationships|relationships]] get unwieldy (>500 edges), migrate to a local graph DB (Kuzu, DuckDB with graph extensions). The migration path is already designed in [[knowledge-systems/research-engine/methodology/ontology-lite|Ontology-Lite]].

**Semantic search layer.** Add BM25 + vector hybrid search over the wiki via the `packages/mcp` MCP server in `My LLM Wiki`. The RLM pipeline pattern is the target architecture: [[concepts/rlm-pipeline]]. Recipe: [[recipes/recipe-hybrid-search-llm-wiki]].

**Active KB maintenance agent.** A scheduled agent (runs nightly) that: reads `wiki/log.md` for recent writes, checks for broken links, updates `wiki/recently-added.md`, and flags any pages with `confidence: low` older than 60 days. Would use `mcp__scheduled-tasks__*`.

**MissionControl integration.** Hermes + MissionControl = agentic orchestration with the KB as the shared memory layer. Every agent in the MissionControl fleet can read/write the KB. The Hermes bus (`mcp__hermes__*`) is the coordination substrate.

---

## Related

- [[mocs/automation|Automation]] — Skill development workflow
- [[mocs/maintenance|Maintenance & Optimization]] — Health check cadence
- [[personal/hermes-operating-context]] — Current priority stack and open blockers
- [[knowledge-systems/research-engine/methodology/ontology-lite|Ontology-Lite]] — Graph DB migration path
- [[concepts/rlm-pipeline]] — Semantic search architecture
