---
title: LangGraph
type: framework
vendor: LangChain Inc.
version: "0.2.x (2025)"
language: python
license: open-source
github: "https://github.com/langchain-ai/langgraph"
tags: [langgraph, orchestration, multi-agent, state-machine, graph, python, langchain]
last_checked: 2026-04-04
jay_experience: limited
---

## Overview

LangGraph is a graph-based agent orchestration framework built on top of LangChain. Where LangChain gives you chains and LCEL (LangChain Expression Language) for sequential pipelines, LangGraph gives you state machines — directed graphs where nodes are functions/agents and edges define control flow. This distinction matters: LangGraph can handle cycles, conditional branching, human-in-the-loop interrupts, and multi-agent coordination that flat chains cannot express.

LangGraph is the most practically useful component of the LangChain ecosystem for multi-agent work. The broader LangChain abstraction layer has been criticized as over-engineered, but LangGraph itself has a cleaner API and a sound architectural model.

---

## Core Concepts

### Nodes
Nodes are the units of computation in a graph — Python functions or LangChain runnables that take the current state and return a state update:

```python
def research_node(state: AgentState) -> dict:
    # Takes state, returns partial state update
    result = llm.invoke(state["messages"])
    return {"messages": [result], "research_complete": True}
```

### Edges
Edges define control flow between nodes. Three types:
- **Direct edges**: always go from A to B
- **Conditional edges**: function decides the next node based on current state
- **Entry/exit points**: `START` and `END` built-in nodes

```python
graph.add_edge("research", "analyze")          # direct
graph.add_conditional_edges("analyze", router) # conditional
```

### State
The graph passes a single mutable state object between all nodes. State is typed (TypedDict or Pydantic), and each node returns a partial update — LangGraph merges updates using reducers (default: last-write-wins; can use `Annotated[list, operator.add]` for append semantics).

```python
from typing import TypedDict, Annotated
from operator import add

class AgentState(TypedDict):
    messages: Annotated[list, add]  # append-mode — nodes add to list
    current_task: str
    completed_tasks: Annotated[list, add]
    error: str | None
```

### Persistence — Checkpointing
LangGraph supports checkpointing: saving graph state after every node execution. This enables:
- **Resume from failure**: re-run from last checkpoint, not from the beginning
- **Human-in-the-loop**: pause at a node, get human approval, resume
- **Audit trail**: full execution history

Built-in checkpointers: `MemorySaver` (in-memory), `SqliteSaver`, `PostgresSaver`. Production deployments use Postgres.

```python
from langgraph.checkpoint.memory import MemorySaver

checkpointer = MemorySaver()
app = graph.compile(checkpointer=checkpointer)

# Run with a thread_id for session continuity
result = app.invoke(initial_state, config={"configurable": {"thread_id": "session-42"}})
```

---

## Architecture

```
Graph definition (StateGraph):
    ├── add_node("name", function)
    ├── add_edge("from", "to")
    ├── add_conditional_edges("from", router_fn, {"option": "target"})
    └── set_entry_point("first_node")

Compiled graph (CompiledGraph):
    ├── invoke(state) — synchronous, blocking
    ├── ainvoke(state) — async
    ├── stream(state) — yield node outputs as they complete
    └── astream_events(state) — fine-grained streaming (token-level)

State flow:
    START → node_1 → [conditional] → node_2a | node_2b → END
                          ↑                              |
                          └──────── cycle back ──────────┘
```

### Multi-Agent Patterns

**Supervisor pattern**: one node hosts the supervisor LLM which decides which worker to call next. Workers are nodes; supervisor controls edges.

```python
def supervisor(state):
    # LLM picks next agent
    response = supervisor_llm.invoke(state["messages"])
    return {"next": response.next_agent}

graph.add_conditional_edges("supervisor", lambda s: s["next"], {
    "researcher": "researcher_agent",
    "writer": "writer_agent",
    "FINISH": END
})
```

**Swarm pattern**: agents can hand off to each other directly, creating peer-to-peer routing without a central supervisor. Each agent decides who should handle next.

**Hierarchical graphs**: nodes can themselves be compiled subgraphs. Useful for complex orchestration with logical subsystems.

---

## Strengths

- **Expressive control flow**: cycles, conditionals, and hierarchies that are impossible in linear chains
- **Checkpointing is first-class**: the only orchestration framework with built-in resumable state out of the box
- **Streaming at every level**: stream node-level events, token-level output, or fine-grained SSE events
- **Human-in-the-loop**: built-in interrupt mechanism at any node; resume after approval
- **LangSmith integration**: automatic tracing when `LANGCHAIN_TRACING_V2=true` — every node, every LLM call, every tool use tracked
- **TypeScript support**: `@langchain/langgraph` exists but Python is primary
- **Strong community**: most production Python multi-agent systems in 2025 use LangGraph

---

## Weaknesses

- **Python-first**: TypeScript version lags behind; Jay's stack is TypeScript-heavy
- **LangChain dependency**: inherits LangChain abstraction overhead; simple tasks require more boilerplate than raw SDK usage
- **State type complexity**: TypedDict + reducer annotations get verbose for complex state; Pydantic models help but add more boilerplate
- **Debugging requires LangSmith**: without LangSmith, tracing a multi-node execution is painful — stdout logs are insufficient
- **Overhead for simple pipelines**: a two-step pipeline in LangGraph is 3x more code than the same thing with direct API calls
- **Not Jay's primary tool**: Jay builds in TypeScript and uses Claude Code as his runtime; LangGraph is Python-first and Claude Code-agnostic

---

## Minimal Working Example

```python
from typing import TypedDict, Annotated
from operator import add
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.graph import StateGraph, START, END

llm = ChatAnthropic(model="claude-sonnet-4-6")

class State(TypedDict):
    messages: Annotated[list, add]
    research_done: bool

def researcher(state: State) -> dict:
    response = llm.invoke([
        *state["messages"],
        HumanMessage(content="Research this topic and summarize key points.")
    ])
    return {"messages": [response], "research_done": True}

def writer(state: State) -> dict:
    response = llm.invoke([
        *state["messages"],
        HumanMessage(content="Write a polished article based on the research above.")
    ])
    return {"messages": [response]}

def route_after_research(state: State) -> str:
    return "writer" if state["research_done"] else END

# Build graph
graph = StateGraph(State)
graph.add_node("researcher", researcher)
graph.add_node("writer", writer)
graph.add_edge(START, "researcher")
graph.add_conditional_edges("researcher", route_after_research, {
    "writer": "writer",
    END: END
})
graph.add_edge("writer", END)

app = graph.compile()

# Run
result = app.invoke({
    "messages": [HumanMessage(content="Explain the fan-out agent pattern")],
    "research_done": False
})
print(result["messages"][-1].content)
```

---

## LangGraph vs Pure Python Orchestration

| Dimension | LangGraph | Raw Python + SDK |
|-----------|-----------|-----------------|
| State management | Built-in TypedDict + reducers | Manual dict passing |
| Checkpointing | First-class, pluggable | DIY |
| Parallelism | Explicit parallel nodes (Send API) | asyncio/threading |
| Debugging | LangSmith traces | Print statements |
| Boilerplate | Medium-high | Low |
| Flexibility | High (any callable as node) | Unlimited |
| Learning curve | 1-2 days | Immediate |

For small graphs (<5 nodes, no cycles), raw Python is simpler. For production multi-agent systems with resume, audit, and human-in-the-loop requirements, LangGraph earns its keep.

---

## Integration Points

- **[[entities/langchain-ecosystem]]**: LangGraph is the graph layer of the LangChain ecosystem; LangSmith provides observability
- **[[frameworks/framework-claude-api]]**: LangGraph uses `ChatAnthropic` which wraps the Anthropic SDK
- **[[entities/model-landscape]]**: Any LLM with a LangChain provider can be swapped in
- **[[evaluations/eval-orchestration-frameworks]]**: LangGraph scored against GSD, AutoGen, CrewAI
- LangSmith: `pip install langsmith`; set `LANGCHAIN_API_KEY` and `LANGCHAIN_TRACING_V2=true`

---

## Jay's Experience

Limited. Jay evaluated LangGraph for Python-side orchestration but his primary stack is TypeScript + Claude Code. Key observations:
- The checkpointing story is genuinely best-in-class — nothing else gives you resumable state this cleanly out of the box
- LangSmith integration is powerful but requires buying into the LangChain telemetry ecosystem
- For TypeScript/Claude Code native work, GSD + Claude Code's Agent tool provides equivalent orchestration without the Python dependency

Would revisit if building a complex Python-native agent system requiring: resumable long-running tasks, human-in-the-loop approval flows, or production audit trails with LangSmith.

---

## Version Notes

- 0.1.x: initial release; supervisor pattern established
- 0.2.x: Send API for parallel node execution; subgraph support improved
- TypeScript `@langchain/langgraph` generally lags Python by 1-2 minor versions
- LangGraph Platform (cloud-hosted): managed deployment, persistence, monitoring — separate product

---

## Sources

- [[entities/langchain-ecosystem]]
- [[evaluations/eval-orchestration-frameworks]]
- LangGraph documentation (knowledge cutoff — verify current API)
