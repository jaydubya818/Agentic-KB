---
title: Andrej Karpathy
type: entity
category: person
tags: [karpathy, education, llm-wiki, nanoGPT, tesla, openai, eureka-labs]
created: 2026-04-04
updated: 2026-04-04
---

## Overview

Andrej Karpathy is one of the most influential AI educators and researchers in the field. His primary contribution to Jay's knowledge base is the **LLM wiki pattern** — a personal, growing, plain-text knowledge base maintained by and for LLMs. This KB (Agentic-KB) directly derives its architecture from Karpathy's approach. Beyond the wiki pattern, Karpathy's educational content (nanoGPT, micrograd, YouTube lectures) is widely regarded as the clearest technical explanation of LLM internals available.

---

## Background

- **PhD**: Stanford, computer vision (Fei-Fei Li's lab, ImageNet era)
- **OpenAI co-founder** (2015): Left to join Tesla
- **Tesla AI Director** (2017–2022): Led Autopilot's vision-based approach; the "remove radar" decision; built Tesla's in-house data labeling and neural network training infrastructure
- **Returned to OpenAI** (2023): Brief return; departed again in 2024
- **Eureka Labs** (2024–present): AI-native education company; "AI teaching assistants" for every course

---

## Key Contributions

### LLM Wiki Pattern
Karpathy's primary contribution relevant to this KB. The pattern: maintain a plain-text, markdown-based personal knowledge base written to be read by LLMs. Key properties:
- Files are written in clear prose optimized for LLM context injection
- No heavy formatting or HTML — pure markdown
- Grows organically as knowledge is acquired
- Accessed by pasting directly into context windows or via a query CLI
- Enables "query your own accumulated knowledge" rather than searching the web

Jay's Agentic-KB is a direct implementation of this pattern, extended with:
- Typed frontmatter schema
- Obsidian wiki linking
- INGEST/QUERY/LINT workflows
- Agent-maintained (not human-maintained)

Reference: Karpathy's public statements on "wikis for LLMs" and the pattern observable in his public GitHub repositories.

### nanoGPT
GitHub: `karpathy/nanoGPT`

A minimal, clean implementation of GPT training in PyTorch — under 300 lines of code. Its value:
- Teaches transformer architecture by reading the code, not the paper
- Trains a real GPT-2 sized model from scratch
- Used in hundreds of courses, blog posts, and research experiments as a reference implementation
- Shows that the "magic" of GPT is ~300 lines of understandable code

Key concepts demonstrated: multi-head attention, positional embeddings, layer norm placement, the autoregressive training loop, KV cache.

### micrograd
GitHub: `karpathy/micrograd`

A tiny (~150 line) automatic differentiation engine that demonstrates backpropagation from first principles. Implements a scalar-valued computational graph with `.backward()`. Used to teach: what a neural network actually is, what gradient descent actually does, why `loss.backward()` works in PyTorch.

### makemore
GitHub: `karpathy/makemore`

A series of character-level language model implementations, from a bigram model to a full transformer, each in ~100-200 lines. Used to teach the progression from lookup tables → MLPs → RNNs → attention → transformers. The YouTube lecture series covers this progression over 8+ hours.

### YouTube Lecture Series ("Neural Networks: Zero to Hero")
- "The spelled-out intro to neural networks and backpropagation: building micrograd"
- "The spelled-out intro to language modeling: building makemore"
- "Building GPT from scratch, in code, spelled out"
- "Let's build the GPT tokenizer"
- "Intro to Large Language Models" (1h talk, highly cited)

These lectures are the best free resource for understanding transformer internals from first principles. Karpathy explains at the mechanism level, not the API level.

### "Intro to Large Language Models" (Nov 2023)
1-hour public talk covering: what LLMs are, how they're trained (pre-training + RLHF), what they can and can't do, jailbreaking, prompt injection, the future. Widely cited as the best accessible introduction to LLMs for technical professionals. Key concepts he introduced to mainstream discourse:
- "LLMs as stochastic parrots" (criticism) vs. "LLMs as knowledge distillation"
- System 1 vs System 2 thinking in LLMs (leading to reasoning models)
- The "reversal curse" — LLMs know "A is B" but not "B is A"

### Eureka Labs
AI-native education startup (2024). Hypothesis: every teacher should have an AI teaching assistant that knows the course material deeply and can tutor students at scale. First product: "AI Teaching Assistants" for university-level AI courses. Relevant to Jay: Karpathy's thesis is that the LLM wiki pattern scales to education — any domain knowledge can be structured for LLM-assisted teaching.

---

## The LLM Wiki Pattern — Technical Details

Karpathy's pattern, as Jay has implemented it:

```
Structure:
/wiki
  /concepts       ← universal domain concepts
  /frameworks     ← tools and frameworks
  /entities       ← people, companies, models
  /recipes        ← how-to guides
  /evaluations    ← comparisons and benchmarks

Access methods:
1. CLI query: `query "what is the fan-out pattern"`
   → fuzzy search → read matching pages → LLM synthesizes
2. MCP server: `search_wiki` + `read_wiki_page` tools
   → agents can query KB during task execution
3. Direct context injection: paste hot.md or relevant pages into prompt

Writing style:
- Dense, no fluff
- Technical audience (the LLM is smart; don't over-explain)
- Explicit [[wiki-link]] structure for relationship navigation
- Frontmatter for structured metadata
```

The key insight is that **a well-structured plaintext wiki is a better long-term memory system than a vector database** for many use cases — no retrieval errors, no embedding drift, human-readable, version-controllable, and fully transparent.

---

## Why Karpathy Matters to Jay's Stack

Jay's entire Agentic-KB is a direct intellectual descendent of Karpathy's LLM wiki pattern. The `packages/cli` and `packages/mcp` in `/Users/jaywest/My LLM Wiki/` are Jay's implementation of Karpathy's concept. The decision to build a file-based wiki rather than a vector DB is a validated pattern choice traceable to this influence.

---

## Integration Points

- **[[entities/jay-west-agent-stack]]**: Jay's KB is a direct implementation of Karpathy's wiki pattern
- **[[evaluations/eval-memory-approaches]]**: File-based wiki (Karpathy pattern) is one of the compared approaches
- **[[recipes/recipe-llm-wiki-setup]]**: Step-by-step guide to setting up a Karpathy-style wiki

---

## Sources

- Karpathy's GitHub: `github.com/karpathy` (nanoGPT, micrograd, makemore)
- YouTube: "Neural Networks: Zero to Hero" series
- Public statements on LLM wikis (Twitter/X, blog posts)
- Jay's CLAUDE.md (references Karpathy pattern as inspiration)
