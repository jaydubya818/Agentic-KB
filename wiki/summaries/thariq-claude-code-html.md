---
title: Using Claude Code — The Unreasonable Effectiveness of HTML
type: summary
source_file: raw/articles/thariq-claude-code-html.md
source_url: https://x.com/trq212/status/2052809885763747935
author: Thariq Shihipar (trq212)
date_published: 2026-05-07
date_ingested: 2026-05-11
tags: [agentic, claude-code, tool-output-format, html, pattern-tool-design, prompt-engineering]
key_concepts:
  - tool-output-format
  - html-vs-markdown-for-agents
  - agent-readable-formats
confidence: high
reviewed: false
reviewed_date: ""
---

# Using Claude Code — The Unreasonable Effectiveness of HTML

## TL;DR

Thariq's argument: markdown won the human-readable-output war, but HTML is **a strictly better tool-output format for agents** because it gives Claude (a) richer structure (tables, collapsibles, nested blocks) without ambiguity, (b) lossless round-tripping (Claude can read its own HTML back), and (c) better visual scanning when rendered in a Claude Code session. 12.5K-char essay with code examples. 14K likes.

## Why this matters to Jay's setup

Direct relevance to:
- `morning-review` reports (currently markdown — could be HTML for richer dashboards)
- `Agentic-KB/wiki/` (Obsidian-native, must stay markdown — **doesn't apply here**)
- `Hermes` sub-agent communication (currently markdown — could switch to HTML for inter-agent payloads)
- Claude Cowork artifacts (already HTML — Thariq's argument validates this)

## Key claims and evidence

### 1. Markdown is ambiguous; HTML is not
Markdown has multiple flavors (CommonMark, GFM, MultiMarkdown). Tables, footnotes, and definition lists render differently across renderers. **HTML has one spec.** When an agent generates output that needs to be consumed by another agent, ambiguity is the enemy.

### 2. HTML round-trips losslessly
If sub-agent A produces output and sub-agent B reads it, markdown → render → re-parse loses information (nested formatting, attributes, ids). HTML preserves everything. Thariq's example: a `<details>` with `data-source="urn:..."` survives a parse → re-emit cycle.

### 3. HTML is denser for the eye in CLI
Claude Code's terminal renders HTML elements as visual primitives (boxes, lines, indentation) more cleanly than markdown headings. Quote: "Markdown is a recipe for what the rendered output should look like. HTML *is* the rendered output."

### 4. Tool calls returning HTML are easier to compose
A tool that returns `<table>` lets the next agent slice columns via CSS-selector-style queries. A tool that returns a markdown pipe table forces the next agent to re-parse with regex.

## Where Thariq is right vs. wrong for our setup

**Right:**
- Sub-agent → sub-agent payloads inside Hermes. Today these are JSON or markdown; HTML with semantic tags (e.g. `<finding confidence="0.85">`) would be cleaner.
- Morning Review reports rendered inline in a Claude session — HTML buys richer structure.

**Wrong (for our setup):**
- Anything destined for Obsidian. Obsidian's primary use mode is markdown editing; HTML is opaque. Agentic-KB stays markdown by Rule 13.
- Anything destined for GitHub PR bodies. GitHub renders HTML inconsistently and the user has to read raw HTML if Claude includes it in commit messages.
- Anything destined for Apple Notes. Apple Notes mangles HTML on round-trip (we just dealt with the `<a href=...>` strip bug).

**Untested:**
- HTML vs. JSON for inter-agent payloads. JSON has equally strong schemas and parses without an HTML parser. Thariq doesn't engage with JSON as the alternative; he frames it as HTML-vs-markdown. The relevant comparison for our setup is probably HTML-vs-JSON, not HTML-vs-markdown.

## Counter-arguments

1. **Tool-call payloads in Claude's API are JSON-typed, not HTML-typed.** The native protocol already provides typed structured output. Routing through HTML is one extra parse step the platform doesn't ask for.
2. **HTML in markdown contexts breaks rendering.** If you embed `<details>` in a `.md` file destined for GitHub, the surrounding markdown sometimes renders, sometimes doesn't, depending on the platform.
3. **Markdown's ambiguity is fine when the consumer is one specific renderer.** Obsidian-flavored markdown is unambiguous *inside Obsidian.* Thariq's argument applies when output crosses tool boundaries.

## Recommended actions

1. **No immediate code change** — the morning-review markdown reports and Agentic-KB markdown wiki are well-tuned for their consumers (Obsidian / human reader).
2. **Tactical follow-up for Hermes:** if you start passing structured findings between sub-agents (e.g. classifier → orchestrator), evaluate HTML vs. JSON envelope. Default to JSON for typed payloads; reserve HTML for "render this directly to the user" content.
3. **File as `wiki/patterns/pattern-html-tool-output.md`?** Probably not yet — needs another source agreeing before promoting per Rule 14 (2-source rule for concept/pattern pages). Defer to `candidates.md`.

## Counter-arguments & gaps

- The article presents zero benchmarks. Claims like "denser for the eye" and "easier to compose" are intuition pumps, not measurements. The 14K likes reflect tribal nodding, not validated evidence.
- The article doesn't address JSON-as-alternative. For typed inter-agent payloads, JSON is the obvious comparison and Thariq skips it.
- The "round-trip lossless" claim depends on Claude not modifying whitespace or attribute order. In practice both happen. So "lossless" is aspirational.

## Related

- [[wiki/summaries/cyrilxbt-obsidian-smart-vault]] — opposite take: markdown as the universal substrate
- [[wiki/concepts/tool-use]] (if exists)
- [[wiki/patterns/pattern-fan-out-worker]] (if exists)

## Sources

- Source URL: https://x.com/trq212/status/2052809885763747935
- Source file: `raw/articles/thariq-claude-code-html.md`
- 14,046 favorites · 887 replies — viral
