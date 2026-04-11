---
title: Agentic-KB Stats
type: meta
generated: "2026-04-11 06:42"
---

# Agentic-KB — Knowledge Base Stats
> Generated: 2026-04-11 06:42 | Run `node scripts/generate-stats.mjs` to refresh

---

## Overall Metrics

| Metric | Value |
|--------|-------|
| Total wiki pages | **163** |
| Total words | 123,119 |
| Estimated reading time | 616 min |
| Total internal links | 1,198 |
| Avg links per page | 7.3 |
| Avg words per page | 755 |
| Orphan pages | 32 |

---

## Pages by Section

| Section | Pages |
|---------|-------|
| concepts | 35 |
| patterns | 41 |
| frameworks | 12 |
| entities | 10 |
| recipes | 9 |
| evaluations | 2 |
| summaries | 33 |
| syntheses | 3 |
| personal | 4 |
| mocs | 4 |
| system/policies | 5 |

---

## Pages by Type

| Type | Count |
|------|-------|
| pattern | 41 |
| concept | 36 |
| summary | 33 |
| framework | 12 |
| entity | 10 |
| recipe | 9 |
| policy | 5 |
| moc | 4 |
| untyped | 3 |
| personal | 3 |
| evaluation | 2 |
| synthesis | 2 |
| plan | 1 |
| prd | 1 |
| specs | 1 |

---

## Confidence Distribution

| Level | Count |
|-------|-------|
| high | 94 |
| medium | 14 |
| low | 1 |
| unset | 54 |

---

## Freshness (by file mtime)

| Status | Count | Threshold |
|--------|-------|-----------|
| Fresh | 163 | < 30 days |
| Aging | 0 | 30–90 days |
| Stale | 0 | > 90 days |

---

## Bus Items

| Channel | Items |
|---------|-------|
| corrections | 0 |
| discovery | 1 |
| escalation | 0 |
| handoffs | 0 |
| review | 0 |
| standards | 1 |

---

## Agent Namespaces

| Tier | Agents |
|------|--------|
| orchestrators | 1 |
| leads | 2 |
| workers | 1 |

---

## Most Linked Pages

| Page | Outbound Links |
|------|---------------|
| [[index]] | 118 |
| [[entities/jay-west-agent-stack]] | 35 |
| [[mocs/memory]] | 30 |
| [[summaries/siagian-agentic-engineer-roadmap-2026]] | 28 |
| [[mocs/orchestration]] | 26 |
| [[concepts/rag-systems]] | 25 |
| [[mocs/evaluation]] | 20 |
| [[mocs/tool-use]] | 20 |
| [[entities/key-agentic-researchers]] | 19 |
| [[concepts/multi-agent-systems]] | 17 |

---

## Orphan Pages
> Pages with no detected inbound links. Add them to a MoC or index entry.

- [[concepts/agent-observability]]
- [[concepts/agent-sandboxing]]
- [[concepts/llm-owned-wiki]]
- [[concepts/multi-tenancy-agents]]
- [[concepts/tool-use-verify]]
- [[patterns/pattern-adversarial-plan-review]]
- [[patterns/pattern-architecture-decision-record]]
- [[patterns/pattern-architecture-first]]
- [[patterns/pattern-clarification-task]]
- [[patterns/pattern-code-generation-agent]]
- [[patterns/pattern-code-review-agent]]
- [[patterns/pattern-context-manager-agent]]
- [[patterns/pattern-database-review]]
- [[patterns/pattern-deviation-rules]]
- [[patterns/pattern-librarian-agent]]
- [[patterns/pattern-milestone-planning]]
- [[patterns/pattern-milestone-task-breakdown]]
- [[patterns/pattern-runtime-preparation]]
- [[patterns/pattern-scientific-debugging]]
- [[patterns/pattern-single-task-code-agent]]
- [[patterns/pattern-structured-assumptions]]
- [[patterns/pattern-structured-comparison-table]]
- [[patterns/pattern-task-breakdown-agent]]
- [[patterns/pattern-task-validation-agent]]
- [[patterns/pattern-write-to-disk-worker]]
- [[personal/personal-setup-overview]]
- [[personal/private-test-note]]
- [[projects/example-project/implementation-plan]]
- [[projects/example-project/prd]]
- [[projects/example-project/specs]]
- *(+2 more — run lint for full list)*

---

## How to Refresh
```bash
node scripts/generate-stats.mjs
# Or with explicit root:
node scripts/generate-stats.mjs --kb-root /path/to/Agentic-KB
```
