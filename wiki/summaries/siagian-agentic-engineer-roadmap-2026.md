---
title: Complete Roadmap to Become an Agentic AI Engineer in 2026
type: summary
source_file: raw/papers/siagian-agentic-engineer-roadmap-2026.md
source_url: https://linkedin.com/in/lamhotsiagian
author: Lamhot Siagian
date_published: 2026-01-19
date_ingested: 2026-04-10
tags: [agentic, orchestration, memory, tool-use, evaluation, deployment, rag, multi-agent, prompt-engineering]
key_concepts: [react-pattern, rag, memory-systems, tool-use, multi-agent-systems, human-in-the-loop, guardrails, llm-as-judge, context-management, trajectory-evaluation]
confidence: medium
---

# Complete Roadmap to Become an Agentic AI Engineer in 2026

**Author:** Lamhot Siagian — PhD Student, AI Evaluation Engineer
**Published:** January 19, 2026
**Format:** 10 sections × 10 interview Q&As; foundation-first learning order

---

## TL;DR

A comprehensive interview prep guide covering the full agentic AI engineering stack in recommended learning order. High-signal source for production patterns, evaluation discipline, and safety thinking. Especially strong on RAG system design, tool safety, and production deployment that the KB currently under-covers.

---

## Learning Order (The Checklist)

```
Python fundamentals →
LLM fundamentals (tokens, budgeting, tool calling) →
Framework selection (start simple, graduate to graphs) →
Advanced concepts (retries, fallbacks, verification) →
Memory (summaries + vectors + checkpointing) →
Tools (schemas, safety gates, observability) →
RAG (chunking, hybrid retrieval, re-ranking, eval) →
Agents (ReAct, supervisors, protocols, safety) →
Real projects (FastAPI + UI + Docker + cloud + CI/CD + eval)
```

---

## Key Claims and Insights

### On Python Project Structure
Layered architecture: `app/ → core/ → agents/ → tools/ → rag/ → eval/ → infra/`. The goal is separations of concern so prompts and tools can evolve without breaking deployment. Type hints (Pydantic) throughout; reduces hallucinated tool parameters. See [[concepts/system-prompt-design]].

### On Context and Prompting
"Prompting is interface design." Specify role, task, constraints, output schema, examples, and tool-use policies. Version prompts like code. Context budgeting = allocating % of window to instructions/chat/docs/memory; enforce and compress when exceeded. See [[concepts/context-management]].

### On Framework Selection
**[[framework-langgraph]]** is recommended for production: explicit state machines, checkpointing, retries, HITL. **[[framework-crewai]]** for role-based multi-agent. **[[framework-autogen]]** for agent-to-agent chat. Key anti-pattern: treating framework as architecture. Framework is an implementation tool; architecture is your state model, tool boundaries, data contracts, and safety rules. Aligns with [[evaluations/eval-orchestration-frameworks]].

### On Memory
Three memory types that complement each other:
- **Summaries** — "what happened" in a session (decisions, commitments, preferences)
- **Embeddings** — large knowledge needing semantic retrieval
- **Structured key-value** — stable facts (user preferences, settings)

Checkpointing = saves workflow state after each step; enables resume, replay, debugging; must include prompt versions. Failure modes: hallucination feedback loops (stored unverified content), stale preferences, conflicting memories. Rule: "only store what you can justify." See [[concepts/memory-systems]].

### On Tool Design
Agent-friendly tool checklist: clear name, narrow purpose, typed input schema, deterministic output, fast failure, structured return data, timeouts, helpful error codes. Separate read/write tools. Require explicit confirmation for irreversible actions. Allowlist + sandbox are both needed — allowlist limits which tools can be called, sandbox limits what they can do. See [[concepts/tool-use]], [[concepts/permission-modes]], [[concepts/guardrails]].

### On RAG
New details not currently in the KB:
- **Chunk size**: 300–800 tokens, 10–20% overlap as starting point; semantic chunking by headings preferred
- **Hybrid retrieval**: dense (embeddings) + sparse (BM25) → re-rank with cross-encoder or LLM judge; improves recall on technical terms
- **Metadata filtering**: filter by tenant/permission/doc-type/date/language in code, not model; key enterprise security requirement
- **Grounded generation**: citations must map to chunk IDs/URLs; automatically verify citations post-generation
- **Index freshness**: incremental indexing; detect changed docs, re-embed affected chunks; streaming ingestion for high-change sources
- **Metrics**: recall@k, precision@k, MRR, nDCG for retrieval; factuality + citation correctness + task success for answers

See [[concepts/memory-systems]] for adjacent coverage; RAG concept page is a gap — candidate for creation.

### On Multi-Agent Patterns
**ReAct**: interleaves reasoning (plan) → action (tool call) → observation (result); iterative; improves factuality by looking things up rather than guessing. Engineering challenge: controlling loops, tool misuse, context growth. See [[concepts/agent-loops]].

**Supervisor pattern**: coordinates specialists with explicit delegation criteria; must be instrumented; adds overhead. See [[concepts/multi-agent-systems]].

**Agent protocol**: standardized message format (goal, constraints, context refs, tool results, final answer with citations). Enables swapping agents/models without breaking workflows.

**Multi-agent RAG+report pattern**: retriever → summarizer (citations) → writer → critic (checks unsupported claims) → supervisor orchestrates with verification loop. See [[patterns/pattern-compounding-loop]].

### On Production Safety
Unique agent safety concerns vs standard LLM apps: agents take *real* actions (write files, send messages, make changes), so errors have real consequences. Prompt injection can redirect *actions* not just text. Tool outputs can contain malicious instructions. Mitigations: least privilege, confirmations, sandboxing, policy gates, audit logs. Safety is an engineering layer, not a prompt-only problem. See [[concepts/guardrails]], [[concepts/human-in-the-loop]], [[concepts/permission-modes]].

### On Production Deployment
End-to-end architecture: UI → FastAPI → Orchestrator graph → Tools + RAG + Memory DB; add observability + eval pipelines + queue for long tasks + retrieval cache.

CI/CD for agents: lint + type check + unit tests + integration tests (mocked tools) → Docker build + scan → staging with canary prompts → eval suites per change → block deploys on metric regression. Treats prompts and policies like code.

Production readiness = reliability + safety + observability + maintainability + continuous evaluation. See [[concepts/observability]].

---

## Gaps This Source Reveals in the KB

| Gap | Priority | Recommended Action |
|-----|----------|--------------------|
| No RAG concept page | High | Create `concepts/rag-systems.md` |
| No hybrid retrieval coverage | High | Add to RAG concept page |
| No grounded generation / citations pattern | Medium | Add to RAG page or new pattern |
| No CI/CD for agents recipe | Medium | Create `recipes/recipe-agent-cicd.md` |
| No production deployment recipe | Medium | Create `recipes/recipe-production-deployment.md` |
| No metadata filtering coverage | Medium | Add to permissions/tool-use pages |
| No ReAct dedicated concept page | Low | Add to `concepts/agent-loops.md` or new page |

---

## Contradictions with Existing KB

None found. Framework ranking ([[framework-langgraph]] for production, GSD for Jay's stack) is complementary — Siagian writes from a Python/LangChain ecosystem perspective; Jay's stack is [[framework-claude-code]]-first.

---

## Related Pages

- [[concepts/memory-systems]]
- [[concepts/tool-use]]
- [[concepts/multi-agent-systems]]
- [[concepts/context-management]]
- [[concepts/guardrails]]
- [[concepts/human-in-the-loop]]
- [[concepts/agent-loops]]
- [[concepts/observability]]
- [[evaluations/eval-orchestration-frameworks]]
- [[mocs/memory]]
- [[mocs/tool-use]]
- [[mocs/evaluation]]
- [[mocs/orchestration]]
