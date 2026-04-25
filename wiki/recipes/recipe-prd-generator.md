---
id: 01KQ2Z9PTC8Y30Q5V9EAPQWBG2
title: "PRD Generator Skill"
type: recipe
tags: [workflow, automation, agents, patterns]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
source: my-skills/prd-skill.md
related: [pattern-supervisor-worker, concepts/human-in-the-loop]
---

# PRD Generator Skill

A structured skill (agent prompt) for generating Product Requirements Documents (PRDs) from a feature description. Designed to be triggered by an agent or user and outputs a ready-to-implement spec file.

---

## When to Use

- Planning a new feature before implementation begins
- Starting a new project that needs formal requirements
- When a user says: *"create a PRD"*, *"write PRD for"*, *"plan this feature"*, *"requirements for"*, *"spec out"*

> **Important:** This skill generates the PRD only — it does **not** begin implementation.

---

## Step 1 — Clarifying Questions

Before writing the PRD, ask **3–5 essential clarifying questions** using a lettered-option format. This allows quick responses like `"1A, 2C, 3B"`.

Focus areas:
- **Problem/Goal:** What problem does this solve?
- **Core Functionality:** What are the key actions?
- **Scope/Boundaries:** What should it NOT do?
- **Success Criteria:** How do we know it's done?

### Example Format

```
1. What is the primary goal of this feature?
   A. Improve user onboarding experience
   B. Increase user retention
   C. Reduce support burden
   D. Other: [please specify]

2. Who is the target user?
   A. New users only
   B. Existing users only
   C. All users
   D. Admin users only
```

---

## Step 2 — PRD Structure

Generate the PRD with these required sections:

| # | Section | Notes |
|---|---|---|
| 1 | **Introduction/Overview** | Feature description and problem it solves |
| 2 | **Goals** | Specific, measurable objectives (bullet list) |
| 3 | **User Stories** | Formatted as US-001, US-002, etc. with acceptance criteria |
| 4 | **Functional Requirements** | Numbered FR-1, FR-2... — explicit and unambiguous |
| 5 | **Non-Goals (Out of Scope)** | What this will NOT include |
| 6 | **Design Considerations** *(optional)* | UI/UX notes, mockup links, reusable components |
| 7 | **Technical Considerations** *(optional)* | Constraints, dependencies, integration points |
| 8 | **Success Metrics** | Measurable outcomes (e.g. "reduce time by 50%") |
| 9 | **Open Questions** | Remaining unknowns |

### User Story Format

```markdown
### US-001: [Title]
**Description:** As a [user], I want [feature] so that [benefit].

**Acceptance Criteria:**
- [ ] Specific verifiable criterion
- [ ] Another criterion
- [ ] Typecheck/lint passes
- [ ] **[UI stories only]** Verify in browser using dev-browser skill
```

> **Rule:** Acceptance criteria must be **verifiable**, not vague. ❌ "Works correctly" → ✅ "Button shows confirmation dialog before deleting"

---

## Writing Style Guidelines

The PRD reader may be a junior developer or AI agent. Therefore:

- Be explicit and unambiguous
- Avoid jargon, or explain it
- Number all requirements for easy reference
- Use concrete examples where helpful
- Each user story should be small enough to implement in **one focused session**

---

## Output

- **Format:** Markdown (`.md`)
- **Location:** `tasks/`
- **Filename:** `prd-[feature-name].md` (kebab-case)

---

## See Also

- [Human-in-the-Loop](../concepts/human-in-the-loop.md) — clarifying questions represent a human checkpoint before generation
- [Agent Loops](../concepts/agent-loops.md) — this skill fits within a planning phase of an agent loop
- [Context Management](../concepts/context-management.md) — PRDs become context for downstream implementation agents
