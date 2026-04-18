---
id: 01KNNVX2QQXKCFPFK3EPSF3880
title: Model Landscape
type: entity
category: ecosystem
tags: [models, llm, claude, gpt, gemini, llama, mistral, qwen, comparison]
created: 2026-04-04
updated: 2026-04-04
---

## Overview

The LLM model landscape as of April 2026. Frontier models change rapidly — treat cost/context figures as approximate and verify against current provider pricing. This page covers the models relevant to Jay's stack and agentic AI work.

---

## Frontier Model Comparison Table (April 2026)

| Model | Vendor | Context | Cost Tier | Extended Reasoning | Best For |
|-------|--------|---------|-----------|-------------------|---------|
| `claude-opus-4-6` | [[anthropic]] | 200K | High | Extended thinking (explicit) | Architecture, security audits, complex reasoning |
| `claude-sonnet-4-6` | [[anthropic]] | 200K | Medium | No | Production default, orchestration, balanced |
| `claude-haiku-4-5-20251001` | [[anthropic]] | 200K | Low | No | Leaf tasks, classification, boilerplate |
| `gpt-4o` | [[openai]] | 128K | Medium-high | No | Multimodal, vision, broad ecosystem |
| `o4` | [[openai]] | 128K | Very High | Yes (o-series) | Math, programming competition, hard reasoning |
| `o4-mini` | [[openai]] | 128K | Medium | Yes (o-series) | Fast reasoning, code, cost-effective reasoning |
| `o3` | [[openai]] | 128K | High | Yes (o-series) | Complex reasoning, previous gen |
| `gemini-2.5-pro` | Google | 1M+ | Medium-high | Yes (thinking) | Long context, multimodal, Google ecosystem |
| `gemini-2.0-flash` | Google | 1M | Low | Limited | Fast, cheap, long context |
| `llama-3.3-70b` | Meta (open) | 128K | Self-hosted | No | Self-hosted, fine-tunable, cost control |
| `mistral-large-2` | Mistral | 128K | Medium | No | European data residency, open weights |
| `qwen-2.5-72b` | Alibaba (open) | 128K | Self-hosted | No | Multilingual, Chinese, self-hosted |
| `deepseek-r1` | DeepSeek (open) | 128K | Self-hosted | Yes (reasoning) | Cost-effective reasoning, open weights |

---

## [[anthropic]] Models (Jay's Primary)

### claude-opus-4-6
**Use for**: Complex architecture decisions, security audits, extended thinking tasks, code that must be correct on first pass, analysis requiring deep reasoning chains.
**Extended thinking**: Enable with `thinking: { type: "enabled", budget_tokens: 8000 }`. Model emits visible reasoning before response. Best ROI: 4,000-8,000 tokens. Cap at 10,000 — diminishing returns.
**Cost**: ~3x Sonnet; reserve for tasks where quality-per-call matters more than throughput.

### claude-sonnet-4-6
**Use for**: Default model for almost everything. Orchestration agents, feature implementation, PR review, documentation, multi-step agentic tasks.
**Jay's default**: Set in `settings.json` — `"model": "opusplan"` (possibly a plan/tier alias; effective model for most tasks is Sonnet-class).
**Sweet spot**: Tasks requiring reasoning and tool use at production scale.

### claude-haiku-4-5-20251001
**Use for**: Leaf nodes in agent pipelines, file analysis, grep-equivalent tasks, classification, simple Q&A, boilerplate generation.
**Key property**: 200K context at lowest cost — ideal for processing large documents where you need breadth, not depth.
**Jay's rule**: Sub-agents doing grep/read/summarize tasks should use Haiku; orchestrators use Sonnet.

---

## [[openai]] Models

### gpt-4o
[[openai]]'s current production model. Key advantages over Claude:
- **Native audio I/O** (Realtime API) — Claude has no voice-to-voice equivalent
- **Image generation** (DALL-E integration) — Claude cannot generate images
- **Vision** (competitive with Claude Sonnet on most image tasks)
- **Broader third-party tool ecosystem** — more integrations built for GPT-4o by default

Key disadvantage: 128K context vs. Claude's 200K. At 128K you lose the ability to fit large codebases or long research sessions in a single context.

### o3 / o4 Series
[[openai]]'s "reasoning model" family. Separate from GPT-4o — these are slower, more expensive models that explicitly show chain-of-thought reasoning. The model spends additional compute on reasoning before returning a final answer.

**o4**: best performance on hard problems; competition-level math and code; very slow.
**o4-mini**: balances reasoning quality with cost and speed; recommended for most "reasoning model" use cases.
**o3**: previous generation; still competitive; cost may be lower.

**When to prefer over Claude extended thinking**: o-series models are often better at very competitive math/algorithms; Claude's extended thinking is better integrated into tool-use workflows and long-context tasks.

---

## Google Models

### gemini-2.5-pro
**Standout feature**: 1M+ token context window — far exceeds any other frontier model. Can process entire codebases, hours of video, thousands of documents in one call.
**Extended thinking**: Gemini 2.5 Pro has a "thinking" mode similar to Claude's extended thinking and o-series.
**Best for**: Entire-codebase analysis, long-document synthesis, multimodal inputs (video, audio, images, text together).
**Weakness**: Google ecosystem lock-in; latency at long context; cost at 1M tokens is non-trivial.

### gemini-2.0-flash
Fast and cheap with long context. Good for: high-throughput pipelines where 128K isn't enough but full reasoning quality isn't required.

---

## Open Source / Self-Hosted Models

### llama-3.3-70b (Meta)
State-of-the-art open model as of early 2026. Fine-tunable on custom data. Run via: Ollama (local), vLLM (production server), Together AI, Groq (fast inference). Key use case: tasks requiring data privacy (can't send to [[anthropic]]/[[openai]] APIs), fine-tuned domain experts, cost control at scale.

### mistral-large-2 (Mistral AI)
Strong European model with open weights. Key advantage: EU data residency compliance. Competitive with GPT-4o on most benchmarks. Mistral is known for efficient inference.

### qwen-2.5-72b (Alibaba)
Strong multilingual model especially for Chinese. Open weights. Good for: multilingual agentic systems, Asian market applications, cost-controlled self-hosted deployments.

### deepseek-r1 (DeepSeek)
Open-weights reasoning model — competitive with o3/o4 on math and coding benchmarks at a fraction of the cost when self-hosted. The model shows visible chain-of-thought reasoning. Significant for the agentic community: first open reasoning model with frontier-level performance.

---

## Model Selection Decision Tree

```
Task type?
├─ Real-time voice/audio → gpt-4o (Realtime API)
├─ Image generation → gpt-4o / DALL-E
├─ Self-hosted required → llama-3.3-70b or mistral-large-2
├─ Entire codebase in one call → gemini-2.5-pro (1M context)
└─ Text/code/agentic (Jay's default):
    ├─ Complex architecture / security / extended thinking → claude-opus-4-6
    ├─ Orchestration / production feature → claude-sonnet-4-6
    ├─ Leaf task / classification / cheap breadth → claude-haiku-4-5-20251001
    └─ Hard math / competition code → o4-mini

Cost pressure?
├─ High volume → haiku or gemini-flash or self-hosted
└─ Low volume → use best model; quality > cost
```

---

## Context Window Implications for Agentic Work

| Context Size | What Fits | Agentic Implication |
|-------------|-----------|---------------------|
| 128K | ~100K words; medium codebase | Some repos require chunking |
| 200K | ~160K words; most codebases | Fit entire context without chunking |
| 1M | ~800K words; entire monorepo | No chunking needed for almost anything |

For [[multi-agent-systems]]: sub-agents each get their own full context window. The orchestrator's window fills with sub-agent results. With 200K windows, orchestrators can receive results from 4-6 detailed sub-agents before hitting limits.

---

## Pricing Principles (Verify Current Pricing)

- Pricing is per million tokens (input + output separately)
- Prompt caching can reduce effective cost by 80-90% on repeated system prompts
- Batch API ([[anthropic]]): 50% reduction for async workloads
- Output tokens cost 3-5x more than input tokens across all providers
- Extended thinking / reasoning burns additional "thinking" tokens at input token price

---

## Integration Points

- **[[entities/anthropic]]**: Claude model family details
- **[[entities/openai]]**: GPT model family details
- **[[frameworks/framework-claude-api]]**: How Jay accesses Claude models
- **[[frameworks/framework-langgraph]]**: Model-agnostic; supports any LangChain provider
- **[[frameworks/framework-autogen]]**: Model-agnostic via LiteLLM
- **[[evaluations/eval-orchestration-frameworks]]**: Framework comparison that factors in model compatibility
