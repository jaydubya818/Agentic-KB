---
title: Note Processing Prompts
type: personal
category: pattern
confidence: high
date: 2026-04-13
tags: [prompts, ingest, summarize, extract, note-processing, kb]
---

# Note Processing Prompts

Prompts for turning raw information into KB-ready knowledge. Used during the INGEST workflow, ad-hoc summarization, and link extraction.

---

## Summarize Source

**Use for:** Creating `wiki/summaries/{slug}.md` from a raw source.

```
Summarize the following source for the Agentic-KB wiki.

Output format (strict):
---
title: {title}
type: summary
source_file: raw/{path}
author: {author}
date_published: {YYYY-MM-DD or UNKNOWN}
date_ingested: {today}
tags: [{relevant tags from taxonomy}]
key_concepts: [{list of concepts this source touches}]
confidence: {high|medium|low}
---

## TL;DR
{1 sentence — what this source says, declaratively}

## Key Points
{5-8 bullet points — the claims worth remembering}

## Key Code or Examples
{if applicable — paste directly}

## Jay-Specific Insights
{any pattern, anti-pattern, or direct application to Jay's stack}

## Contradictions with Existing Wiki
{anything that conflicts with pages already in the KB — be specific}

Source:
{paste source content}
```

---

## Extract Concepts

**Use for:** Identifying concept and pattern pages to create or update after reading a source.

```
From the following source, extract:
1. Concepts (universal ideas that deserve a wiki/concepts/ page)
2. Patterns (reusable design solutions that deserve a wiki/patterns/ page)
3. Frameworks (tools/libraries that deserve a wiki/frameworks/ page)
4. Code examples (annotated snippets for wiki/code-examples/)

For each item: name it, give a 1-sentence definition, and note if a page already exists.

Source:
{paste content}
```

---

## Update Existing Page

**Use for:** Integrating new information into an existing concept or pattern page.

```
The following wiki page needs to be updated with new information from a source.

Rules:
- Integrate, don't append. Weave new information into the existing structure.
- If the new info contradicts existing claims, add a [CONTRADICTION] note inline.
- Update the confidence level if the new source changes it.
- Update the `updated` date.
- Do NOT change the page's fundamental structure or voice.

Existing page:
{paste current page content}

New information to integrate:
{paste new content or bullet points}
```

---

## Generate Cross-Links

**Use for:** Finding wiki links to add to a new or existing page.

```
For the following wiki page, identify every proper noun (concept, pattern, framework, person, project) 
that has or should have a wiki page in the Agentic-KB.

For each: suggest the wiki link format [[path/to/page|Display Name]].
Flag any terms that don't yet have a page (gap candidates).

Only flag the FIRST MENTION of each term — not repeats.

Page content:
{paste content}
```

---

## Contradiction Check

**Use for:** Before committing a new claim, checking it against existing wiki content.

```
The following claim is about to be added to the Agentic-KB wiki.
Check it against these existing pages and identify any contradictions:

New claim: {claim}

Existing pages to check:
{paste 2-3 relevant existing page summaries}

Output:
- CONSISTENT: the claim aligns with existing content
- CONTRADICTS: {which page}, {what it says}, {which is more likely correct and why}
- EXTENDS: the claim adds new information without contradicting anything
```

---

## Frontmatter Generator

**Use for:** Generating correct frontmatter for a new page.

```
Generate the correct YAML frontmatter for a new {concept|pattern|framework|recipe|summary|synthesis|personal} 
page with the following characteristics:

Title: {title}
Topic: {brief description}
Sources: {list source slugs if any}
Confidence: {what level and why}
Tags: {suggest from the taxonomy}

Use the schema from CLAUDE.md. Fill every required field. Default `tested: false` for recipes.
```

---

## Related

- [[prompt-library/index|Prompt Library]] ← parent
- [[mocs/knowledge-workflows|Knowledge Workflows]] — INGEST workflow
- [[mocs/automation|Automation]] — Auto-INGEST patterns
- [[CLAUDE.md]] — Schema reference
