---
id: 01KNNVX2QS8YW3M9H0WWX0PQV5
title: AutoGen
type: framework
vendor: Microsoft Research
version: "0.4.x (AutoGen 2025)"
language: python
license: open-source
github: "https://github.com/microsoft/autogen"
tags: [autogen, multi-agent, conversational, microsoft, orchestration, python]
last_checked: 2026-04-04
jay_experience: none
---

## Overview

[[framework-autogen]] is Microsoft Research's multi-agent framework built around a conversational paradigm — agents coordinate by talking to each other in structured conversations, rather than through a graph or explicit orchestration layer. The fundamental primitive is the agent-to-agent conversation: you define agents with roles and capabilities, and [[framework-autogen]] manages the message passing, termination conditions, and tool execution between them.

[[framework-autogen]] underwent a major architectural revision in 0.4.x (renamed the core runtime, introduced async-first design). The 0.2.x API is widely documented in tutorials but is legacy. This page covers the current 0.4.x design.

---

## Core Concepts

### Agent Types

**AssistantAgent**: wraps an LLM; receives messages, generates responses, can call tools. The primary "thinking" agent.

**UserProxyAgent**: represents a human or code executor; can execute Python/shell code blocks extracted from messages, provide human input, or automatically reply. The bridge between LLM output and real execution.

**ConversableAgent**: base class; all agents inherit from this. Any agent can both send and receive messages.

### Conversation Patterns

**Two-agent chat** (simplest):
```
UserProxy ↔ Assistant
```
UserProxy sends task, Assistant responds (possibly calling tools or writing code), UserProxy executes code if any, loop continues until termination condition.

**GroupChat** (multi-agent):
Multiple agents in a shared conversation. A `GroupChatManager` (also an LLM agent) decides who speaks next. Agents see each other's messages. Risk: verbose, token-expensive, and the manager can make poor routing decisions.

**RoundRobin**: agents take turns in fixed order. Predictable, deterministic, good for pipelines.

**Swarm**: peer-to-peer handoffs without a central manager. Agent A decides to hand off to Agent B by calling a handoff tool. Most flexible, least predictable.

### Code Execution Agents
[[framework-autogen]]'s killer feature (2023-2024): the UserProxyAgent can automatically extract Python code blocks from assistant messages and execute them in a sandboxed environment. This enables:
- Self-correcting code generation (run → error → fix → run)
- Data analysis pipelines
- Test-driven code generation

The code executor is pluggable: local subprocess, Docker container, or Jupyter kernel.

### Human Proxy Pattern
`human_input_mode` on UserProxyAgent controls human involvement:
- `NEVER`: fully automated, no human in loop
- `TERMINATE`: human reviews before conversation ends
- `ALWAYS`: human reviews every message

This is [[framework-autogen]]'s built-in human-in-the-loop mechanism — cleaner than [[framework-langgraph]]'s interrupt model for conversational use cases, but less flexible for graph-based flows.

### [[framework-autogen]] Studio
Low-code browser-based UI for building and testing [[framework-autogen]] agent systems. Define agents, connect them in conversations, test with inputs. Good for prototyping and non-technical collaborators. Not production-ready for complex systems.

---

## Architecture

```
GroupChat or two-agent conversation:
    ├── Agents: List[ConversableAgent]
    ├── GroupChatManager (LLM): picks next speaker
    └── Message passing: structured dict with role, content, name

Execution flow:
    initiator.initiate_chat(recipient, message="initial task")
    → recipient generates response
    → if response contains code: executor runs it
    → result appended to conversation
    → next speaker selected (manager or round-robin)
    → loop until max_turns or termination_msg detected
```

[[framework-autogen]] 0.4.x introduced a runtime layer:
- **SingleThreadedAgentRuntime**: sequential message processing
- **DistributedAgentRuntime**: agents run as separate processes, communicate via message broker
- Message types are strongly typed (Pydantic models)
- Subscriptions: agents subscribe to message types, not to specific senders

---

## Strengths

- **Code execution is first-class**: the UserProxy+code executor combo is uniquely powerful for data science and coding tasks; no equivalent in [[framework-langgraph]] or [[framework-crewai]]
- **Conversational flexibility**: when the task genuinely benefits from agents debating a solution, [[framework-autogen]]'s group chat captures this naturally
- **Human-in-the-loop simplicity**: `human_input_mode` is one parameter; easier to configure than [[framework-langgraph]] interrupts
- **[[framework-autogen]] Studio**: lowers barrier for non-engineers to prototype agent systems
- **Distributed runtime**: 0.4.x supports genuine multi-process agent systems
- **Microsoft backing**: strong research team, active development, enterprise interest

---

## Weaknesses

- **Conversation verbosity**: multi-agent group chats burn tokens fast; every message is visible to all agents
- **GroupChatManager flakiness**: the LLM-based speaker selection is non-deterministic; conversations can go off-rails
- **No built-in graph control flow**: loops, conditionals, and complex routing are harder to express than in [[framework-langgraph]]
- **Debugging is hard**: conversations are text — hard to trace which agent caused which behavior
- **Python-only**: no TypeScript SDK
- **0.2 → 0.4 breaking changes**: most tutorials and blog posts describe the old API; documentation lag is a real problem
- **Jay has zero experience**: no validated patterns from Jay's stack

---

## Minimal Working Example

```python
from autogen import AssistantAgent, UserProxyAgent

# Both agents use the same LLM config
llm_config = {
    "config_list": [{"model": "claude-sonnet-4-6", "api_type": "anthropic"}]
}

assistant = AssistantAgent(
    name="assistant",
    system_message="You are a helpful coding assistant. Write Python code to solve tasks.",
    llm_config=llm_config
)

user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER",          # fully automated
    max_consecutive_auto_reply=10,     # termination guard
    code_execution_config={
        "work_dir": "/tmp/autogen",
        "use_docker": False             # use Docker in production
    },
    is_termination_msg=lambda msg: "TERMINATE" in msg.get("content", "")
)

# Initiate conversation
user_proxy.initiate_chat(
    assistant,
    message="Write a Python script that fetches the current Bitcoin price and prints it."
)
```

### GroupChat Example

```python
from autogen import GroupChat, GroupChatManager

researcher = AssistantAgent("researcher", system_message="You research topics thoroughly.", llm_config=llm_config)
writer = AssistantAgent("writer", system_message="You write clear, concise reports.", llm_config=llm_config)
critic = AssistantAgent("critic", system_message="You critique work and suggest improvements.", llm_config=llm_config)
proxy = UserProxyAgent("user", human_input_mode="NEVER", code_execution_config=False)

group_chat = GroupChat(
    agents=[proxy, researcher, writer, critic],
    messages=[],
    max_round=12,
    speaker_selection_method="auto"  # LLM-based selection
)
manager = GroupChatManager(groupchat=group_chat, llm_config=llm_config)

proxy.initiate_chat(manager, message="Write a report on the fan-out agent pattern.")
```

---

## [[framework-autogen]] vs [[framework-langgraph]]

| Dimension | [[framework-autogen]] | [[framework-langgraph]] |
|-----------|---------|-----------|
| Primary metaphor | Conversation | State machine |
| Code execution | First-class built-in | Manual tool setup |
| Control flow | Conversation turns | Graph edges |
| Checkpointing | Not built-in | First-class |
| Human-in-loop | `human_input_mode` param | Interrupt nodes |
| Observability | [[framework-autogen]] logging | LangSmith |
| Best for | Self-correcting code, debates | Complex conditional flows |
| TypeScript | No | Limited |

---

## Integration Points

- **[[frameworks/framework-claude-api]]**: [[framework-autogen]] supports [[anthropic]] as an LLM provider (Claude as the model backing AssistantAgents)
- **[[entities/langchain-ecosystem]]**: [[framework-autogen]] is a separate ecosystem from LangChain; not compatible without wrappers
- **[[evaluations/eval-orchestration-frameworks]]**: [[framework-autogen]] scored against GSD, [[framework-langgraph]], [[framework-crewai]]
- **[[entities/model-landscape]]**: [[framework-autogen]] is model-agnostic; supports [[openai]], [[anthropic]], local models

---

## Jay's Experience

None. Jay has not used [[framework-autogen]] in production. Assessment is based on documentation and public research. Key reason for non-adoption: Jay's stack is TypeScript-native and [[framework-claude-code]]-first; [[framework-autogen]] is Python-only and conversational in a way that doesn't map to the GSD/[[framework-superpowers]] workflow. Would evaluate if needing a Python-native self-correcting code execution loop.

---

## Version Notes

- 0.2.x: legacy API, still widely documented; `ConversableAgent`, `UserProxyAgent`, `GroupChat` all exist
- 0.4.x: major rewrite; typed message passing, distributed runtime, async-first; breaking changes from 0.2
- [[framework-autogen]] Studio: separate install (`pip install autogenstudio`)
- `pyautogen` is the pip package name

---

## Sources

- Microsoft [[framework-autogen]] GitHub repository (knowledge cutoff — verify current API)
- [[evaluations/eval-orchestration-frameworks]]
- [[entities/model-landscape]]
