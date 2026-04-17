---
name: autoresearch
description: >
  Run a bounded autonomous research loop against the Agentic-KB. Given a topic,
  repeatedly identify gaps, pull web sources, stub them into raw/, INGEST, and
  re-evaluate until the loop saturates (no new concepts) or hits a hard cap.
  Use when the user asks to "autoresearch", "deep-dive", "auto-ingest", or
  "build out the wiki on <topic>" and wants it done without manual round-trips.
triggers:
  - "autoresearch"
  - "/autoresearch"
  - "auto research"
  - "deep dive on"
  - "build out the wiki on"
  - "auto-ingest"
  - "research loop"
---

# Autoresearch — Bounded Multi-Round KB Expansion

You are executing an autonomous research loop against Jay's Agentic-KB. The loop
combines the **BACKFILL** and **INGEST** workflows already defined in the
KB's `CLAUDE.md` into a bounded agent cycle that terminates on saturation.

**This skill does NOT introduce new infrastructure.** It orchestrates existing
primitives: `WebSearch`, `WebFetch`, raw/ stub creation, `kb ingest-file`,
`wiki/index.md` reads, and `wiki/log.md` appends. Do not build a parallel
toolchain. Do not modify the KB schema.

---

## Config

Collect these before starting. Ask only for what's missing.

```
topic              (required)   The subject to research.
max_rounds         (default 3)  Hard cap on loop iterations.
pages_per_round    (default 5)  Max raw/ stubs created per round.
source_allowlist   (default []) Domains the user trusts. Empty = any.
source_denylist    (default []) Domains to skip.
mode               (default wiki)  'wiki' = full INGEST into wiki/.
                                   'raw-only' = stage in raw/, don't INGEST yet.
dry_run            (default no) If yes, list planned fetches but don't write.
```

If the user says "autoresearch X" with no other config, use defaults and tell
them the config you chose in one line before starting.

---

## Loop Contract

For `round ∈ 1..max_rounds`:

1. **Gap detection.** Read `wiki/index.md` and any existing pages whose title
   or tags intersect `topic`. Produce an explicit gap list: concepts referenced
   but not yet documented, frameworks mentioned with no framework page,
   `[UNVERIFIED]` markers, stale `last_checked` dates, and `[[wiki-links]]`
   that resolve to nothing. If round > 1, diff against the previous gap list.

2. **Query formulation.** For each gap, generate one precise search query. Do
   not broaden to the parent topic — that was last round. Drop any query that
   matches a query already run this session.

3. **Fetch.** Run up to `pages_per_round` `WebSearch` + `WebFetch` calls in
   parallel. Skip domains in `source_denylist`; require `source_allowlist` if
   non-empty. If a fetch fails, log it and continue — never retry via bash.

4. **Raw stubs.** For each accepted source, write to
   `raw/framework-docs/{slug}.md` (or the most fitting raw/ subdir) with the
   full source frontmatter: `source_url`, `author`, `date_published`,
   `date_ingested`, `tags`. One source = one raw file. Never modify existing
   raw/ files — create-only.

5. **INGEST.** Unless `mode=raw-only`, run the KB's INGEST workflow on each
   new raw file: create `wiki/summaries/{slug}.md`, update or create the
   relevant concept/pattern/framework pages, cross-link bidirectionally,
   update `wiki/index.md`, append to `wiki/log.md`, and add an entry to
   `wiki/recently-added.md` under today's heading.

6. **Saturation check.** Compute `new_concepts = (concepts after round) −
   (concepts before round)`. If `new_concepts == 0`, HALT. Otherwise continue.

7. **Round log.** Append one block to `wiki/log.md`:
   ```
   ## autoresearch {YYYY-MM-DD HH:MM} — round N/{max_rounds}
   topic: {topic}
   queries: [...]
   raw_created: [...]
   wiki_pages_created: [...]
   wiki_pages_updated: [...]
   new_concepts: N
   contradictions: [...]
   ```

---

## Halt Conditions (any triggers exit)

- `round == max_rounds`
- `new_concepts == 0` in the most recent round (saturation)
- Every query in step 2 is a duplicate of one already run
- User interrupts
- Rate limit / repeated fetch failure (≥3 consecutive failures → halt, don't
  silently degrade)

On halt, emit a **final report** (see Output Contract).

---

## Safety Rules

1. **Never modify `raw/`** — create-only. Existing files are immutable per the
   KB rules.
2. **Respect allowlist/denylist** before every fetch.
3. **Confidence honesty** — new pages default to `confidence: medium` unless
   ≥2 independent sources corroborate the core claim. Downgrade to `low` when
   a single low-authority source is the only evidence.
4. **Reviewed flag stays false** — every page autoresearch creates or updates
   must have `reviewed: false` and an empty `reviewed_date: ""`. Never flip to
   `true` — that is Jay's signature. Automation does not sign.
5. **Counter-arguments are mandatory** — every concept and synthesis page this
   skill creates must include a `Counter-arguments & Gaps` section. If the
   sources all agree, the section names what they do NOT show and what would
   change the verdict. One-sided compilation is a failure mode, not an output.
6. **Contradictions** — if a new source contradicts an existing wiki claim,
   add an inline `> [!contradiction] source vs. {existing-page}` block AND
   record it in the round log. Never silently overwrite.
7. **No orphan pages** — every new wiki page gets ≥1 inbound link before the
   round closes. If you cannot find a parent, link from the relevant MoC in
   `wiki/mocs/` or from `wiki/index.md`.
8. **No hallucinated sources** — every citation resolves to a real fetched
   URL in raw/. If a claim lacks a source, mark `[UNVERIFIED]`.
9. **Hot cache discipline** — do not touch `wiki/hot.md`. Hot-cache promotion
   is a separate, human-approved decision.

---

## Output Contract — Final Report

When the loop halts, produce this exact shape (markdown, save to
`outputs/autoresearch-{topic-slug}-{YYYY-MM-DD}.md`):

```
# Autoresearch: {topic}

Run: {YYYY-MM-DD HH:MM}  |  Rounds: {N}/{max_rounds}  |  Halt: {reason}

## Summary
{2-3 sentences: what was known before, what was added, what the wiki now
says that it didn't.}

## Raw sources added ({count})
- [[raw/.../slug.md]] — {title} ({domain}) — confidence: {high|medium|low}

## Wiki pages created ({count})
- [[wiki/.../slug.md]] — {type} — 1-line purpose

## Wiki pages updated ({count})
- [[wiki/.../slug.md]] — {what changed in ≤10 words}

## Contradictions surfaced ({count})
- {existing claim} vs {new source} → decision: {keep|flag|re-verify}

## Remaining gaps (not fetched — user decision needed)
- {gap} — reason not fetched (rate limit | denylist | ambiguous | low-confidence)

## Next-step suggestions
1. {concrete action with owner — Jay or a follow-up autoresearch run}
```

Do not embed raw source bodies in the report — link to them.

---

## Anti-Patterns (never do these)

- Running more than `max_rounds` "just to be thorough" — the cap exists so the
  loop terminates deterministically.
- Ingesting a source that matches an existing raw file slug — collisions mean
  stop and rename, not overwrite.
- Touching files outside `raw/`, `wiki/`, and `outputs/`.
- Calling `kb compile` or `/graphify` inside the loop — those are post-run
  steps the user invokes explicitly.
- Emitting the final report before writing it to `outputs/` — save first, then
  print the path.

---

## Invocation Example

```
User: /autoresearch supervisor-worker multi-agent patterns
       max_rounds=2 pages_per_round=4 source_allowlist=[arxiv.org,anthropic.com]

Agent: Starting autoresearch.
       topic=supervisor-worker multi-agent patterns
       max_rounds=2 pages_per_round=4
       allowlist=[arxiv.org, anthropic.com]
       mode=wiki dry_run=no

       — Round 1 —
       gap list: [3 items]  queries: [...]  raw added: 4  wiki updated: 7
       new_concepts: 5 — continue

       — Round 2 —
       gap list: [2 items]  queries: [...]  raw added: 2  wiki updated: 3
       new_concepts: 0 — HALT (saturation)

       Report → outputs/autoresearch-supervisor-worker-2026-04-17.md
```

---

## Activation Confirmation

When this skill is invoked, respond with:

> **Autoresearch active.** I'll run a bounded loop against the KB on `{topic}`
> using `max_rounds={N}` and `pages_per_round={M}`. I will stop on saturation
> or the cap, whichever comes first. Save the final report to `outputs/`.
> Proceed?

Then wait for confirmation before the first `WebSearch` call.
