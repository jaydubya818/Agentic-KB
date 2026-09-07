---
title: "Mission Control — Factory Memory & Context Intelligence directive"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p6971
captured_at: 2026-08-15T14:16:04.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: 3096a740755ea37f70393d2239c78d1574041a54a5ddfef4b3540b82960ae816
---

You are working inside the Mission Control repository.
Your task is to design and implement the complete Factory Memory & Context Intelligence capability inside Mission Control across all five phases:
Hybrid Factory RAG
Typed Factory Relationships
Agentic Retrieval
Factory Knowledge Graph
Autonomous Context Engineering
This is not a sidecar chatbot and not a generic enterprise search product.
It is a core Mission Control subsystem that gives the Software Factory, Verification Factory, Intelligent Automation Factory, Observability/Evals subsystem, and future autonomous agents persistent, governed, explainable engineering memory.
The long-term architecture is:
                        MISSION CONTROL
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
     SOFTWARE            VERIFICATION        AUTOMATION
      FACTORY              FACTORY            FACTORY
         │                   │                   │
         └───────────────────┼───────────────────┘
                             ▼
                       FACTORY MEMORY
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
          CODE             TRACES          KNOWLEDGE
         SEARCH             EVALS            GRAPH
            │                │                │
            └────────────────┼────────────────┘
                             ▼
                       AGENTIC RETRIEVAL
                             │
                             ▼
                       CONTEXT ENGINE
                             │
                             ▼
                  EXECUTE / VERIFY / LEARN
The product thesis is:
Models and coding agents will continue to improve, but the durable intelligence of the Software Factory comes from understanding the software, architecture, dependencies, historical work, failures, evidence, traces, evals, incidents, decisions, and outcomes accumulated over time.
The system should enable Mission Control to answer not only:
“What documents mention this?”
but also:
“What is connected to this?”
“What changed this component before?”
“What broke historically after similar changes?”
“Which tests and verification strategies apply?”
“Which ADR governs this component?”
“Which FactoryVersion historically performs best for this kind of work?”
“What context does the next autonomous agent actually need?”
Do not implement a generic knowledge-management product.
Implement a Factory Knowledge System specialized for autonomous software engineering.

1. Preserve Mission Control architectural boundaries
These remain locked:
Mission Control owns intent, governance, policy, orchestration, verification, evidence, and acceptance.
Executors own how execution occurs.
workOrders.accept remains the only WorkOrder acceptance authority.
Humans merge PRs.
No full-auto.
GitHub App remains PR system of record.
Executors do not self-certify acceptance.
Verification evidence remains distinct from eval scores.
Traces remain distinct from WorkOrder acceptance.
Factory Memory must not silently mutate production FactoryVersions.
Learning may propose changes, but promotion remains controlled.
Prefer additive schema changes and existing domain concepts.
Do not make an external vector database, graph database, or observability plat
