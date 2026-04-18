---
id: 01KNNVX3PHWQ8RS67MT1VB4YNJ
title: Episodic Judgment Log
type: pattern
category: memory
problem: Agents have your files but not your judgment — they give generic advice on decisions you've already thought through deeply
solution: Maintain append-only JSONL logs of human experiences, decisions, and failures with structured reasoning fields so agents can reference your actual judgment patterns rather than generating fresh generic reasoning
tradeoffs:
  - pro: Agents reference your specific reasoning history rather than generic advice
  - pro: Failure patterns get encoded once and prevent recurrence
  - pro: Decision logs compound — the 50th decision benefits from context the first 49 created
  - con: Requires discipline to log at the time of the experience, not retroactively
  - con: Quality depends on the depth of reasoning captured, not just the outcome
tags: [memory, episodic, personal, context-management, pattern-memory, judgment]
confidence: medium
sources:
  - "Muratcan Koylan — Personal Brain OS (2025)"
created: 2026-04-09
updated: 2026-04-09
---

## Problem

Standard personal knowledge bases store **facts**: notes, articles, summaries, reference material. When an agent queries them it can tell you what you know, but not how you think. Ask it to help you decide whether to take a job offer or how to handle a recurring team dynamic, and it produces generic reasoning indistinguishable from advice you'd find in any productivity blog — because it doesn't have access to how you've actually resolved similar situations before.

This is the gap between "AI that has your files" and "AI that has your judgment."

---

## Solution

Maintain three append-only JSONL logs alongside your semantic wiki:

| Log | What it stores | Key fields |
|-----|----------------|------------|
| `experiences.jsonl` | Significant moments with subjective weight | `description`, `emotional_weight` (1-10), `lesson`, `tags` |
| `decisions.jsonl` | Consequential choices with full reasoning | `decision`, `context`, `alternatives_considered`, `reasoning`, `outcome` (filled in later) |
| `failures.jsonl` | Things that went wrong, honestly | `what_failed`, `root_cause`, `contributing_factors`, `prevention`, `outcome` |

Agents query these logs when handling tasks that involve tradeoffs, judgment calls, or recurring challenges — not as reference material but as reasoning context. The logs encode the *why* behind outcomes, not just the outcomes.

---

## Implementation Sketch

### File structure

```
memory/
├── experiences.jsonl
├── decisions.jsonl
└── failures.jsonl
```

Each file starts with a schema header line (helps agents parse structure before reading data):

```jsonl
{"_schema": "experience", "_version": "1.0", "_description": "Significant personal experiences with emotional weight and extracted lessons"}
```

### experiences.jsonl schema

```jsonl
{
  "id": "exp-2026-001",
  "date": "2026-03-15",
  "title": "First time a shipped system failed in production at 2am",
  "description": "Alerting fired at 2:17am. Spent 90 minutes diagnosing a cascade failure caused by a config change I approved without testing in staging. Fixed by rollback.",
  "emotional_weight": 8,
  "lesson": "Never approve config changes without a staging gate, regardless of time pressure. The 10-minute staging test is always worth it.",
  "tags": ["operations", "incident", "personal-accountability"]
}
```

### decisions.jsonl schema

```jsonl
{
  "id": "dec-2026-003",
  "date": "2026-01-20",
  "decision": "Joined Sully.ai as Context Engineer over accepting $250K Antler investment",
  "context": "Had two paths: take institutional funding and build solo, or join early-stage team with deep AI expertise and learn faster",
  "alternatives_considered": [
    "Antler Canada $250K — independence, but isolated learning curve",
    "Sully.ai — lower initial upside, but access to frontier AI engineering context"
  ],
  "reasoning": "Priority order is Learning > Impact > Revenue > Growth. Sully gave me the highest learning ceiling. The institutional money would have been isolating at this stage.",
  "framework_used": "Can I touch everything? Will I learn at the edge of my capability? Do I respect the founders?",
  "outcome": null,
  "outcome_date": null,
  "outcome_notes": null
}
```

### failures.jsonl schema

```jsonl
{
  "id": "fail-2026-007",
  "date": "2026-02-03",
  "what_failed": "Agent rewrote posts.jsonl instead of appending — lost 3 months of post engagement data",
  "root_cause": "JSON file format doesn't enforce append-only; agent issued a full file write",
  "contributing_factors": ["file format choice (JSON vs JSONL)", "no write guard in the agent's tools", "no backup before write"],
  "prevention": "Switch all logs to JSONL (append-only by design). Add write guards that reject full-file rewrites on log files. Validate with: assert file_size_after >= file_size_before.",
  "outcome": "Migrated all logs to JSONL. Added append-only enforcement to writeback module.",
  "status": "resolved"
}
```

### Agent instructions (CLAUDE.md excerpt)

```markdown
## Judgment Memory

Before giving advice on decisions, tradeoffs, or recurring challenges, check:
- `memory/decisions.jsonl` — how I've approached similar decisions and what framework I used
- `memory/failures.jsonl` — what's gone wrong in similar situations and how it was resolved
- `memory/experiences.jsonl` — relevant experiences (filter by `tags` first, then `emotional_weight >= 6`)

Never give generic advice on a topic I have a prior decision log entry for. Reference my actual reasoning.

When I make a significant decision or experience a failure, offer to log it.
```

---

## Tradeoffs

| Dimension | Assessment |
|-----------|------------|
| Reasoning quality | High — agents reference actual judgment history, not generic patterns |
| Compounding value | High — each logged decision enriches future decisions on similar topics |
| Logging discipline | Required — value is zero if entries aren't written at the time of the experience |
| Retroactive logging | Lower value — retrospective entries lack the reasoning detail captured in the moment |
| Privacy | Sensitive — these logs contain consequential personal reasoning; treat as private |

---

## When To Use

- You make recurring decisions in a domain (career, business, technical architecture) and want your agent to learn your framework, not apply a generic one
- You've experienced failures you don't want to repeat — encoding them explicitly is more reliable than hoping you'll remember
- You want an agent to give you advice that sounds like a well-briefed version of you, not a productivity blog
- You're building a long-running personal AI system where the value compounds over months and years

## When NOT To Use

- Short-lived projects where cross-session memory isn't needed
- Contexts where you want genuinely fresh, unbiased reasoning (the logs will anchor the agent to past patterns)
- If you won't maintain the logs — incomplete judgment logs are worse than no logs (agents will over-weight the sparse entries they do find)

---

## Real Examples

From Muratcan Koylan's Personal Brain OS: a decision log entry for "Antler vs. Sully.ai" captures the priority framework (`Learning > Impact > Revenue > Growth`) and the company-joining criteria (`Can I touch everything? Will I learn at the edge of my capability?`). When a similar career decision comes up, the agent doesn't generate generic career advice — it references the actual framework and asks whether the new option meets the same criteria.

The failures log is described as the most valuable: "It encodes pattern recognition that took real pain to acquire." A failure logged once prevents recurrence indefinitely because the agent reads it before making similar moves.

---

## Related Patterns

- [[patterns/pattern-external-memory]] — broader pattern family; judgment logs are a specific instance
- [[patterns/pattern-hot-cache]] — frequently-referenced judgment patterns can be promoted to [[pattern-hot-cache]] for zero-latency access
- [[patterns/pattern-tiered-agent-memory]] — tier-scoped memory lifetime; judgment logs are personal-tier, long-lived
- [[concepts/memory-systems]] — the four-type taxonomy; judgment logs extend the episodic memory type
- [[concepts/context-management]] — primacy-recency attention curve affects how judgment log entries should be structured (lead with the lesson, reasoning in the middle)
