---
title: Reflection & Synthesis Prompts
type: personal
category: pattern
confidence: high
date: 2026-04-13
tags: [prompts, reflection, synthesis, retrospective, session-debrief, patterns]
---

# Reflection & Synthesis Prompts

Prompts for extracting durable knowledge from experience. Used for session debriefs, retrospectives, cross-note synthesis, and pattern extraction from war stories.

---

## Session Debrief

**Use for:** Closing a Claude session with durable takeaways.

```
Debrief this session. Output:

1. What was accomplished (concrete artifacts created or problems solved)
2. What was learned (new knowledge, confirmed assumptions, updated beliefs)
3. What was decided (explicit decisions made and their rationale)
4. Open threads (tasks unfinished, questions unanswered)
5. Lessons worth writing to wiki/personal/ (validated patterns or anti-patterns)
6. What to load first next session (hot cache update suggestions)

Session summary: {brief description of what this session covered}
Key events: {list of major actions taken}
```

**When to use:** End of every major work session. Takes 2 minutes. Prevents context loss between sessions.

---

## War Story Extraction

**Use for:** Turning a painful experience into a wiki/personal/ page.

```
Turn the following experience into a validated pattern or anti-pattern for the personal/ section of the Agentic-KB.

Format:
---
title: {Pattern Name — active verb form, e.g., "Always Validate Tool Output Before Writing"}
type: personal
category: {pattern|anti-pattern|lesson|war-story}
confidence: {high if repeatable, medium if one occurrence}
date: {today}
---

## The Story (2-3 sentences — what happened)

## The Pattern (1 sentence — the generalized lesson)

## When It Applies (conditions)

## The Failure Mode (what happens when you ignore it)

## Evidence (this session or other sessions where this applied)

Experience to process:
{describe what happened}
```

---

## Cross-Note Synthesis

**Use for:** Finding synthesis opportunities across existing wiki pages.

```
Given the following {N} wiki pages, identify:
1. The central tension — where do these pages disagree or pull in different directions?
2. The synthesis point — what single insight resolves or transcends the tension?
3. The remaining open question — what do these pages together still not answer?

Write a synthesis in the voice of the Agentic-KB writing style guide:
- Opinionated and direct
- Declarative sentences
- No filler intros
- State a position

Pages:
{paste page content or summaries}
```

---

## Pattern Extraction

**Use for:** Distilling a pattern from multiple instances.

```
The following {N} examples all solved a similar problem differently.
Extract the underlying pattern:

1. The common problem structure
2. The common solution structure  
3. The key variables (what changes across instances)
4. The key invariants (what must stay the same)
5. The failure mode (what breaks the pattern)

Format as a wiki/patterns/ page stub.

Examples:
{example 1}
{example 2}
{example 3}
```

---

## Belief Update

**Use for:** Formalizing a changed position.

```
I previously believed: {old belief}
New evidence: {what changed}
I now believe: {new belief}
Confidence change: {from X to Y, because}
What would make me revert: {conditions}

Write this as an update to the relevant wiki page, including a note that the position has evolved and why.
```

---

## Weekly KB Reflection

**Use for:** Weekly session to keep the KB alive and growing.

```
Weekly KB reflection for the week of {date}.

1. What new raw sources were added? (list them)
2. What concepts were referenced most this week? (candidates for hot.md update)
3. What questions came up that the KB couldn't answer? (gap candidates)
4. What decisions were made? (candidates for decision record pages)
5. What patterns were validated? (candidates for promotion from medium → high confidence)
6. What should be retired or deprecated? (stale pages)

Recommend:
- 1 hot.md update
- 1 gap to fill (highest value missing page)
- 1 page to promote (confidence upgrade)
```

---

## Related

- [[prompt-library/index|Prompt Library]] ← parent
- [[prompt-library/thinking-tools|Thinking Tools]] — /synthesize
- [[mocs/daily-systems|Daily Systems]] — Weekly review cadence
- [[mocs/knowledge-workflows|Knowledge Workflows]] — How synthesis fits the workflow
- [[personal/hermes-operating-context]] — Durable lessons section
