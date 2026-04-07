---
title: "Building a Trading Strategies LLM Knowledge Base (Karpathy Pattern)"
source: YouTube video transcript
author: Unknown (trading-focused channel)
date: 2026-04
tags: [llm-wiki, karpathy, knowledge-base, obsidian, claude-code]
---

# Transcript: Building a Trading Strategies LLM Knowledge Base

## Key Concepts Covered
- Karpathy's LLM wiki pattern explained
- Three-layer architecture: raw sources, wiki, schema
- Core operations: ingest, query, lint
- Division of labor: human curates, LLM maintains
- Four principles: explicit, yours, file-over-app, bring-your-own-AI
- Live build demo in Claude Code using opus 4.6
- Obsidian as IDE/frontend
- Querying the wiki and automatic backfilling

## Raw Transcript

Chapter 1: Intro - Andrej Karpathy's tweet and the concept of LLM knowledge bases
So, I'm sure many of you saw this tweet from Andre Karpathy last week talking about LLM knowledge bases. It caught a lot of interest as kind of a new way to use AI as a research tool. And the core concept was to use LLMs to build personal knowledge bases for various topics of your research interest.

Chapter 2: The problem with RAG and why LLM-powered wikis are better
Right now most people's experience with LLMs and documents look like RAG — retrieval automated generation. You upload some files to ChatGPT or NotebookLM or whatever tool and when you ask a question it retrieves some chunks and generates an answer. And that works fine for simple questions. But here's the issue. Nothing accumulates. Every time you ask a question, the LLM is rediscovering knowledge from scratch. It's reweaving together fragments every single time.

But this LLM-powered wiki pattern flips this. Instead of retrieving at query time, the LLM builds a persistent interlinked wiki up front. The cross references are already there. Contradictions are already flagged. The synthesis already reflects everything you've already fed it. Knowledge compounds instead of being thrown away after each conversation.

The LLM incrementally builds and maintains a persistent wiki of structured interlinked markdown files sitting between you and your raw sources. You never write the wiki yourself. The LLM writes and maintains all of it. You're in charge of the important stuff — finding the good sources, exploring, asking the right questions. The LLM handles all the grunt work.

Chapter 3: Three-layer architecture
Raw sources — articles, papers, images, data sets. These are immutable. The LLM reads them but never touches them.
Wiki — directory of markdown files the LLM owns entirely. Summaries, entity pages, concept pages, comparisons.
Schema — the configuration file (CLAUDE.md) that tells the LLM how the wiki is structured, what conventions to follow.

The wiki is a codebase. Obsidian is the IDE. The LLM is the programmer. The schema is the style guide.

Chapter 4: Core operations
Ingest: Drop a new source into raw/, tell LLM to process it. Reads source, writes summary, updates index, cross-links across 10-15 wiki pages.
Query: Ask questions against the wiki. Good answers get filed back as new pages — explorations compound.
Lint: Maintenance pass. Find contradictions, stale claims, orphan pages, missing cross-references, gaps for web search.

Chapter 5: Division of labor
Human: Pick sources, direct analysis, ask good questions, decide what matters.
LLM: Writes all wiki pages, keeps cross-references up to date, flags contradictions.
Humans abandon wikis because maintenance burden grows faster than value. LLMs don't get bored. They can touch 15 files in a single pass. Cost of maintenance drops to near zero.

Chapter 6: Four principles
1. Explicit — knowledge is visible in a navigable wiki
2. Yours — local files, not locked into any provider
3. File over app — markdown, works with any tool, any CLI, any viewer
4. Bring your own AI — plug in Claude, GPT, open source, even fine-tune

Chapter 7: What you can build
Research, personal second brain, business internal wiki, reading/book notes, due diligence.

Chapter 8: Live build in Claude Code
Used opus 4.6. Built trading strategies wiki. Created: market structure concepts, strategy pages, psychology pages, entity pages for prop firms. Ingested 8 raw transcripts using parallel agents.
