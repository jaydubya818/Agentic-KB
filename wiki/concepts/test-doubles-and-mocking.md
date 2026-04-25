---
id: 01KQ2ZPWAQ6TS1M3VY0PQZ0HVB
title: "Test Doubles and Mocking"
type: concept
tags: [unit-testing, mocking, vitest, patterns, javascript]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
source: my-skills/vitest-best-practices-skill.md
related: [vitest-best-practices]
---

# Test Doubles and Mocking

## Definition

A **test double** is any object, function, or module substituted for a real dependency during testing. The term encompasses several distinct types, each with a specific role:

| Type | What It Does | When to Use |
|---|---|---|
| **Fake** | A working implementation with simplified behaviour (e.g., in-memory DB) | When the real implementation is too slow or unavailable |
| **Stub** | Returns hard-coded values, no logic | When you only need to control return values |
| **Mock** | Pre-programmed with expectations; verifies call behaviour | When the interaction itself (not just the output) matters |
| **Spy** | Wraps a real implementation and records calls | When you want real behaviour but also need to observe calls |

In Vitest, these are created via:
- `vi.fn()` — creates a standalone mock function
- `vi.spyOn(obj, 'method')` — wraps an existing method as a spy
- `vi.mock('module-path')` — replaces an entire module with auto-mocked or manual doubles

---

## Why It Matters

Test doubles allow units to be tested in **isolation** from their dependencies (databases, APIs, file systems, time). Without them, tests become slow, non-deterministic, and brittle. With too many, tests lose fidelity and may pass even when the real system is broken.

The key tension: **more mocking = faster, more isolated tests; less mocking = higher confidence in real behaviour**.

---

## Example

### Spy (observe without replacing behaviour)
```ts
import { vi, expect, it } from 'vitest';
import { emailService } from './email-service';

it('sends a welcome email on registration', async () => {
  const sendSpy = vi.spyOn(emailService, 'send');

  await registerUser({ email: 'alice@example.com' });

  expect(sendSpy).toHaveBeenCalledOnce();
  expect(sendSpy).toHaveBeenCalledWith(
    expect.objectContaining({ to: 'alice@example.com' })
  );
});
```

### Stub (control return values)
```ts
it('displays user name from API', async () => {
  vi.spyOn(userApi, 'getUser').mockResolvedValue({ id: 1, name: 'Alice' });

  const result = await getUserDisplayName(1);

  expect(result).toEqual('Alice');
});
```

### Module mock (replace entire dependency)
```ts
vi.mock('./database', () => ({
  db: {
    find: vi.fn().mockResolvedValue([{ id: 1 }]),
    save: vi.fn(),
  },
}));
```

---

## Guiding Principles

1. **Minimise mocking** — use real implementations whenever practical (fast in-memory versions preferred over mocks)
2. **Restore mocks after each test** — use `vi.restoreAllMocks()` in `afterEach` to prevent inter-test contamination
3. **Mock at the boundary** — mock external I/O (HTTP, DB, filesystem), not internal helpers
4. **Prefer fakes over mocks** for complex dependencies — an in-memory repository is more robust than a deeply configured mock
5. **Assert on calls only when the call is the behaviour** — don't verify `toHaveBeenCalled` unless the side-effect is what you're testing

---

## See Also

- [Vitest Best Practices](../patterns/vitest-best-practices.md) — full pattern guide including AAA, assertions, async testing
- [concepts/agent-observability.md](../concepts/agent-observability.md) — observability design shares principles with spy-based test instrumentation
