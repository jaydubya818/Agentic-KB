---
id: 01KNNVX2RGZVEPCXJK6WKPNKFR
title: "Architecture: compile-pipeline"
source: oh-my-mermaid
ingested: 2026-04-08T05:01:57Z
tags: [architecture, mermaid, autogen]
omm_perspective: "compile-pipeline"
---

# compile-pipeline

The compile pipeline is the Karpathy LLM-Wiki core. Raw docs in raw/ are read, deduplicated against raw/.compiled-log.json, batched to Claude with wiki/schema.md as the system prompt, and written back as structured wiki pages. Each run appends to wiki/log.md. Streams SSE progress so the web UI CompilePanel shows live status. Incremental by default — full recompile is explicit.

## Diagram

```mermaid
flowchart TB
    START([User clicks Compile New]) -->|POST SSE| API[/api/compile/]
    API -->|read| RAW[(raw/**/*.md)]
    API -->|read state| LOG[(raw/.compiled-log.json)]
    API -->|filter| NEW{New or<br/>changed?}
    NEW -->|no| DONE([SSE done event])
    NEW -->|yes| BATCH[Batch with<br/>wiki/schema.md]
    BATCH -->|prompt| CLAUDE{{Claude API}}
    CLAUDE -->|JSON ops| WRITE[Write<br/>wiki/**.md]
    WRITE -->|progress| SSE[SSE event stream]
    SSE -->|rendered| UI[CompilePanel]
    WRITE -->|loop| NEW
    WRITE -->|append| RUNLOG[(wiki/log.md)]
    WRITE -->|save state| LOG
    DONE --> UI
```

