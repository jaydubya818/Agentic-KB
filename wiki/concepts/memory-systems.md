---
id: 01KNNVX2QGHWP20SHEG3Y26P43
title: Memory Systems
type: concept
tags: [agentic, memory, episodic, semantic, procedural, working-memory]
confidence: high
sources:
  - "Cognitive psychology: Atkinson-Shiffrin model"
  - "Anthropic: Building Effective Agents (2024)"
  - "Cognitive Architectures for Language Agents (CoALA) survey (2023)"
created: 2026-04-04
updated: 2026-04-04
related:
  - "[[concepts/context-management]]"
  - "[[concepts/state-persistence]]"
  - "[[patterns/pattern-external-memory]]"
  - "[[patterns/pattern-hot-cache]]"
  - "[[patterns/pattern-rolling-summary]]"
status: stable
---

## TL;DR

Agent memory maps onto four cognitive types: working (in-context), episodic (logs/history), semantic (knowledge bases), and procedural (skills/instructions). Each is implemented differently and has different access cost, freshness guarantees, and persistence. Most agent failures trace to using the wrong memory type for a given need.

---

## Definition

Memory in an agentic system is any mechanism by which information persists beyond a single LLM call and can influence future behavior. The four-type taxonomy (working, episodic, semantic, procedural) provides a principled framework for deciding where to store and how to retrieve information.

---

## How It Works

### Working Memory (In-Context)

**What it is**: The active context window — everything in the current prompt and conversation history.

**Capacity**: ~200K tokens for Claude (as of 2026). Sounds large; fills up faster than expected in agent loops.

**Access cost**: Zero — it's already there.

**Persistence**: None. Evicted when the session ends or context is compressed.

**Best for**:
- The current task's immediate state
- Active reasoning and intermediate steps
- Information needed multiple times within one session

**Implementation**: No special implementation — it's just the context. Manage it proactively with compression and selective retention.

**Anti-pattern**: Using working memory for information that's also needed in future sessions. Write it to episodic or semantic memory before the session ends.

---

### Episodic Memory (Logs / Session History)

**What it is**: A time-ordered record of what happened — agent actions, tool calls, decisions, errors, and outcomes.

**Capacity**: Unbounded (storage-limited, not context-limited).

**Access cost**: Requires retrieval — load the log file, query the DB, or run a vector search over history.

**Persistence**: Permanent until explicitly deleted.

**Best for**:
- Debugging agent behavior after the fact
- Providing a "what did we try before?" context to prevent repeating failed approaches
- Audit trails for compliance or human review
- Learning patterns across sessions (with downstream processing)

**Implementation**:
```python
# Append-only event log
def log_event(event_type: str, data: dict):
    entry = {
        "timestamp": utcnow(),
        "session_id": SESSION_ID,
        "event_type": event_type,  # "tool_call", "decision", "error", "completion"
        "data": data
    }
    append_jsonl(LOG_FILE, entry)

# Usage
log_event("tool_call", {"tool": "read_file", "path": "src/main.py", "result_tokens": 450})
log_event("decision", {"reasoning": "file is too large to process in one pass, will chunk"})
```

**Retrieval pattern**: For current-session continuity, include the last N log entries in the context. For cross-session memory, use semantic search over the log.

---

### Semantic Memory (Knowledge Base / Wiki)

**What it is**: Structured knowledge about the domain, codebase, concepts, and facts — not tied to any particular session.

**Capacity**: Unbounded.

**Access cost**: High if using vector search; moderate if using structured files with known paths; low if pre-loaded into context.

**Persistence**: Permanent, deliberately maintained.

**Best for**:
- Codebase architecture facts that all agents should know
- Domain concepts, glossaries, standards
- Reusable reference information (API schemas, data models)
- The Agentic KB itself is semantic memory for Jay's agents

**Implementation**:
```
/kb/
  concepts/       ← concept definitions (this wiki)
  codebase/       ← architecture docs, module summaries
  api-schemas/    ← external API contracts
  decisions/      ← ADRs, decision logs
  index.md        ← navigational index for agent discovery
```

Agents read from semantic memory via targeted file reads or vector search. Write to it when new stable knowledge is discovered (don't write every session — only when knowledge should outlast the session).

**Update pattern**: Treat semantic memory like documentation — write when something is confirmed true and worth preserving, not speculatively.

---

### Procedural Memory (Skills / Instructions)

**What it is**: Encoded know-how — system prompts, skill files, agent instructions, reusable prompt templates, tool usage guides.

**Capacity**: N/A — it's not retrieved dynamically; it's loaded at agent initialization.

**Access cost**: Zero at inference time (already loaded into system prompt or injected at session start).

**Persistence**: Permanent, version-controlled.

**Best for**:
- "How to do X" knowledge that should apply to every invocation
- Standard operating procedures for agent roles
- Tool usage guidelines
- Error handling patterns

**Implementation** ([[framework-claude-code]] native): `~/.claude/skills/` contains skill files. The Agent tool's `system` parameter is procedural memory for sub-agents. CLAUDE.md files in project roots are procedural memory for the main agent.

```yaml
# skill: handle-database-migration.md
## When to use
Apply whenever the task involves creating or modifying a Prisma migration.

## Protocol
1. Read the current schema first
2. Check for existing pending migrations before creating new ones
3. Always provide a down migration
4. Test with: prisma migrate dev --name <name>
```

**Anti-pattern**: Stuffing procedural memory with so much content that the model can't prioritize. Keep skills focused — one skill, one procedure.

---

## When to Reach for External Memory vs In-Context

| Situation | Memory Type | Rationale |
|-----------|-------------|-----------|
| Information needed this session only | Working (in-context) | No overhead |
| Information created this session, needed next session | Episodic | Write before session ends |
| Stable facts about the domain/codebase | Semantic | Persistent KB entry |
| Standard operating procedure for a task type | Procedural | Skill file or system prompt |
| "What did we try last time?" | Episodic | Retrieve and inject |
| Context window approaching limit | External (any) | Compress and offload |

---

## Key Variants

- **Vector memory**: Episodic or semantic memory stored as embeddings; retrieval via similarity search. High recall but can surface outdated or irrelevant content.
- **Graph memory**: Entities and relationships stored as a knowledge graph. Strong for relational queries; expensive to maintain.
- **Hierarchical memory**: Summaries of summaries — raw logs → session summaries → long-term synthesis. Scales to arbitrarily long histories.

---

## Risks & Pitfalls

- **Memory poisoning**: If an agent writes incorrect information to semantic memory, all future agents will read it as ground truth. Validate before writing.
- **Stale memory**: Semantic memory that doesn't reflect current codebase state misleads agents. Attach update triggers to significant code changes.
- **Retrieval failures**: Vector search returns semantically similar but contextually wrong results. Always sanity-check retrieved content before acting on it.
- **Memory blindness**: Agent doesn't know the memory exists. Every agent needs explicit instructions on what memories to consult and when.

---

## Counter-arguments & Gaps

The "agents need persistent memory" assumption is weaker than it appears. Long-context models (200k+ tokens) obviate many memory use-cases — what used to require vector DBs and retrieval pipelines now fits in a single request. A substantial fraction of agentic "memory systems" are solutions to a problem that 2025-era context windows already solve, and the ongoing token-cost decline is rapidly moving the threshold.

Memory poisoning is under-appreciated relative to retrieval failures. Once an agent writes a wrong fact to semantic memory, every subsequent agent that reads it treats it as authority. There's no published production study showing how long bad memories persist or how often they cascade — this is a governance blind spot, not just a technical pitfall. "Validate before writing" is the standing advice but is rarely implemented with teeth.

Vector retrieval quality is dominated by embedding model choice. Teams often attribute retrieval improvements to RAG-architecture changes when the actual driver was a newer embedding model. Without controlled ablations, most memory-system wins are uncontrolled.

Open questions: (a) at what context size does explicit memory architecture become a net negative? (b) Should agents have permission to modify their own memory, or should writes always be gated by a review step? The field has defaulted to self-modification without clear evidence it's safe. (c) How do you audit cross-session memory for drift, contamination, and contradiction at scale?

What would change the verdict on explicit memory architecture: controlled studies showing memory-augmented agents beat equally budgeted long-context agents on realistic tasks. Current comparisons are usually against straw-man baselines.

---

## Related Concepts

- [[concepts/context-management]] — managing working memory during sessions
- [[concepts/state-persistence]] — checkpointing and cross-session state
- [[patterns/pattern-external-memory]] — implementation pattern for external memory
- [[patterns/pattern-hot-cache]] — fast access to frequently-needed semantic memory
- [[patterns/pattern-rolling-summary]] — hierarchical compression of episodic memory

---

## Sources

- Cognitive Psychology: Atkinson-Shiffrin Multi-Store Model
- Cognitive Architectures for Language Agents (CoALA), Sumers et al. (2023)
- [[anthropic]] "Building Effective Agents" (2024)
