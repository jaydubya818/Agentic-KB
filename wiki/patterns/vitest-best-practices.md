---
id: 01KQ2ZPWAPPR2K60QCGAZX2XDG
title: "Vitest Best Practices"
type: pattern
tags: [unit-testing, vitest, patterns, typescript, javascript]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
source: my-skills/vitest-best-practices-skill.md
related: [test-doubles-and-mocking, concepts/context-management]
---

# Vitest Best Practices

Comprehensive patterns for writing clear, maintainable, and performant unit and integration tests using the [Vitest](https://vitest.dev/) framework in TypeScript/JavaScript projects.

> **Scope**: This page covers Vitest unit/integration testing only. It does **not** apply to end-to-end tests written with Playwright or Cypress.

---

## When to Use

Apply these practices when:

- Writing or reviewing `*.test.ts` / `*.spec.ts` files
- Creating new test files for TypeScript/JavaScript modules
- Refactoring tests for clarity, coverage, or performance
- Debugging flaky or failing tests
- Files import from `vitest` (`describe`, `it`, `expect`, `vi`)

---

## Structure

### 1. Test Organization

- Co-locate test files with the modules they test (e.g., `user.service.test.ts` alongside `user.service.ts`)
- Use `describe` blocks to group related tests, but **prefer flat structure** over deep nesting
- Name tests descriptively: `it('returns 404 when user does not exist')`
- One test file per module; one `describe` block per class or function under test

### 2. AAA Pattern (Arrange-Act-Assert)

Every test case should follow the three-phase structure:

```ts
it('calculates discounted price correctly', () => {
  // Arrange
  const product = { price: 100, discountRate: 0.2 };

  // Act
  const result = applyDiscount(product);

  // Assert
  expect(result.finalPrice).toEqual(80);
});
```

This separation makes the intent of each test immediately legible.

### 3. Parameterized Tests

Use `it.each()` to avoid duplicating test logic across variations:

```ts
it.each([
  { input: 0,   expected: 'zero' },
  { input: 1,   expected: 'one' },
  { input: -1,  expected: 'negative' },
])('classifies $input as $expected', ({ input, expected }) => {
  expect(classify(input)).toEqual(expected);
});
```

### 4. Assertions

- Prefer **`toEqual`** over `toBe` for object/array comparisons (deep equality vs. reference equality)
- Use **`toStrictEqual`** when strict type checking matters (rejects `undefined` properties)
- Use **`toThrow`** (not manual try/catch) to assert exceptions
- Aim for **one assertion per concept** — multiple `expect()` calls are fine when they verify the same logical outcome

```ts
// ✅ Strict, explicit assertions
expect(result).toStrictEqual({ id: 1, name: 'Widget', active: true });
expect(() => divide(1, 0)).toThrow('Division by zero');
```

### 5. Error Handling Tests

Test edge cases and failure paths explicitly:

```ts
it('throws when input is null', () => {
  expect(() => processItem(null)).toThrow(TypeError);
});
```

---

## Example

**Before (unclear):**
```ts
test('product test', () => {
  const p = new ProductService().add({ name: 'Widget' });
  expect(p.status).toBe('active');
  expect(p.id).toBeTruthy();
});
```

**After (AAA, strict assertions, focused):**
```ts
describe('ProductService.add()', () => {
  it('creates a product with active status', () => {
    // Arrange
    const service = new ProductService();
    const input = { name: 'Widget' };

    // Act
    const product = service.add(input);

    // Assert
    expect(product.status).toEqual('active');
  });

  it('assigns a non-empty id to new products', () => {
    const product = new ProductService().add({ name: 'Widget' });
    expect(product.id).toEqual(expect.any(String));
  });
});
```

---

## Trade-offs

| Practice | Benefit | Cost |
|---|---|---|
| AAA structure | Readability, maintainability | Minor verbosity |
| `toStrictEqual` over `toBe` | Catches type mismatches | Stricter — may require exact object shapes |
| `it.each()` for variations | DRY, scalable | Slightly harder to debug individual failures |
| Flat `describe` nesting | Easier navigation | Less granular grouping |
| Minimal mocking | Tests real behaviour | Slower tests for I/O-heavy units |

---

## Async Testing

- Always `await` async operations or return the promise
- Use `vi.useFakeTimers()` for timer-dependent logic; restore with `vi.useRealTimers()` in `afterEach`
- Avoid arbitrary `setTimeout` delays in tests — use fake timers instead

```ts
it('resolves user data', async () => {
  const user = await fetchUser(1);
  expect(user.name).toEqual('Alice');
});
```

---

## Performance

- Keep individual tests fast; avoid real network, disk, or database calls
- Use `beforeEach` / `afterEach` for lightweight setup/teardown; use `beforeAll` / `afterAll` only when setup is expensive and safe to share
- Clean up mocks after each test: `vi.restoreAllMocks()` in `afterEach`
- Prefer in-memory fakes over full mocks for complex dependencies

---

## Snapshot Testing

Use snapshots sparingly — best for stable, serializable output (e.g., rendered components, CLI output):

- Update snapshots intentionally with `vitest --update-snapshots`
- Avoid snapshots for frequently changing or deeply dynamic structures
- Prefer inline snapshots (`toMatchInlineSnapshot`) for small outputs

---

## ⚠️ Contradictions

> The source recommends **"one assertion per concept"** but does not clarify whether multiple `expect()` calls within a single concept violate this rule. In common practice, grouping closely related assertions (e.g., checking both `id` and `status` of a created entity) in one test is acceptable. Interpret this rule as: test one **behaviour** per `it()` block, not literally one `expect()` call.

---

## Related Patterns

- [Test Doubles and Mocking](../concepts/test-doubles-and-mocking.md) — when and how to use fakes, stubs, spies, and mocks
- [Context Management](../concepts/context-management.md) — relevant when managing test setup state across large suites

## See Also

- [concepts/agent-observability.md](../concepts/agent-observability.md) — observability principles that parallel good test design
- [concepts/benchmark-design.md](../concepts/benchmark-design.md) — rigorous measurement design (parallels assertion design)
