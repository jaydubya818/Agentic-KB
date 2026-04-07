---
title: OpenAI
type: entity
category: company
tags: [openai, gpt, gpt-4o, o3, o4, assistants-api, function-calling, dall-e, whisper]
created: 2026-04-04
updated: 2026-04-04
---

## Overview

OpenAI is the company behind the GPT model family, ChatGPT, the OpenAI API, and DALL-E. Founded in 2015 as a non-profit by Sam Altman, Elon Musk, Greg Brockman, and others (including Dario and Daniela Amodei, who left to found Anthropic). Converted to "capped-profit" structure in 2019. OpenAI is the default reference point for LLM capability — when researchers compare models, GPT-4 or its successor is usually the benchmark.

OpenAI is not Jay's primary vendor (Jay is Anthropic-first), but it is the dominant ecosystem in terms of third-party tooling, and its function calling format and Assistants API are widely referenced in the agentic AI community.

---

## Models (April 2026)

### GPT-4o
OpenAI's production workhorse. Multimodal (text + vision + audio). Strong at:
- Complex reasoning with tool use
- Code generation and review
- Image understanding
- Long document analysis (128K context)

Key differentiator vs Claude: native multimodal audio (real-time voice with Realtime API), broader third-party ecosystem integration.

### o3 / o4 — Reasoning Models
OpenAI's chain-of-thought reasoning model series. Distinct architecture: the model spends more compute thinking before responding (similar concept to Claude's extended thinking, but implemented as a separate model series rather than a mode).

| Model | Best For | Speed | Cost |
|-------|----------|-------|------|
| `o4-mini` | Fast reasoning, code, math | Fast | Medium |
| `o4` | Complex multi-step reasoning | Slow | High |
| `o3` | Previous generation; still competitive | Medium | High |

o4 and o3 excel at: math problems, competitive programming, scientific reasoning, and tasks where accuracy on a single difficult question outweighs speed. They are poor choices for: high-throughput pipelines, simple tasks, anything requiring real-time output.

### GPT-4o-mini
Lightweight GPT-4o variant. Analogous to Claude Haiku — fast, cheap, good for classification and simple tasks.

---

## Function Calling Format

OpenAI's tool use format is widely referenced because it was the first widely-adopted standard. Claude and most other LLM APIs now use similar patterns. Key fields:

```json
{
  "tools": [{
    "type": "function",
    "function": {
      "name": "get_weather",
      "description": "Get current weather for a location",
      "parameters": {
        "type": "object",
        "properties": {
          "location": {"type": "string"},
          "units": {"type": "string", "enum": ["celsius", "fahrenheit"]}
        },
        "required": ["location"]
      }
    }
  }],
  "tool_choice": "auto"
}
```

Response: model returns `tool_calls` in the assistant message, each with `id`, `type: "function"`, and `function: { name, arguments (JSON string) }`.

Difference from Claude: OpenAI uses `parameters` (OpenAPI-style), Claude uses `input_schema` (JSON Schema); OpenAI wraps in `type: "function"`, Claude is flat. Content is functionally equivalent.

---

## Assistants API

The Assistants API is OpenAI's managed agent runtime — analogous to what Claude Code provides but as an API rather than a CLI. Core primitives:

**Thread**: A persistent conversation with a unique ID. Store messages, tool results, and files. Threads persist server-side indefinitely.

**Run**: An execution of an assistant on a thread. The assistant processes all thread messages and may call tools.

**tool_calls**: When a Run requires tool execution, its status becomes `requires_action` with `tool_calls` to execute. Your code executes them and submits results via `submit_tool_outputs`.

```python
# Create thread
thread = client.beta.threads.create()

# Add message
client.beta.threads.messages.create(thread_id=thread.id, role="user", content="Hello")

# Create run
run = client.beta.threads.runs.create_and_poll(
    thread_id=thread.id,
    assistant_id=assistant.id
)

# Handle tool calls
if run.status == "requires_action":
    tool_calls = run.required_action.submit_tool_outputs.tool_calls
    # execute tools...
    client.beta.threads.runs.submit_tool_outputs(
        thread_id=thread.id,
        run_id=run.id,
        tool_outputs=[{"tool_call_id": tc.id, "output": result} for tc, result in zip(tool_calls, results)]
    )
```

**Vs. Claude Code / raw API**: Assistants API manages thread persistence server-side (no need to maintain message history locally) but at the cost of control — you can't directly inspect or modify the thread's internal state. Useful for simple persistent chat agents; limiting for complex multi-agent orchestration.

---

## DALL-E
Text-to-image generation API. DALL-E 3 is the current version. OpenAI's primary advantage in image generation — Anthropic has no competing image generation model. Used for: design mockups, content creation, visual prototyping.

## Whisper
Open-source speech recognition model from OpenAI. Available as an API (`audio/transcriptions`, `audio/translations`). State-of-the-art accuracy across many languages. Used in: meeting transcription (e.g., integrated with Fireflies), voice agent input processing. Free/cheap to run locally via the open-source model.

## Realtime API
OpenAI's streaming audio input + output API — enables real-time voice conversations with the model (speech-to-speech, not speech-to-text-to-speech). WebSocket-based. Powers real-time voice agents. Claude has no direct equivalent API endpoint (Claude Code can process audio files, but not streaming voice). Key for: voice assistants, real-time interview coaching, live interpretation.

---

## Fine-Tuning API
OpenAI allows fine-tuning of GPT-4o-mini and GPT-3.5-turbo on custom datasets. Anthropic currently does not offer public fine-tuning (custom fine-tuning is enterprise/partner only). Fine-tuning on OpenAI enables:
- Style and format consistency
- Domain-specific knowledge injection
- Reduced prompting overhead for specialized tasks

Note: fine-tuning rarely outperforms good prompting for knowledge tasks; excels at format/style consistency.

---

## Key Differentiators vs Anthropic

| Dimension | OpenAI | Anthropic |
|-----------|--------|-----------|
| Ecosystem size | Dominant (most integrations) | Growing rapidly |
| Multimodal | Audio (Realtime API), vision, image gen | Vision; no audio/image gen |
| Reasoning model | o3/o4 (separate model series) | Extended thinking (Opus, inline mode) |
| Agent runtime | Assistants API (server-managed) | Claude Code (CLI, user-run) |
| Tool protocol | Function calling (proprietary) | MCP (open standard) |
| Fine-tuning | Public API for GPT-4o-mini | Enterprise only |
| Safety approach | Varies (board history) | Constitutional AI, RSP |
| Context window | 128K (GPT-4o), growing | 200K all tiers |
| Coding assistant | Codex in IDEs, no CLI | Claude Code (full CLI agent) |

For Jay's stack specifically: Claude Code's superiority as a development environment and Anthropic's larger context windows are the primary reasons for being Anthropic-first. OpenAI is used when needed for multimodal audio (Realtime API), image generation (DALL-E), or when a client/tool mandates GPT.

---

## Integration Points

- **[[entities/anthropic]]**: primary competitor; model comparison
- **[[entities/model-landscape]]**: full model comparison table
- **[[frameworks/framework-langgraph]]**: LangGraph uses `ChatOpenAI` or `ChatAnthropic` interchangeably
- **[[frameworks/framework-autogen]]**: AutoGen supports both providers via LiteLLM
- **[[frameworks/framework-crewai]]**: CrewAI supports both via LiteLLM

---

## Sources

- OpenAI API documentation (knowledge cutoff — verify current)
- [[entities/anthropic]] (competitor comparison)
- [[entities/model-landscape]]
