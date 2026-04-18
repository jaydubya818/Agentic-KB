---
id: 01KNNVX3THQZ2NW45PR9YC6VBK
title: MarkItDown
type: framework
vendor: Microsoft
version: "0.1.x"
language: python
license: open-source
github: https://github.com/microsoft/markitdown
tags: [ingest-pipeline, tool-use, multi-agent, context-management, mcp]
last_checked: 2026-04-09
jay_experience: none
---

## Overview

MarkItDown is Microsoft's open-source Python library for converting any file format into clean, structured Markdown optimized for LLM consumption. It functions as a universal pre-processing layer that sits before the ingest pipeline — anything dropped into `raw/` that isn't already Markdown gets converted here first.

The library's design philosophy: "Mainstream LLMs natively speak Markdown" and Markdown is more token-efficient than HTML, XML, or raw binary formats. MarkItDown prioritizes LLM-readable structure (headings, lists, tables, links) over pixel-perfect fidelity.

---

## Core Concepts

**One-call conversion**: Any supported format → `result.text_content` (a Markdown string). No format-specific parsing logic in your application code.

**Stream-based architecture**: Reads from file-like streams, not file paths. No temporary files created. Composable with in-memory pipelines.

**LLM-integrated image description**: Pass `llm_client` and `llm_model` to get LLM-generated alt text for images embedded in documents, not just EXIF metadata extraction.

**Plugin system**: Third-party plugins discoverable via `#markitdown-plugin` GitHub tag. Disabled by default — opt in with `--use-plugins`. Notable plugin: `markitdown-ocr` adds LLM-vision OCR for scanned documents.

---

## Architecture

```
Any file format
      ↓
MarkItDown.convert(file)
      ↓
DocumentConverter (format-specific, plugin-extensible)
      ↓
result.text_content  ←  clean Markdown string
      ↓
Drop into raw/ and run kb compile
```

Optional Azure Document Intelligence integration (`-d -e <endpoint>`) for higher-fidelity parsing of complex layouts.

---

## Supported Formats

| Category | Formats |
|----------|---------|
| Documents | PDF, DOCX, PPTX, XLSX, XLS |
| Web | HTML, YouTube URLs |
| Media | Images (EXIF + OCR), Audio (speech transcription) |
| Data | CSV, JSON, XML |
| Archives | ZIP (processes contents recursively) |
| E-books | EPub |

---

## Strengths

- **Zero format-specific code** — one API handles everything; add new formats via plugins
- **Semantic structure preserved** — headings, lists, tables, links survive conversion; not just raw text dump
- **Audio + YouTube native** — transcription built in; complements `kb ingest-youtube` (which uses yt-dlp + SRT) with a simpler interface
- **LLM image description** — pass any [[openai]]-compatible client to get AI-generated image descriptions inline in the output Markdown
- **Stream-based** — no temp files, composable in-memory; suitable for webhook ingest pipelines

---

## Weaknesses

- **Not for high-fidelity rendering** — explicitly designed for LLM consumption, not document reproduction. Complex layouts (multi-column PDFs, merged Excel cells) may degrade.
- **Python 3.10+ required** — can't be called directly from Node.js CLI/[[mcp-ecosystem]] without a subprocess or separate service
- **LLM image description adds latency + cost** — optional, but worth noting for bulk ingest
- **Plugin ecosystem small** — `--use-plugins` flag needed; not many plugins yet as of early 2026

---

## Minimal Working Example

```python
from markitdown import MarkItDown

md = MarkItDown()

# PDF
result = md.convert("raw/papers/attention-is-all-you-need.pdf")
print(result.text_content)  # Clean Markdown

# YouTube URL
result = md.convert("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
print(result.text_content)  # Transcript as Markdown

# Audio file
result = md.convert("raw/transcripts/meeting-2026-04-09.mp3")
print(result.text_content)  # Speech → Markdown

# With LLM image descriptions (any OpenAI-compatible client)
from openai import OpenAI
md = MarkItDown(llm_client=OpenAI(), llm_model="gpt-4o")
result = md.convert("raw/papers/figure-heavy-paper.pdf")
# Images in the PDF get AI-generated alt text inline
```

```bash
# CLI
markitdown input.pdf > raw/papers/input.md
markitdown https://www.youtube.com/watch?v=... > raw/transcripts/video.md
cat input.docx | markitdown >> raw/framework-docs/spec.md

# Optional: Azure Document Intelligence for complex layouts
markitdown input.pdf -d -e https://your-endpoint.cognitiveservices.azure.com
```

---

## Integration Points

**Pre-processing hook for `raw/`**: Run markitdown on any non-markdown file before dropping it into `raw/`. The compile pipeline then ingests clean markdown rather than binary.

```bash
# Shell wrapper: convert-and-ingest
markitdown "$1" > "raw/$(basename $1 .pdf).md" && kb compile
```

**Webhook ingest**: The stream-based API makes markitdown composable with `/api/ingest/webhook`. Incoming binary payloads (PDF attached to a GitHub issue, DOCX from a Slack message) can be streamed through markitdown before being written to `raw/webhooks/<namespace>/`.

**YouTube**: Overlaps with existing `kb ingest-youtube` (yt-dlp + SRT). markitdown's YouTube support is simpler (one line) but produces less granular output than SRT timestamp parsing. Use markitdown for quick ingest; keep yt-dlp for transcript-annotated ingest.

**[[mcp-ecosystem]]**: An [[mcp-ecosystem]] wrapper around markitdown would let agents convert files in-context during agentic sessions without shelling out. The `DocumentConverter` stream interface is suitable for wrapping as a `convert_file` [[mcp-ecosystem]] tool.

---

## Jay's Experience

N/A — not yet used.

---

## Version Notes

- Recent versions changed `DocumentConverter` to read from file-like streams (no temp files). If you find older tutorials using file paths, update to the stream API.
- `--use-plugins` flag required for third-party plugins — they are disabled by default for security.

---

## Sources

- GitHub: https://github.com/microsoft/markitdown
- [[concepts/ingest-pipeline]] — where markitdown fits in the raw→wiki flow
- [[recipes/recipe-llm-wiki-setup]] — the ingest workflow this tool enhances
