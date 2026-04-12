# Research Skill Graph — Command Center

## 1. Mission

Deep research system that takes ONE question and produces a multi-angle analysis no single Google search or ChatGPT prompt could match.

Forces structured thinking through 6 research lenses, each rethinking the question from a fundamentally different angle.

---

## Active Research

**Research Question:** [PASTE YOUR QUESTION HERE]
**Scope:** [what's in, what's out — be specific]
**Time Horizon:** [how far back and forward are we looking?]
**Output Goal:** [what decision does this research inform?]
**Framework:** [check [[methodology/research-frameworks]] — Type 1/2/3/4?]

**Prior Research:** Check [[research-log]] for related projects. Relevant prior work: [link or "clean slate"]

---

## 2. Node Map

### Methodology (read before executing)
- [[methodology/research-frameworks]] — pick the right approach for this question type. START HERE.
- [[methodology/source-evaluation]] — tier system from primary data to anecdote. every claim needs a tier.
- [[methodology/synthesis-rules]] — combine findings without flattening them. the hardest step.
- [[methodology/contradiction-protocol]] — what to do when sources or lenses disagree. tensions = insights.

### Lenses (the core engine — run in order)
- [[lenses/technical]] — what do the numbers say? mechanisms only, no narrative
- [[lenses/economic]] — follow the money. who pays, who profits, what incentives drive behavior
- [[lenses/historical]] — what patterns repeat? what context is everyone forgetting?
- [[lenses/geopolitical]] — global chessboard. which countries, which power dynamics
- [[lenses/contrarian]] — what if the consensus is wrong? who benefits from the current narrative?
- [[lenses/first-principles]] — forget everything. rebuild from fundamental truths only

### Outputs (written to projects/{topic}/)
- executive-summary.md — 500 words max. what did we learn, what does it mean, what's still unknown
- deep-dive.md — full analysis by lens, contradictions highlighted
- key-players.md — people, organizations, countries that matter most
- open-questions.md — what we STILL don't know. often more valuable than what we found

### Knowledge Base (append-only, accumulates across all projects)
- [[knowledge/concepts]] — key terms, definitions, mental models. grows with every project
- [[knowledge/data-points]] — hard numbers with source attribution. never re-find the same stat twice

### Sources
- [[sources/source-template]] — template for processing raw sources into structured notes

---

## 3. Execution Instructions

When given a research question:

1. Read this file completely. Understand the scope and goal.
2. Read [[methodology/research-frameworks]] — pick the right approach type (1/2/3/4).
3. Read [[methodology/source-evaluation]] — know what counts as good evidence before searching.
4. For EACH lens in order (technical → economic → historical → geopolitical → contrarian → first-principles):
   a. Read the lens file for its specific angle and core questions
   b. Research the topic THROUGH that lens only — stay in lane
   c. Record findings in `projects/{topic}/lens-{name}.md`
   d. Note any contradictions with previous lenses
5. Read [[methodology/contradiction-protocol]] — resolve or document disagreements
6. Read [[methodology/synthesis-rules]] — combine everything
7. Write all 4 output files to `projects/{topic}/`
8. Append summary to [[research-log]]
9. Update [[knowledge/concepts]] and [[knowledge/data-points]] with everything new

**CRITICAL RULE:** Each lens must RETHINK the question, not just add more information.
Technical and contrarian should feel like they were written by two researchers who disagree.
That tension is where insight lives. If all lenses agree, re-read [[lenses/contrarian]] and try harder.
