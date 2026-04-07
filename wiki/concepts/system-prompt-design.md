---
title: System Prompt Design
type: concept
tags: [agentic, prompting, system-prompt, persona, constraints, format]
confidence: high
sources:
  - "Anthropic: System prompts best practices (2025)"
  - "OpenAI: GPT-4 system prompt guidelines"
  - "Prompt engineering survey: Schulhoff et al. (2024)"
created: 2026-04-04
updated: 2026-04-04
related:
  - "[[concepts/few-shot-prompting]]"
  - "[[concepts/chain-of-thought]]"
  - "[[concepts/guardrails]]"
  - "[[concepts/permission-modes]]"
  - "[[patterns/pattern-tool-schema]]"
status: stable
---

## TL;DR

The system prompt is the most leveraged token in any agent deployment. It defines the model's role, constraints, output format, and reasoning style for the entire session. A 500-token system prompt can make or break a 50-turn agent session. Treat it like production code — version-controlled, tested, iterated.

---

## Definition

A system prompt is the pre-conversation instruction set injected at the start of an LLM session (before any user messages) that defines persistent behavior, persona, constraints, and output expectations. It's the "firmware" of an agent.

---

## How It Works

### The Model's Attention Pattern

The system prompt receives disproportionate attention weight at the start of context. Its influence decays in very long conversations — instructions at token position 0 are less reliable at turn 50 than at turn 1. Design critical constraints to be reinforceable: either re-inject them periodically or make them so specific they're unlikely to drift.

Claude specifically has constitutional training that makes it attend well to system prompts, but this isn't unlimited. Test your system prompt under adversarial user inputs and long conversation scenarios.

### Section Ordering

Ordering within the system prompt affects model behavior. Empirical guidance:

1. **Role / Identity** — first, because it frames how everything else is interpreted
2. **Primary objective** — what the agent is supposed to do
3. **Constraints and prohibitions** — what it must never do
4. **Output format specification** — how to structure responses
5. **Tool usage guidelines** — when and how to use available tools
6. **Dynamic context injection** — session-specific state (task details, user info)
7. **Examples** (if using few-shot) — last, as a closing demonstration

Putting constraints after a long persona definition tends to weaken them. Putting them early creates stronger anchoring.

### Role Definition

Good role definitions are specific and functional, not just descriptive:

**Weak**: "You are a helpful coding assistant."

**Strong**:
```
You are a senior backend engineer specializing in TypeScript and PostgreSQL.
Your job is to implement features in this codebase following the existing patterns.
You write production-ready code: typed, tested, error-handled.
You ask ONE clarifying question before starting work if the requirements are ambiguous.
You do not modify files outside the scope of the assigned task without explicit approval.
```

The strong version encodes: expertise domain, primary job, quality bar, disambiguation protocol, and scope boundaries.

### Constraints and Prohibitions

State constraints as behavioral rules, not ethical lectures:

**Weak**: "Be careful with user data."

**Strong**: "Never log, store, or include in any output the raw values of: passwords, API keys, tokens, or PII (email, name, phone). If you receive these in tool output, refer to them only by type (e.g., 'the API key') in your reasoning."

Constraints should be:
- **Specific and verifiable** — testable in eval, not aspirational
- **Prioritized** — put the non-negotiables first
- **Positive when possible** — "always validate inputs" vs "don't forget to validate"

### Output Format Specification

If you need structured output, specify it completely:

```
Respond in this exact format:
---
STATUS: [COMPLETED | FAILED | BLOCKED]
SUMMARY: One sentence describing what was done.
CHANGES:
  - <file_path>: <what changed>
NEXT_ACTION: [what the caller should do next, or "none"]
---
```

Include the field names, permitted values, and an example if the format is non-obvious. Ambiguous format specs produce ambiguous output.

### Injecting Dynamic Context

Some context changes per session (current task, user preferences, session state). Use a dedicated section:

```
=== CURRENT SESSION CONTEXT ===
Task ID: TASK-4821
Working directory: /Users/jaywest/projects/my-app
Active branch: feature/auth-overhaul
Completed steps: [read existing auth, analyzed gaps]
Current step: Implement JWT refresh token logic
Constraints: Do not modify the User model schema — it's locked for this sprint
=== END CONTEXT ===
```

Delimiters (=== or --- or XML tags) help the model distinguish dynamic context from the persistent role definition. This matters in long prompts where visual structure helps parsing.

### Persona Design

Personas work when they're grounded in behavioral differences, not just descriptions:

- "Be terse" → measurable (response length)
- "Be skeptical" → measurable (ask clarifying questions, don't assume)
- "Be cautious" → measurable (ask before destructive operations)

Personas that are purely aesthetic ("be friendly, warm, and helpful") have weak behavioral impact compared to task-grounded ones.

---

## System Prompt Length Tradeoffs

| Length | Benefit | Risk |
|--------|---------|------|
| < 200 tokens | Low overhead, model has room to reason | Under-constrained, inconsistent behavior |
| 200-800 tokens | Good coverage of role + constraints | — |
| 800-2000 tokens | Can include examples, detailed procedures | Attention dilution on long sessions |
| > 2000 tokens | Complete operational handbook | Model may not attend to all of it; key constraints can get lost |

For agents with long sessions: prefer shorter, more focused system prompts. Use skills/tools to inject specialized instructions when needed, rather than front-loading everything.

### Prompt Caching

Anthropic supports prompt caching — if the system prompt is identical across requests, the token processing cost is dramatically reduced (cached tokens cost ~10% of regular). Design system prompts to be stable across a session; inject dynamic content at the user turn, not in the system prompt, to maximize cache hits.

---

## Testing System Prompts

Treat system prompts as code:

1. **Unit test** individual constraints: "Does the agent refuse to log passwords?"
2. **Regression test** after changes: "Did adding the new tool guidance break the format constraint?"
3. **Adversarial test**: Try to get the agent to violate its constraints through user messages
4. **Long-session test**: Run a 20-turn session and check if behavior holds at turn 15-20

---

## When To Use

- Every deployed agent should have a system prompt (no exceptions)
- Every system prompt should be version-controlled
- Iterate system prompts based on observed failures, not intuition

## Risks & Pitfalls

- **Prompt injection via user input**: User sends "Ignore previous instructions and..." System prompts should be robust to injection. Test for this.
- **Constraint staleness**: Codebase changes, constraints don't. The model operates on outdated rules. Pin system prompts to a release process.
- **Overcrowding**: Trying to put everything in the system prompt. Use tools and skills to offload specialized knowledge.
- **Vague objectives**: "Be helpful with data analysis" — helpful how? What kind of data? What counts as good analysis? Specificity is everything.

---

## Related Concepts

- [[concepts/few-shot-prompting]] — embedding examples in the system prompt
- [[concepts/chain-of-thought]] — prompting for visible reasoning
- [[concepts/guardrails]] — enforcement mechanisms beyond the prompt
- [[patterns/pattern-tool-schema]] — tool descriptions as sub-prompts

---

## Sources

- Anthropic System Prompts best practices (2025)
- Schulhoff et al. "The Prompt Report: A Systematic Survey of Prompting Techniques" (2024)
- OpenAI GPT-4 technical report system prompt guidelines
