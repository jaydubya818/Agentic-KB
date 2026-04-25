---
id: 01KQ2ZGVPRC1Y9KV7DEY6D2WZR
title: Skills
type: concept
tags: [agents, architecture, context, knowledge-base, workflow]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
---

# Skills

## Definition

Skills are modular, self-contained packages that extend an agent's capabilities by providing specialized knowledge, workflows, and tool integrations. Think of them as "onboarding guides" for specific domains or tasks — they transform a general-purpose LLM into a specialized agent equipped with procedural knowledge that no model can fully possess out of the box.

Each skill is triggered by its metadata description and only loaded into context when relevant, making them a token-efficient mechanism for capability extension.

## Why It Matters

LLMs are generalists. Skills let you encode:

- **Domain expertise** — company-specific knowledge, schemas, business logic
- **Specialized workflows** — multi-step procedures for repeatable tasks
- **Tool integrations** — instructions for specific APIs or file formats
- **Bundled resources** — scripts, references, and assets for complex or repetitive tasks

Because the [context window](context-management.md) is shared across the system prompt, conversation history, skill metadata, and the user request, skills must justify their token cost. The guiding principle: **Claude is already very smart — only add context Claude doesn't already have.**

## Anatomy of a Skill

Every skill has a required `SKILL.md` file and optional bundled resources:

```
skill-name/
├── SKILL.md                  (required)
│   ├── YAML frontmatter      (name, description)
│   └── Markdown instructions
└── Bundled Resources/        (optional)
    ├── scripts/              Executable code (Python/Bash/etc.)
    ├── references/           Documentation loaded into context as needed
    └── assets/               Templates, icons, fonts, etc.
```

### SKILL.md

- **Frontmatter**: `name` and `description` fields only. These are what the agent reads to decide whether to trigger the skill — be clear and comprehensive here.
- **Body**: Instructions loaded *after* the skill triggers. This is where procedural guidance lives.

### Bundled Resources

| Type | Purpose | When to Include |
|---|---|---|
| `scripts/` | Deterministic executable code | When the same logic is rewritten repeatedly or reliability is critical |
| `references/` | Documentation loaded into context as needed | When a skill needs reference material too large to inline |
| `assets/` | Output files (templates, icons) | When the skill produces structured artifacts |

Scripts are particularly valuable: they are token-efficient, deterministic, and may be executed without loading into context.

## Degrees of Freedom

Match the specificity of skill instructions to the task's fragility and variability:

| Level | Format | Use When |
|---|---|---|
| **High freedom** | Prose instructions | Multiple valid approaches, context-dependent decisions |
| **Medium freedom** | Pseudocode or parameterized scripts | A preferred pattern exists but variation is acceptable |
| **Low freedom** | Specific scripts, few parameters | Operations are fragile, consistency is critical, order matters |

> Think of Claude as navigating a path: a narrow bridge with cliffs needs specific guardrails (low freedom), while an open field allows many routes (high freedom).

## Example

A `rotate-pdf` skill might include:
- `SKILL.md` with a description like "Use this skill when the user wants to rotate pages in a PDF file"
- `scripts/rotate_pdf.py` — a deterministic Python script the agent can invoke directly

This keeps the skill's footprint small and the behavior reliable.

## Common Pitfalls

- **Over-explaining**: Don't add context Claude already has from pretraining. Every token competes with real task content.
- **Vague descriptions**: The `description` frontmatter field is the only thing that triggers skill selection — if it's ambiguous, the skill won't fire at the right time.
- **Monolithic skills**: Skills should be modular. A skill that tries to do too much becomes a maintenance burden and uses tokens indiscriminately.

## See Also

- [Context Management](context-management.md)
- [Agent Loops](agent-loops.md)
- [Memory Systems](memory-systems.md)
- [LLM-Owned Wiki](llm-owned-wiki.md)
