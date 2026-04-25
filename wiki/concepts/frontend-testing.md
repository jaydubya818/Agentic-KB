---
id: 01KQ2YVVQXZSAKMQ8QP93C2VE8
title: "Frontend Testing with Vitest & React Testing Library"
type: concept
tags: [patterns, workflow, automation, frameworks]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
source: my-skills/frontend-testing-skill.md
---

# Frontend Testing with Vitest & React Testing Library

## Definition

A structured approach to writing unit and integration tests for React components, hooks, and utilities using **Vitest** as the test runner and **React Testing Library (RTL)** as the component interaction layer, with **jsdom** as the simulated DOM environment.

This applies to `.spec.tsx` files co-located with the source component, following an Arrange–Act–Assert pattern within a consistent `describe` hierarchy.

## Why It Matters

Frontend tests verify component behaviour from the user's perspective rather than implementation details. RTL encourages querying the DOM the way users interact with it (by role, label, text), making tests more resilient to refactors. Vitest provides fast, TypeScript-native test execution with a Jest-compatible API.

Key reasons to invest in this layer:
- Catches regressions in rendering, props handling, and user interactions early
- Enables safe refactoring of UI components
- Documents expected component behaviour as executable specs

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| Vitest | 4+ | Test runner |
| React Testing Library | 16+ | Component testing |
| jsdom | — | Test environment |
| TypeScript | 5+ | Type safety |

## File Conventions

- Test files named `ComponentName.spec.tsx`, placed in the **same directory** as the component.
- One `describe('ComponentName', ...)` block per file.
- Inner `describe` blocks for: `Rendering`, `Props`, `User Interactions`, `Edge Cases`.

## Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import Button from './index'

vi.mock('@/service/api') // ✅ Mock external deps only

describe('Button', () => {
  beforeEach(() => {
    vi.clearAllMocks() // ✅ Reset before each test
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<Button label="Submit" />)
      expect(screen.getByText('Submit')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick} label="Go" />)
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })
})
```

## Running Tests

**Always prefer targeted runs over the full suite during development:**

```bash
# ✅ Run a specific file
npx vitest run src/components/Button.spec.tsx

# ✅ Run tests matching a pattern
npx vitest run --grep "Button"

# ✅ Watch mode for iterative development
npx vitest src/components/Button.spec.tsx

# ⚠️ Run ALL tests (avoid during development)
npx vitest run
```

## Mocking Guidelines

- **Do NOT mock** real project components — import and render them directly.
- **DO mock** external dependencies: API services, `next/navigation`, third-party libraries.
- Reset mocks in `beforeEach` with `vi.clearAllMocks()`.
- Reset any shared state variables in `beforeEach` as well.

## Scope Boundaries

| In scope | Out of scope |
|---|---|
| Unit tests for components, hooks, utilities | E2E tests (use Playwright) |
| Integration tests within a single component tree | Backend / API tests |
| Snapshot / rendering regression tests | Conceptual questions without code |

## See Also

- [Agent Loops](agent-loops.md) — for understanding how automated test runs fit into agentic workflows
- [Workflow & Automation concepts](../concepts/llm-wiki-pattern.md) — patterns that apply similarly to structured code generation tasks
