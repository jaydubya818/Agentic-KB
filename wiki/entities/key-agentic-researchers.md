---
id: 01KNNVX2QPPC3911MR4RMVQZ5X
title: Key Agentic AI Researchers
type: entity
category: ecosystem
tags: [researchers, agentic, multi-agent, education, community]
created: 2026-04-04
updated: 2026-04-04
---

## Overview

The researchers and practitioners who have most shaped the agentic AI landscape — defining patterns, publishing seminal work, building foundational tools, and establishing the vocabulary the field uses. This page focuses on those directly relevant to Jay's work and this KB.

---

## Andrej Karpathy

**Affiliation**: Eureka Labs (founder); former OpenAI co-founder, Tesla AI Director
**Most relevant to Jay**: LLM wiki pattern (direct inspiration for this KB)

See [[entities/andrej-karpathy]] for full coverage.

**Key agentic contributions**:
- LLM wiki pattern — plaintext knowledge bases for LLM context injection
- "Intro to Large Language Models" (2023) — popularized "System 1 vs System 2" framing for LLM reasoning, directly leading to reasoning models
- nanoGPT — demystified transformers; understanding transformer internals is prerequisite knowledge for agentic system design

---

## Harrison Chase

**Affiliation**: LangChain Inc. (co-founder, CEO)
**Most relevant to Jay**: Created LangChain and LangGraph — the dominant Python multi-agent framework

**Key contributions**:
- **LangChain** (2022): established the first widely-adopted framework for LLM application development; introduced the chain metaphor, agent executor pattern, and tool use abstractions that influenced all subsequent frameworks
- **LCEL (LangChain Expression Language)**: declarative pipe-based composition for LLM pipelines
- **LangGraph** (2024): graph-based stateful orchestration; introduced checkpointing, conditional edges, and the supervisor/swarm patterns to mainstream multi-agent work
- **LangSmith**: observability layer that established what "production-ready LLM tracing" should look like

**Criticism (fair)**: LangChain 0.1.x introduced significant abstraction debt; the community's frustration with frequent breaking changes is legitimate. The pivot to LangGraph represents a more mature architectural vision.

See [[entities/langchain-ecosystem]] and [[frameworks/framework-langgraph]].

---

## Yohei Nakajima

**Affiliation**: Untapped Capital (VC), independent researcher
**Most relevant to Jay**: BabyAGI — first viral demonstration of autonomous task generation and execution

**Key contributions**:
- **BabyAGI** (April 2023): 100-line Python script that spawned an agent loop: LLM creates tasks, executes them, evaluates results, creates new tasks. Went viral — demonstrated "an agent that can write its own to-do list" to a non-technical audience. Triggered the "agentic AI" discourse that defined 2023-2024.
- Established vocabulary: "task agent", "objective-driven agents", autonomous task decomposition
- **Limitations he acknowledged**: BabyAGI loops infinitely without meaningful progress; it revealed the hard problems of task decomposition, prioritization, and termination that subsequent frameworks solved

**Why he matters**: BabyAGI wasn't production-ready, but it was the proof-of-concept that made non-ML engineers believe in autonomous agents. The frameworks that followed (AutoGen, CrewAI, LangGraph) are all responses to BabyAGI's limitations.

---

## Andrew Ng

**Affiliation**: Deeplearning.ai, AI Fund, former Google Brain, Baidu
**Most relevant to Jay**: Agentic design patterns framework — the clearest taxonomy of agentic behaviors

**Key contributions**:
- **"Agentic Design Patterns"** (2024 talk/essay): defined four core agentic patterns:
  1. **Reflection** — agent reviews its own output and iterates
  2. **Tool use** — agent calls external functions/APIs
  3. **Planning** — agent creates and follows a step-by-step plan
  4. **Multi-agent collaboration** — multiple agents with different roles
  These four patterns are now the canonical vocabulary; this KB's concept pages use this framework.
- **Deeplearning.ai courses**: Short (1-4 hour) practical AI courses that are the best on-ramp for engineers new to LLMs; "Building Agentic AI Systems" course is directly relevant
- Argued (correctly, in hindsight) that "agentic" AI would be the dominant paradigm by 2025 — before most of the industry believed it

**Perspective**: Ng is an educator and thought leader, not primarily a researcher in this domain. His patterns framework is a synthesis of existing work, clearly communicated — which is its value.

---

## Lilian Weng

**Affiliation**: OpenAI (head of safety); independent blog (lilianweng.github.io)
**Most relevant to Jay**: "LLM Powered Autonomous Agents" blog post — the foundational survey

**Key contributions**:
- **"LLM Powered Autonomous Agents"** (June 2023, lilianweng.github.io): The seminal survey that defined the taxonomy of LLM agents. Introduced the framework: **Memory** (sensory, short-term, long-term) × **Action** (external tools, storage, processes) × **Planning** (task decomposition, reflection). Still cited in virtually every multi-agent paper.
- Her blog is arguably the highest signal-to-noise technical writing in the field — dense with mechanism-level explanations, rigorous citations, no hype
- Survey papers on: chain-of-thought, tool use, context length, hallucination, alignment — each is a go-to reference

**Her agent architecture framework**:
```
LLM Agent =
  Planning (decompose goals, reflect on results)
  + Memory (in-context, external storage, RAG)
  + Tools (web search, code exec, APIs, other agents)
```
This maps directly to the concepts in this KB's `concepts/` directory.

---

## Kanjun Qiu

**Affiliation**: Imbue (founder/CEO)
**Most relevant to Jay**: Agent reliability research — why agents fail and how to make them robust

**Key contributions**:
- **Imbue's agent reliability research**: systematic study of where agents fail in long-horizon tasks; identified: context drift, tool failure recovery, goal drift, hallucinated tool outputs as primary failure modes
- **"Agents need memories"** thesis: early advocate for persistent agent memory as prerequisite for reliable long-horizon tasks — influenced how memory systems are designed in production agents
- Pushed back on the "just use a bigger context window" approach; argued that structured external memory is architecturally superior for reliability

**Why she matters**: Imbue is one of the few companies whose research focus is specifically agent reliability in production (not just capability). Their work on failure modes directly informs the error-handling patterns in this KB.

---

## Relevant Papers by the Community

| Paper | Authors | Contribution |
|-------|---------|-------------|
| "Toolformer" (2023) | Schick et al. (Meta) | First paper showing LLMs can learn to use tools via self-supervision |
| "ReAct: Synergizing Reasoning and Acting" (2022) | Yao et al. | ReAct pattern: interleave reasoning (thought) with acting (tool use); foundational for tool-using agents |
| "Generative Agents" (2023) | Park et al. (Stanford) | Simulated 25 agents in a virtual town; introduced memory stream + reflection + planning architecture |
| "AutoGPT" | Riedl et al. | First widely-deployed autonomous goal-directed agent; showed and revealed limitations of unconstrained agent loops |
| "MetaGPT" (2023) | Hong et al. | Multi-agent software development; introduced structured roles (PM, Architect, Engineer) — influenced CrewAI's design |

---

## Integration Points

- **[[entities/andrej-karpathy]]**: Full page on Karpathy
- **[[entities/langchain-ecosystem]]**: Harrison Chase's company
- **[[frameworks/framework-langgraph]]**: Chase's primary technical output
- **[[frameworks/framework-autogen]]**: AutoGen influenced by BabyAGI and multi-agent collaboration research
- **[[frameworks/framework-crewai]]**: CrewAI influenced by MetaGPT's role-based agent design
- **[[concepts/multi-agent-systems]]**: Weng's taxonomy and Ng's four patterns are foundation

---

## Sources

- Public blog posts, papers, and talks from each researcher
- [[entities/langchain-ecosystem]]
- [[entities/andrej-karpathy]]
- [[frameworks/framework-langgraph]]
