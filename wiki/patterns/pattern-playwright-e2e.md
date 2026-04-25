---
id: 01KQ2YN108DJ1ER6NXCJYJYEWE
title: "Playwright E2E Testing Pattern"
type: pattern
tags: [patterns, workflow, automation, deployment]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
source: my-skills/e2e-tester-skill.md
---

# Playwright E2E Testing Pattern

A structured approach to writing reliable, maintainable Playwright end-to-end tests using the Page Object Model, semantic selectors, and MCP-assisted exploration.

## When to Use

Before writing any E2E test, answer these questions:

- Does an existing test already cover this functionality?
- Could a unit test cover this feature better?
- Does the E2E test provide value a unit test cannot?

Only proceed if the answer to the last question is **yes**.

## Structure

### File Layout

```
tests/
├── base-page.ts              # Parent class for ALL pages
├── helpers.ts                # Shared utilities
└── {page-name}/
    ├── {page-name}-page.ts   # Page Object Model
    ├── {page-name}.spec.ts   # ALL tests here (NO separate files!)
    └── {page-name}.md        # Test documentation
```

**Naming rules:**
- ✅ `sign-up.spec.ts` — all tests for a feature in one file
- ❌ `sign-up-critical-path.spec.ts` — do not split by scenario

### Selector Priority

Always prefer selectors that reflect user intent:

```typescript
// 1. BEST — interactive elements by role
page.getByRole("button", { name: "Submit" });
page.getByRole("link", { name: "Dashboard" });

// 2. BEST — form controls by label
page.getByLabel("Email");
page.getByLabel("Password");

// 3. SPARINGLY — static content by text
page.getByText("Invalid credentials");

// 4. LAST RESORT — test IDs
page.getByTestId("date-picker");

// ❌ AVOID — fragile CSS/ID selectors
page.locator(".btn-primary");
page.locator("#email");
```

### Waiting Strategies

Never use fixed-time waits. Always wait for observable conditions:

```typescript
// ❌ NEVER
await page.waitForTimeout(2000);

// ✅ Wait for element state
await expect(element).toBeVisible();
await expect(page.getByText('Success')).toBeVisible({ timeout: 10000 });

// ✅ Wait for network or navigation
await page.waitForResponse(resp => resp.url().includes('/api/data'));
await page.waitForURL('**/dashboard');

// ✅ For SPAs — prefer domcontentloaded over networkidle
await page.goto('/app', { waitUntil: 'domcontentloaded' });
await expect(page.getByRole('main')).toBeVisible();
```

## MCP Exploration Workflow

If Playwright MCP tools are available, **always explore before writing tests**:

1. **Navigate** to the target page
2. **Take a snapshot** to inspect the real DOM structure and element refs
3. **Interact** with forms and elements to verify the exact user flow
4. **Take screenshots** to document expected states
5. **Verify page transitions** — loading, success, and error states
6. **Document actual selectors** from snapshots (use real refs, not guesses)
7. **Only then** write test code with verified selectors

If MCP is not available, proceed from documentation and source code analysis.

**Why this matters:**
- Precise tests based on actual DOM structure, not assumptions
- Accurate selectors reduce flakiness
- Real flow validation catches gaps before code is written
- Avoids over-engineering — only test what exists

## Scope Detection

| Request phrasing | Action |
|---|---|
| "a test", "one test", "add test" | Add ONE `test()` to the existing spec file |
| "comprehensive tests", "test suite", "all tests" | Create a full suite |

When scope is ambiguous, ask before generating.

## Trade-offs

| Benefit | Cost |
|---|---|
| Catches real regressions across full user journeys | Slower than unit tests; harder to isolate failures |
| Validates actual DOM and network interactions | Brittle if selectors or flows change frequently |
| MCP exploration prevents flaky tests | Requires MCP setup or manual DOM analysis up front |

## Related Patterns

- [Agent Observability](../concepts/agent-observability.md) — similar principle of validating real system state rather than mocking
- [Human-in-the-Loop](../concepts/human-in-the-loop.md) — scope clarification before proceeding mirrors HITL checkpoint patterns

## See Also

- [Agent Failure Modes](../concepts/agent-failure-modes.md) — flaky tests are a class of silent failure
- [Context Management](../concepts/context-management.md)
