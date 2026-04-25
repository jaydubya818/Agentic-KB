---
description: Ask a question across the wiki and personal vault — every claim cites its source.
allowed-tools: Bash, Read
argument-hint: <question in quotes>
---

# /foundry-ask

Query the knowledge base. Citations are required on every claim.

## What it does

1. Shell out to `kb query "$ARGUMENTS"` — runs the existing graph-search + temporal decay + hotness ranking + token-budget packing pipeline.
2. Stream the answer.
3. **Citation enforcement**: count distinct `[[wiki/...]]` and `[wiki/...]` references in the answer. If < 2, prepend a warning header.
4. Append a `[citation_count: N | sources: …]` footer.

## How to run it

```bash
kb query "$ARGUMENTS" --scope all
```

If `$ARGUMENTS` is empty, ask the user for the question rather than guessing.

## Output shape

```
[citation OK · 4 sources]

The two-vault pattern separates a personal vault that the user writes in from
an agent vault that Claude maintains, with a one-way read-only rule between
them. See [[concepts/two-vault-pattern]] and the Foundry write-up at
[[summaries/jamees-foundry]]. Karpathy's original LLM-Wiki gist
([[summaries/karpathy-llm-wiki]]) is the design ancestor, while Sofie applied
a similar separation between meeting notes and engineering KB
([[entities/sofie]]).

[citation_count: 4 | sources: concepts/two-vault-pattern, summaries/jamees-foundry,
                              summaries/karpathy-llm-wiki, entities/sofie]
```

If citations < 2:

```
⚠️  CITATION WARNING — answer cites < 2 sources. Treat as low-confidence.

<answer>

[citation_count: 1 | sources: ...]
```

## Refuse list

- Do NOT answer without running `kb query`. No freelancing from training.
- Do NOT invent wiki page links. Only cite pages that exist.
- Do NOT drop the citation footer.
- Do NOT read from the personal vault unless `kb query` returned a personal-vault hit. The personal vault is read-only context, not a primary source.

## Related

`/foundry-compile` is what populates the corpus this command searches.
`/foundry-lint` flags low-citation pages that may need more sources.
