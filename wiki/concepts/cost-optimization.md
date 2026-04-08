---
id: 01KNNVX2QCGEK0GQNDSZE0CVFD
title: Cost Optimization
type: concept
tags: [agentic, cost, tokens, caching, model-tiering, optimization, batching]
confidence: high
sources:
  - "Anthropic: Pricing and token documentation (2025)"
  - "Anthropic: Prompt caching documentation (2025)"
  - "Production LLM cost engineering practices (2024-2025)"
created: 2026-04-04
updated: 2026-04-04
related:
  - "[[concepts/context-management]]"
  - "[[concepts/memory-systems]]"
  - "[[concepts/agent-loops]]"
  - "[[patterns/pattern-hot-cache]]"
  - "[[patterns/pattern-rolling-summary]]"
status: stable
---

## TL;DR

LLM costs at scale are dominated by input tokens (especially in long agentic sessions) and model selection. Model tiering — Haiku for leaf tasks, Sonnet for orchestration, Opus for complex reasoning — is the highest-leverage optimization. Prompt caching can reduce costs 80-90% for stable system prompts. Track cost per task, not just cost per call.

---

## Definition

Cost optimization in agentic systems is the set of practices for minimizing token spend and API costs while maintaining output quality, including: model selection, prompt caching, context compression, batching, and tool output truncation.

---

## How It Works

### Model Tiering

The single highest-leverage cost decision is which model to use for which task. As of 2026:

| Model | Relative Cost | Best For |
|-------|--------------|----------|
| Claude Haiku 4.5 | ~1× | File reads, simple Q&A, boilerplate, leaf-task sub-agents |
| Claude Sonnet 4.6 | ~5-10× | Orchestration, code generation, standard reasoning |
| Claude Opus 4.6 | ~20-30× | Architecture decisions, complex reasoning, security audits |

**Tiering pattern for multi-agent systems**:

```python
TASK_MODEL_MAP = {
    "read_file": "claude-haiku-4-5",
    "summarize": "claude-haiku-4-5",
    "write_boilerplate": "claude-haiku-4-5",
    "orchestrate": "claude-sonnet-4-6",
    "code_review": "claude-sonnet-4-6",
    "implement_feature": "claude-sonnet-4-6",
    "architecture_decision": "claude-opus-4-6",
    "security_audit": "claude-opus-4-6",
    "complex_debugging": "claude-opus-4-6",
}

def get_model_for_task(task_type: str) -> str:
    return TASK_MODEL_MAP.get(task_type, "claude-sonnet-4-6")  # Sonnet as default
```

Don't use Opus for everything "to be safe" — for most coding tasks, Sonnet produces equal quality at 20% the cost.

### Token Budget Management

Track and budget token usage per agent call and per session:

```python
@dataclass
class TokenBudget:
    session_limit: int = 500_000      # total tokens for this session
    per_call_limit: int = 50_000      # max tokens per individual call
    compression_threshold: float = 0.7  # compress when 70% of session used

class BudgetedAgent:
    def __init__(self, budget: TokenBudget):
        self.budget = budget
        self.tokens_used = 0

    async def call(self, messages: list, **kwargs) -> Response:
        estimated = count_tokens(messages)
        if self.tokens_used + estimated > self.budget.session_limit:
            messages = compress_context(messages)
        if len(messages) > self.budget.per_call_limit:
            messages = trim_to_limit(messages, self.budget.per_call_limit)

        response = await llm.call(messages, **kwargs)
        self.tokens_used += response.usage.input_tokens + response.usage.output_tokens
        return response
```

### Prompt Caching

Anthropic's prompt cache stores processed prompt prefixes and reuses them across calls. Cached tokens cost ~10% of regular input token cost.

**Requirements for cache hit**:
- The prompt prefix must be identical (including whitespace)
- The prefix must be >= 1024 tokens (minimum cacheable size)
- Cache TTL is 5 minutes (refreshed on each cache hit)

**Design for cache hits**:
```python
# GOOD: Stable system prompt first, dynamic content at the end
messages = [
    {"role": "system", "content": STABLE_SYSTEM_PROMPT},  # cached after first call
    {"role": "user", "content": f"Current task: {task}"},  # changes per call
]

# BAD: Dynamic content in system prompt breaks caching
messages = [
    {"role": "system", "content": f"{STABLE_SYSTEM_PROMPT}\n\nCurrent time: {datetime.now()}"},
    # ^ timestamp changes every call → no cache hit → full input token cost every time
]
```

**Explicit cache control** (Anthropic API):
```python
response = client.messages.create(
    model="claude-sonnet-4-6",
    system=[
        {
            "type": "text",
            "text": STABLE_SYSTEM_PROMPT,
            "cache_control": {"type": "ephemeral"}  # tell Anthropic to cache this
        }
    ],
    messages=[{"role": "user", "content": task}]
)
```

Expected savings: For an agent that makes 20 calls with a 2000-token system prompt, caching saves 19 × 2000 × 0.9 = 34,200 input tokens per session.

### Semantic Caching

Beyond prompt caching, cache LLM responses for identical or semantically similar queries:

```python
import hashlib
from functools import lru_cache

def get_cache_key(prompt: str) -> str:
    return hashlib.sha256(prompt.encode()).hexdigest()

async def cached_llm_call(prompt: str, model: str) -> str:
    key = get_cache_key(f"{model}:{prompt}")
    if cached := cache.get(key):
        return cached

    response = await llm.call(prompt, model=model)
    cache.set(key, response, ttl=3600)
    return response
```

For semantic similarity caching (approximate, not exact):
```python
def semantic_cache_lookup(query: str, cache: VectorCache, threshold: float = 0.95) -> Optional[str]:
    embedding = embed(query)
    result = cache.nearest_neighbor(embedding)
    if result and result.similarity > threshold:
        return result.cached_response
    return None
```

### Batching

Group independent LLM calls into batches. Anthropic's batch API provides ~50% cost discount with ~24-hour turnaround:

```python
# Use for: nightly evals, bulk processing, non-realtime tasks
async def batch_evaluate(prompts: list[str]) -> list[str]:
    batch = client.beta.messages.batches.create(
        requests=[{"custom_id": str(i), "params": {"model": "claude-sonnet-4-6", "messages": [{"role": "user", "content": p}], "max_tokens": 1000}}
                  for i, p in enumerate(prompts)]
    )
    # Poll for completion (up to 24h)
    while batch.processing_status == "in_progress":
        await asyncio.sleep(60)
        batch = client.beta.messages.batches.retrieve(batch.id)
    return [r.result.message.content[0].text for r in batch.results]
```

### Avoiding Redundant Re-Reads

A common token waste: agents re-read files or context they already have. Prevention:

```python
class ContextCache:
    """Track what the agent has already read this session."""
    def __init__(self):
        self._read_files: dict[str, str] = {}

    def read_file(self, path: str) -> str:
        if path in self._read_files:
            return self._read_files[path]  # return from cache, no token spend
        content = actual_file_read(path)
        self._read_files[path] = content
        return content
```

In system prompts, tell the agent: "Before calling read_file, check if the file content is already in your context. If it is, use that — do not re-read."

---

## Cost Tracking

Build cost visibility into every agentic session:

```python
@dataclass
class SessionCostReport:
    session_id: str
    total_input_tokens: int
    total_output_tokens: int
    cache_hit_tokens: int
    estimated_cost_usd: float
    cost_by_model: dict[str, float]
    most_expensive_calls: list[dict]

def calculate_cost(usage: Usage, model: str) -> float:
    rates = {
        "claude-haiku-4-5": {"input": 0.25/1e6, "output": 1.25/1e6},
        "claude-sonnet-4-6": {"input": 3.0/1e6, "output": 15.0/1e6},
        "claude-opus-4-6": {"input": 15.0/1e6, "output": 75.0/1e6},
    }
    r = rates[model]
    return usage.input_tokens * r["input"] + usage.output_tokens * r["output"]
```

Track cost per task type to identify expensive paths and target optimizations.

---

## Risks & Pitfalls

- **Premature optimization**: Optimize prompts for cache hits before validating the pipeline works correctly
- **Haiku for the wrong tasks**: Haiku is great for simple tasks; using it for complex reasoning produces errors that cost more to fix than Sonnet would have cost to use
- **Cache staleness**: Semantic cache returns an outdated response after the world changes; always include temporal context in cache key when responses might change over time
- **Hidden costs**: Context compression itself costs tokens; verbose tool outputs that you trim still cost input tokens; model the full cost chain

---

## Related Concepts

- [[concepts/context-management]] — reducing context size to reduce input token cost
- [[concepts/memory-systems]] — external memory as alternative to long in-context history
- [[patterns/pattern-hot-cache]] — caching frequently-needed context
- [[patterns/pattern-rolling-summary]] — compressing long contexts

---

## Sources

- Anthropic Pricing and Token documentation (2025)
- Anthropic Prompt Caching documentation (2025)
- LLM cost engineering practices from production deployments
