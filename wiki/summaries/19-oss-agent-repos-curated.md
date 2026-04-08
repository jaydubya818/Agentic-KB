---
id: 01KNNVX2R91BG052Q0HATW1BTB
title: 19 Open-Source GitHub Repos for AI Agents — Curated List
type: summary
tags: [agentic, open-source, orchestration, memory, tools, frameworks, coding-agents, observability]
source: raw/articles/19-oss-agent-repos-curated.md
source_type: article
created: 2026-04-07
updated: 2026-04-07
related:
  - [[concepts/multi-agent-systems]]
  - [[concepts/memory-systems]]
  - [[concepts/agent-loops]]
status: stable
---

# 19 Open-Source GitHub Repos for AI Agents — Curated List

## Source
Curated LinkedIn post captured to Apple Notes, April 5, 2026. Covers the agentic OSS stack across four domains: multi-agent orchestration, autonomous coding agents, memory & reasoning, and tools/observability.

---

## Key Takeaways

1. **Full-stack coverage in OSS**: The ecosystem now covers every layer of the agentic stack — orchestration, autonomous execution, memory management, sandboxed execution, and production observability — entirely for free.
2. **Memory is a first-class concern**: At least three dedicated OSS projects (mem0, MemGPT/Letta, DSPy) address memory and context persistence across sessions, signaling maturity in this sub-domain.
3. **Coding agents are proliferating**: Five distinct autonomous coding agents exist (SWE-agent, OpenHands, Agent-Zero, Devika, Plandex), each with different scope and interface assumptions.
4. **Production tooling is catching up**: E2B (sandboxed execution), AgentOps (observability), and Composio (integrations) form an emerging production infrastructure layer for agents.

---

## Repo Index by Category

### Multi-Agent Orchestration
| Repo | Key Idea |
|------|----------|
| **Camel-AI** | Role-playing agents with structured conversations and task delegation |
| **MetaGPT** | Assigns specialized roles (PM, Engineer, QA) to LLMs; meta-programming framework |
| **Atomic Agents** | Modular, composable agent components; small testable units |
| **GPTSwarm** | Graph-based multi-agent networks; optimizable topology |
| **Burr** | State-machine-based framework; inspectable, reliable agentic workflows |

### Autonomous Builders (Coding Agents)
| Repo | Key Idea |
|------|----------|
| **SWE-agent (Princeton)** | Autonomous GitHub issue resolution |
| **OpenHands** | Open-source Devin alternative; full coding + execution |
| **Agent-Zero** | Minimal general-purpose autonomous agent |
| **Devika** | Plans, codes, and executes like a software engineer |
| **Plandex** | Terminal-based; handles large multi-file tasks |

### Memory & Reasoning
| Repo | Key Idea |
|------|----------|
| **DSPy (Stanford)** | Programs (not prompts) LMs; self-optimizing pipelines |
| **mem0** | Persistent cross-session memory layer for agents |
| **MemGPT / Letta** | OS-inspired hierarchical memory with self-managed paging |
| **Storm (Stanford)** | Research synthesis → Wikipedia-style long-form output |

### Tools & Observability
| Repo | Key Idea |
|------|----------|
| **Skyvern** | Browser automation via LLM + computer vision; replaces Playwright/Selenium |
| **E2B** | Secure code sandboxes for agent-generated code execution |
| **AgentOps** | Session replays, cost tracking, error debugging for agents |
| **Composio** | 100+ pre-built tool integrations (GitHub, Notion, Salesforce, etc.) |

---

## Notable Projects (Expanded Context)
- **Camel-AI** & **MetaGPT**: Most established multi-agent frameworks in this list.
- **DSPy**: Academically rigorous; treats prompt engineering as an optimization problem.
- **E2B** & **AgentOps**: Production-ready infrastructure; recommended for any deployed agent system.
- **MemGPT/Letta**: Conceptually distinct — treats memory management as an OS scheduling problem.

---

## Connections
- Reinforces [[concepts/multi-agent-systems]] — multiple frameworks now for role-based and graph-based coordination.
- Reinforces [[concepts/memory-systems]] — mem0, MemGPT, DSPy all address different memory layers.
- Skyvern and E2B are relevant to [[concepts/agent-loops]] (tool use within loops) and [[concepts/permission-modes]] (sandboxing).
- AgentOps and Composio are core to production deployment; see also [[concepts/agent-failure-modes]].
