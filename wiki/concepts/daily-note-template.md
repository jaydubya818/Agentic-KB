---
id: 01KQ30HYSJWND0V4TKTKCMN087
title: "Daily Note Template (Obsidian)"
type: concept
tags: [obsidian, personal, knowledge-base, workflow]
created: 2026-04-21
updated: 2026-04-21
visibility: private
confidence: medium
related: [agents/leads/sofie/profile.md]
source: obsidian-vault
---

# Daily Note Template (Obsidian)

A structured daily journaling template maintained in Sofie's Obsidian vault. Each daily note is stored under `daily-notes/YYYY-MM-DD.md` and follows a consistent section layout designed to capture energy state, intentions, tasks, ideas, and end-of-day reflections.

## Definition

The daily note is the atomic unit of Sofie's personal knowledge management practice. It anchors each day with lightweight structured prompts rather than free-form journaling, making it easier to scan historically and feed into agent workflows.

## Structure

```markdown
## Morning
- Energy: /10
- Focus intention:

## Notes

## Actions
- [ ]

## Ideas
-

## End of Day
- Wins:
- Loose threads:
- Tomorrow's seed:
```

### Section Purpose

| Section | Purpose |
|---|---|
| **Morning** | Calibrate energy and set a single focus intention for the day |
| **Notes** | Freeform capture — meetings, observations, stray thoughts |
| **Actions** | Checkbox task list for the day |
| **Ideas** | Low-friction idea parking, not commitments |
| **End of Day** | Lightweight retrospective: wins, open threads, seed for tomorrow |

## Why It Matters

The template creates a consistent, machine-readable structure that can be ingested into the KB pipeline. Empty or partially filled notes still provide signal — they indicate days with no recorded output, which may correlate with low energy or off-days.

## Example

The note for `2026-03-22` (Sunday) was created from this template but all fields were left blank, suggesting no activity was logged for that day.

## ⚠️ Contradictions

> ⚠️ **Metadata inconsistency**: The note filename and title indicate the date `2026-03-22`, but the document metadata lists `date: 2026-04-21` and `ingested_at: 2026-04-21`. This ~30-day gap suggests either backdated note creation or delayed ingestion into the pipeline. Flagged for review — the ingestion pipeline may need to distinguish between note date and ingest date more explicitly. See [ingest pipeline](concepts/ingest-pipeline.md).

## See Also

- [Sofie's agent profile](../agents/leads/sofie/profile.md)
- [Ingest Pipeline](concepts/ingest-pipeline.md)
- [Memory Systems](concepts/memory-systems.md)
- [LLM-Owned Wiki](concepts/llm-owned-wiki.md)
