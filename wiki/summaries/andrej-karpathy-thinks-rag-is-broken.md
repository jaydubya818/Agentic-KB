---
id: 01KNNVX2R9M462HKZKR29AE4WJ
title: "Andrej Karpathy Thinks RAG Is Broken"
type: summary
tags: [rag, memory, agentic, knowledge-management, llm-wiki]
source: raw/note/andrej-karpathy-thinks-rag-is-broken.md
source_type: note
created: 2026-04-07
updated: 2026-04-07
entities: [Andrej Karpathy]
related:
  - "[[concepts/memory-systems]]"
  - "[[concepts/multi-agent-systems]]"
  - "[[concepts/context-management]]"
  - "[[concepts/llm-wiki]]"
status: stable
---

# Andrej Karpathy Thinks RAG Is Broken

## Source
Short-form note summarizing Andrej Karpathy's public announcement of **LLM Wiki**, a project that gained 5,000 GitHub stars within 48 hours of release (circa April 2026).

## Core Claim
Traditional RAG (Retrieval-Augmented Generation) is fundamentally broken because it **re-derives knowledge on every query**. It retrieves fragments, assembles an answer, then forgets everything. LLM Wiki proposes a replacement: a **persistent, compounding knowledge base** that is built and maintained automatically by an LLM.

## RAG vs. LLM Wiki — The Key Distinction

| Dimension | RAG | LLM Wiki |
|---|---|---|
| Knowledge persistence | Ephemeral — forgotten after each query | Permanent — compiled once, built on forever |
| Knowledge accumulation | None — rediscovered each time | Compounding — every source makes the wiki smarter |
| Cross-source synthesis | Ad hoc, per-query | Ongoing — contradictions flagged, cross-refs built automatically |
| Maintenance burden | User re-queries; no structural update | LLM does the maintenance automatically |
| Analogous tools | NotebookLM, ChatGPT file uploads | Obsidian (IDE) + LLM (programmer) + wiki (codebase) |

## How LLM Wiki Works
1. Drop a source into a raw collection (article, paper, transcript, notes).
2. LLM reads it, writes a summary, updates the master index.
3. LLM updates every relevant entity and concept page across the wiki — one source can touch 10–15 pages simultaneously.
4. Cross-references are built automatically; contradictions between sources are flagged.
5. Answers to queries that yield insight are filed back as new pages — explorations compound, nothing disappears into chat history.

## Use Cases Cited by Karpathy
- **Personal knowledge:** Track goals, health, psychology via journal entries and articles; build a structured self-model over time.
- **Research:** Read papers for months; maintain an evolving thesis in a comprehensive wiki.
- **Book reading:** Build a fan wiki as you read — characters, themes, plot threads, all cross-referenced.
- **Business intelligence:** Feed Slack threads, meeting transcripts, customer calls; wiki stays current because the LLM does the maintenance.

## Mental Model
> *Obsidian is the IDE. The LLM is the programmer. The wiki is the codebase. You never write the wiki yourself — you source, explore, and ask questions. The AI does all the grunt work.*

## Relevance to This KB
This KB is itself an instantiation of the LLM Wiki pattern. The INGEST workflow described in `CLAUDE.md` directly implements the mechanics Karpathy describes: fan-out updates to multiple pages per source, automatic cross-referencing, and compounding synthesis over time.

## Key Entities
- **Andrej Karpathy** — AI researcher, former OpenAI/Tesla; author of LLM Wiki concept.
- **LLM Wiki** — The pattern/project described; open-source, 5k stars in 48 hours.
