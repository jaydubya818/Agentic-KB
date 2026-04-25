---
id: 01KQ2YTG4NHB7198YNNS2QP3JB
title: "Frontend Code Review Skill"
type: concept
tags: [agents, workflow, automation, patterns]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
source: my-skills/frontend-code-review-skill.md
---

# Frontend Code Review Skill

## Definition

The **frontend-code-review** skill is an agent skill triggered whenever a user requests a review of frontend files (`.tsx`, `.ts`, `.js`). It applies a structured checklist of code quality and performance rules, then produces a consistently formatted review report.

The skill supports two review modes:

1. **Pending-change review** — inspects staged or working-tree files slated for commit and flags checklist violations before submission.
2. **File-targeted review** — reviews specific file(s) named by the user and reports relevant checklist findings.

## Why It Matters

Consistent, structured code review is a high-leverage point in frontend development workflows. By encoding the review process as a reusable agent skill, teams get:

- **Reproducibility** — the same checklist is applied every time, reducing reviewer fatigue and blind spots.
- **Prioritised output** — violations are grouped by urgency (Urgent vs. Suggestion), so engineers fix critical issues first.
- **Actionable follow-up** — when issues require code changes, the skill prompts whether to apply the suggested fixes automatically.

## Review Process

1. Open the relevant component or module; gather lines related to class names, React Flow hooks, prop memoization, and styling.
2. For each checklist rule, note deviations and capture a representative snippet.
3. Compose the output grouped first by **Urgent** flag, then by category order: Code Quality → Performance → Business Logic.

The canonical checklist lives in `references/code-quality.md` and `references/performance.md` and should be treated as the authoritative source of rules.

## Example

### Template A — Issues Found

```
# Code review
Found 2 urgent issues need to be fixed:

## 1 Missing key prop in mapped list
FilePath: src/components/NodeList.tsx line 42
{nodes.map(n => <Node {...n} />)}

### Suggested fix
Add a stable `key` prop: `<Node key={n.id} {...n} />`

---

Found 1 suggestion for improvement:

## 1 Inline style bypasses design token
FilePath: src/components/NodeList.tsx line 57
style={{ color: '#ff0000' }}

### Suggested fix
Replace with the `color-error` design token class.

---
```

If more than 10 issues are found, the header reads "10+ urgent issues" and only the first 10 are listed.

### Template B — No Issues

```
## Code review
No issues found.
```

## Output Rules

- Omit the **Urgent** section if there are no urgent issues.
- Omit the **Suggestions** section if there are none.
- Preserve blank lines between sections for readability — do not compress them.
- If at least one issue requires a code change, append a follow-up question asking whether the user wants the fixes applied.

## See Also

- [Agent Loops](agent-loops.md) — how skills fit into the broader agent execution cycle
- [Human-in-the-Loop](human-in-the-loop.md) — the follow-up fix-application prompt is an example of a HITL checkpoint
- [Few-Shot Prompting](few-shot-prompting.md) — the structured templates function similarly to few-shot output formatting
