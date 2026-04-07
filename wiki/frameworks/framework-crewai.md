---
title: CrewAI
type: framework
vendor: CrewAI Inc.
version: "0.80.x (2025)"
language: python
license: open-source
github: "https://github.com/crewAIInc/crewAI"
tags: [crewai, multi-agent, role-based, orchestration, python, task-delegation]
last_checked: 2026-04-04
jay_experience: none
---

## Overview

CrewAI is a Python multi-agent framework built around the metaphor of a crew of workers — agents are defined by **role**, **goal**, and **backstory**, and they execute **tasks** in either sequential or hierarchical order. The framing is deliberately human-analogous: a Researcher agent, a Writer agent, a QA agent each have a professional identity that shapes their behavior.

CrewAI sits between AutoGen (conversational) and LangGraph (graph/state machine) on the flexibility spectrum. It is more opinionated than LangGraph but less verbose than AutoGen for structured pipelines. Best suited for well-defined workflows where the task sequence is known upfront and agents have clear, non-overlapping responsibilities.

---

## Core Concepts

### Agents
Agents are the workers. Each is defined with three identity fields:

```python
from crewai import Agent

researcher = Agent(
    role="Senior Research Analyst",
    goal="Uncover cutting-edge developments in {topic} and provide actionable insights",
    backstory=(
        "You're a seasoned analyst at a leading tech think tank. "
        "Known for your ability to cut through noise and identify what matters."
    ),
    tools=[search_tool, web_scraper],
    llm="claude-sonnet-4-6",
    verbose=True,
    allow_delegation=True   # can assign subtasks to other agents
)
```

The `role`, `goal`, and `backstory` are injected into the system prompt. They're not magic — they're just structured prompt engineering.

### Tasks
Tasks are the units of work. Each task has a description, expected output, and is assigned to an agent:

```python
from crewai import Task

research_task = Task(
    description="Research the top 5 developments in {topic} from the past 6 months",
    expected_output="A bulleted list of 5 developments with sources and 2-3 sentence summaries",
    agent=researcher,
    output_file="research.md"   # auto-saves output
)
```

Tasks can be:
- **Sequential**: output of task N feeds into task N+1 as context
- **Async**: run in parallel (when using parallel process)
- **Human input**: `human_input=True` pauses for human review before proceeding

### Process Types

**Sequential process**: tasks run in order, each output becoming context for the next. Most common pattern. Deterministic, easy to debug.

**Hierarchical process**: a manager agent (LLM-based) decides task order and delegates to worker agents dynamically. More flexible, more expensive, less predictable. Manager is auto-created or explicitly defined.

**Parallel process**: multiple tasks run concurrently (Python asyncio). Results merged before next stage.

### Memory Types
CrewAI has a layered memory system — more sophisticated than most frameworks:

| Memory Type | Scope | Backend |
|-------------|-------|---------|
| Short-term | Within a single crew run | RAG (Chroma) |
| Long-term | Persists across runs | SQLite |
| Entity memory | Facts about entities (people, projects) | RAG |
| Contextual | Full conversation history within run | In-context |

Enable with `memory=True` on the Crew. Long-term memory uses SQLite by default; can swap to a vector DB.

### Delegation
When `allow_delegation=True`, an agent can assign a subtask to another agent in the crew. The receiving agent executes it and returns results. This enables emergent hierarchy without explicit manager definition — a researcher might delegate fact-checking to a specialized verifier.

### Tools Integration
CrewAI tools are wrappers around LangChain tools (most), custom Python functions, or its own built-in tools. Built-ins include: `SerperDevTool` (web search), `FileReadTool`, `CSVSearchTool`, `PDFSearchTool`, `WebsiteSearchTool`. Any LangChain tool works via `LangChainTool` wrapper.

---

## Architecture

```
Crew
├── Agents: [researcher, writer, editor]  ← role/goal/backstory/tools
├── Tasks: [research_task, write_task, edit_task]  ← description/expected_output/agent
├── Process: sequential | hierarchical | parallel
├── Memory: short_term + long_term + entity
└── run() → executes tasks in process order, agents collaborate

Task execution (sequential):
    task_1 → agent_1.execute(task_1.description) → output_1
    task_2 → agent_2.execute(task_2.description + context=output_1) → output_2
    task_3 → agent_3.execute(task_3.description + context=output_2) → final_output
```

Hierarchical process:
```
Manager LLM
├── receives overall goal
├── decides which agent gets which task (may reorder)
├── monitors task completion
└── synthesizes final output from agent results
```

---

## Strengths

- **Low friction for pipelines**: defining agents + tasks is fast and readable; a 3-agent crew can be set up in ~30 lines
- **Memory out-of-the-box**: short-term, long-term, and entity memory without custom implementation
- **Delegation is natural**: `allow_delegation=True` enables organic task subdivision without explicit routing logic
- **Task output chaining**: sequential output → context injection is automatic; no manual state threading
- **LangChain tools compatibility**: the entire LangChain tools ecosystem is available
- **Human-in-the-loop**: `human_input=True` on any task for approval checkpoints
- **Async task execution**: parallel process for independent tasks

---

## Weaknesses

- **Backstory is prompt engineering, not magic**: agent identity fields are just injected text; poorly written backstories produce generic behavior
- **Hierarchical process is brittle**: the manager LLM can make poor delegation decisions, loop, or miss tasks
- **Limited control flow**: no conditional edges, no cycles within the task graph; LangGraph is far more expressive
- **Memory adds cost**: short-term RAG creates embedding calls for every task; adds latency and cost
- **Python-only**: no TypeScript SDK
- **LangChain coupling**: inherits LangChain's abstraction overhead for tools
- **Jay has zero experience**: no validated patterns from Jay's stack

---

## Minimal Working Example

```python
import os
from crewai import Agent, Task, Crew, Process
from crewai_tools import SerperDevTool

os.environ["ANTHROPIC_API_KEY"] = os.getenv("ANTHROPIC_API_KEY")
os.environ["SERPER_API_KEY"] = os.getenv("SERPER_API_KEY")

search_tool = SerperDevTool()

# Define agents
researcher = Agent(
    role="Research Specialist",
    goal="Find accurate, recent information on {topic}",
    backstory="Expert researcher with 10 years in tech journalism. Prioritizes primary sources.",
    tools=[search_tool],
    llm="claude-sonnet-4-6",
    verbose=True
)

writer = Agent(
    role="Technical Writer",
    goal="Produce clear, well-structured articles from research",
    backstory="Former software engineer turned writer. Bridges technical accuracy and readability.",
    llm="claude-sonnet-4-6",
    verbose=True
)

# Define tasks
research_task = Task(
    description="Research the latest developments in {topic}. Find 5 key points with sources.",
    expected_output="5 bullet points with citations, each 2-3 sentences",
    agent=researcher
)

write_task = Task(
    description="Write a 500-word technical blog post based on the research provided.",
    expected_output="A complete blog post with intro, 3 sections, and conclusion in markdown",
    agent=writer,
    context=[research_task]     # explicit context dependency
)

# Create and run crew
crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, write_task],
    process=Process.sequential,
    verbose=True
)

result = crew.kickoff(inputs={"topic": "agentic AI patterns 2026"})
print(result.raw)
```

---

## CrewAI vs LangGraph vs AutoGen

| Dimension | CrewAI | LangGraph | AutoGen |
|-----------|--------|-----------|---------|
| Metaphor | Role-based crew | State machine | Conversation |
| Setup speed | Fast | Medium | Medium |
| Control flow | Sequential/hierarchical | Full graph | Turn-based |
| Memory | Multi-layer built-in | Custom / external | Not built-in |
| Code execution | Via tools | Via tools | First-class |
| Debugging | Verbose logs | LangSmith | Conversation log |
| Best for | Defined pipelines | Complex conditional flows | Code generation |
| TypeScript | No | Limited | No |

---

## Integration Points

- **[[frameworks/framework-claude-api]]**: CrewAI supports Anthropic models via LiteLLM integration (`llm="claude-sonnet-4-6"`)
- **[[entities/langchain-ecosystem]]**: CrewAI tools are LangChain-compatible; uses LangChain's tool interface
- **[[evaluations/eval-orchestration-frameworks]]**: CrewAI scored against GSD, LangGraph, AutoGen
- **[[entities/model-landscape]]**: Supports any model via LiteLLM

---

## Jay's Experience

None. Jay has not used CrewAI. Assessment based on documentation and public demos. Key reason for non-adoption: CrewAI's role/backstory metaphor doesn't align with Jay's Claude Code + GSD workflow; GSD provides equivalent structured role-based execution with agents that understand his specific project context. Would evaluate if hiring collaborators who prefer the "crew" mental model as a low-code starting point.

---

## Version Notes

- 0.80.x (2025): memory system stable; parallel process improved; output_file for tasks
- Switched from direct OpenAI SDK to LiteLLM for provider abstraction
- CrewAI Enterprise: hosted version with monitoring; separate product
- `pip install crewai crewai-tools` — tools are a separate package

---

## Sources

- CrewAI GitHub and documentation (knowledge cutoff — verify current API)
- [[evaluations/eval-orchestration-frameworks]]
- [[entities/langchain-ecosystem]]
