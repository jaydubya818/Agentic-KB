---
title: Meta-Meta-Prompting — The Secret to Making AI Agents Work
type: summary
source_file: raw/articles/garrytan-meta-meta-prompting.md
source_url: https://x.com/garrytan/status/2053127519872614419
author: Garry Tan (CEO, Y Combinator)
date_published: 2026-05-09
date_ingested: 2026-05-11
tags: [agentic, prompt-engineering, fat-skills, thin-harness, resolver-pattern, personal-context-graph, sub-agents]
key_concepts:
  - fat-skills-thin-harness
  - resolver-routing
  - personal-context-graph
  - sub-agent-orchestration
  - skillify-vs-frameworks
confidence: high
reviewed: false
reviewed_date: ""
---

# Meta-Meta-Prompting — The Secret to Making AI Agents Work

## TL;DR

Garry Tan's manifesto for personal AI as an operating system, not a chat window. Five-part architecture: **fat skills + thin harness**, **resolvers** for routing intelligence, **sub-agent orchestration**, **deep personal context graphs**, and **skillify** (the right wrapper makes a "naked model" 10× more useful). 16K-char essay. 3,393 favorites · 124 replies. Y Combinator CEO writing about his nights-and-weekends builds.

## Why this matters to Jay's setup

**Direct: this article drove today's PRs.** The "personal context graph" pattern lands today as:
- [Agentic-KB PR #2](https://github.com/jaydubya818/Agentic-KB/pull/2) — `wiki/personal/context-graph/` schema scaffold
- [Agentic-Pi-Harness PR #5](https://github.com/jaydubya818/Agentic-Pi-Harness/pull/5) — `context-graph/` consumer scaffold + Hermes integration spec

The remaining four ideas (fat-skills/thin-harness, resolvers, sub-agent orchestration, skillify) map to existing Hermes / Pi architecture and are at least partially in place.

## Key claims

### 1. Fat skills, thin harness
A "fat skill" packs prompt + context + tools + output schema into one self-contained unit. The harness orchestrates skills but stays minimal. **Already how Cowork / Claude Code skills work.** Jay's `~/.claude/skills/` follows this.

### 2. Resolvers route intelligence
A resolver is a function that takes a user intent and decides which skill / sub-agent should handle it. Multiple resolvers can stack (intent → domain resolver → skill resolver). **Hermes already has this** at `Agentic-Pi-Harness/src/orchestration/`. Garry's framing validates the design.

### 3. Sub-agent orchestration
A parent agent spawns specialized sub-agents (researcher, writer, critic) that each have their own context. **Already in use** via Hermes `src/subagents/`.

### 4. Personal context graph (the "book that read me back" example)
Each sub-agent loads relevant personal context (career, projects, reading log, therapy themes, relationships) so its output is grounded in *your* life, not the median user's. **This is the new pattern** today's PRs scaffold.

### 5. Skillify > frameworks
"LangChain raised $160M and gave you a squat rack and dumbbell set without a workout plan." Skills bundle the workout plan with the equipment. Naked models are stupider; skill-wrapped models are 10× better. **Validates the skill-first approach Anthropic and Jay's setup already take.**

## Where Garry is right vs. wrong for our setup

**Right:**
- Personal context graph as a first-class architecture concept (today's PRs).
- Fat skills > thin skills + framework glue.
- The "book that read me back" use case requires structured personal data; flat markdown isn't enough.

**Wrong (or overstated):**
- "LangChain is a squat rack" — uncharitable. LangChain solved a real problem (composition) in 2023; the criticism is fair only post-skill-platform emergence.
- The essay reads as a victory lap for a specific architecture (Garry's) without engaging with alternative architectures (e.g., DSPy's compiler-driven prompt optimization, BAML's schema-first approach).
- No discussion of **failure modes** of typed personal context graphs (drift, staleness, accidental PII exposure). Today's PRs include explicit Rule 13 + gitignore mitigations to address this gap.

## Counter-arguments & gaps

- **Garry has skin in the game** (YC portfolio bets on skills/agent companies). Treat the manifesto as a position, not a neutral survey.
- **No measurements.** Claims like "10× more useful" and "30-60 days from idea to revenue" have no citations. Plausible but unsubstantiated.
- **The "book that read me back" example proves the concept exists but doesn't prove it scales.** Reading one book against a personal graph is different from running 100 daily queries against it.

## Recommended actions

1. ✅ **Personal context graph scaffold** — landed today as Agentic-KB PR #2 and Agentic-Pi-Harness PR #5.
2. **Audit existing fat-skills layout** in `Agentic-Pi-Harness/src/subagents/` against Garry's description. If our skills are thin (function-shaped) rather than fat (prompt+tools+output bundled), that's a refactor candidate. Out of scope for today; file as a Hermes-side follow-up.
3. **Compare resolver architecture** in `src/orchestration/` against Garry's. Same audit. Probably already aligned given Hermes was built with this pattern in mind.

## Related

- [[wiki/personal/context-graph/schema]] — the schema today's PR scaffolds
- [[wiki/personal/context-graph/README]]
- [[wiki/summaries/cyrilxbt-obsidian-smart-vault]] — different author, same KB-as-thinking-partner thesis
- [[wiki/summaries/cyrilxbt-claude-code-solo-founders]] — same Claude-Code era, different angle
- [[wiki/personal/hermes-operating-context]]
- [[wiki/personal/personal-agent-design-observations]]

## Sources

- Source URL: https://x.com/garrytan/status/2053127519872614419
- Source file: `raw/articles/garrytan-meta-meta-prompting.md`
- 3,393 favorites · 124 replies
- Pasted full body into Apple Note (no syndication round-trip needed); also re-fetched via fxtwitter for raw/
