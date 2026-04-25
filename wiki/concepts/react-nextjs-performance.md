---
id: 01KQ2ZFAPB53YF2AN68034BBV1
title: "React & Next.js Performance Optimization"
type: concept
tags: [architecture, workflow, patterns, frameworks]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
source: my-skills/react-best-practices-skill.md
---

# React & Next.js Performance Optimization

A structured set of 45 performance rules across 8 priority categories, maintained by Vercel Engineering. Intended as a reference for writing, reviewing, or refactoring React and Next.js code.

## Definition

Performance optimization in React/Next.js spans server and client concerns: eliminating async waterfalls, reducing bundle size, minimizing re-renders, and controlling what runs where (server vs. client). The categories below are ordered by impact.

## Rule Categories by Priority

| Priority | Category | Impact |
|----------|----------|--------|
| 1 | Eliminating Waterfalls | CRITICAL |
| 2 | Bundle Size Optimization | CRITICAL |
| 3 | Server-Side Performance | HIGH |
| 4 | Client-Side Data Fetching | MEDIUM-HIGH |
| 5 | Re-render Optimization | MEDIUM |
| 6 | Rendering Performance | MEDIUM |
| 7 | JavaScript Performance | LOW-MEDIUM |
| 8 | Advanced Patterns | LOW |

## Why It Matters

Next.js applications are uniquely exposed to both server-side bottlenecks (sequential data fetching, over-serialization) and client-side issues (large bundles, unnecessary re-renders). Addressing CRITICAL categories first yields the highest user-visible impact.

## Key Rules by Category

### 1. Eliminating Waterfalls (CRITICAL)

- **`async-defer-await`** — Move `await` into branches where it is actually needed.
- **`async-parallel`** — Use `Promise.all()` for independent async operations.
- **`async-dependencies`** — Use `better-all` for partially dependent async chains.
- **`async-api-routes`** — Start promises early in API routes; await late.
- **`async-suspense-boundaries`** — Use `<Suspense>` to stream content to the client incrementally.

### 2. Bundle Size Optimization (CRITICAL)

- **`bundle-barrel-imports`** — Import directly from source files; avoid barrel (`index.ts`) re-exports.
- **`bundle-dynamic-imports`** — Use `next/dynamic` for heavy or rarely-used components.
- **`bundle-defer-third-party`** — Load analytics/logging libraries after hydration.
- **`bundle-conditional`** — Load modules only when a feature is activated.
- **`bundle-preload`** — Preload assets on hover/focus to improve perceived performance.

### 3. Server-Side Performance (HIGH)

- **`server-cache-react`** — Use `React.cache()` for per-request deduplication of expensive calls.
- **`server-cache-lru`** — Use an LRU cache for cross-request caching.
- **`server-serialization`** — Minimize data passed to client components (avoid over-sending props).
- **`server-parallel-fetching`** — Restructure component trees to parallelize server fetches.
- **`server-after-nonblocking`** — Use `after()` for side-effects that should not block the response.

### 4. Client-Side Data Fetching (MEDIUM-HIGH)

- **`client-swr-dedup`** — Use SWR for automatic request deduplication across components.
- **`client-event-listeners`** — Deduplicate global event listeners to avoid redundant subscriptions.

### 5. Re-render Optimization (MEDIUM)

- **`rerender-defer-reads`** — Don't subscribe to state that is only read inside callbacks.
- **`rerender-memo`** — Extract expensive computed work into memoized child components.
- **`rerender-dependencies`** — Use primitive values (not objects) as effect dependencies.
- **`rerender-derived-state`** — Subscribe to derived booleans rather than raw object state.
- **`rerender-functional-setstate`** — Use functional `setState` form to produce stable callback references.
- **`rerender-lazy-state-init`** — Pass an initializer function to `useState` for expensive initial values.
- **`rerender-transitions`** — Use `startTransition` for non-urgent state updates.

### 6. Rendering Performance (MEDIUM)

- **`rendering-animate-svg-wrapper`** — Animate a `<div>` wrapper rather than the SVG element directly.
- **`rendering-content-visibility`** — Use CSS `content-visibility` for long off-screen lists.
- **`rendering-hoist-jsx`** — Extract static JSX outside component functions to avoid re-creation.
- **`rendering-svg-precision`** — Reduce SVG coordinate decimal precision to shrink payload.
- **`rendering-hydration-no-flicker`** — Use inline scripts to supply client-only data without hydration flicker.
- **`rendering-activity`** — Use the `<Activity>` component for show/hide transitions instead of conditional rendering.
- **`rendering-conditional-render`** — Prefer ternary (`condition ? A : B`) over `&&` for conditional JSX to avoid accidental `0` renders.

## Example

A common waterfall pattern:

```tsx
// ❌ Sequential — each await blocks the next
const user = await getUser(id);
const posts = await getPosts(user.id);

// ✅ Parallel — both fire at once
const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);
```

## When to Apply

- Writing new React components or Next.js pages
- Implementing data fetching (client or server-side)
- Reviewing code for performance regressions
- Refactoring existing React/Next.js code
- Optimizing bundle size or Time-to-Interactive

## See Also

- [Cost Optimization](../concepts/cost-optimization.md) — related concerns around reducing compute spend
- [Context Management](../concepts/context-management.md) — managing what data flows into components and agents
- [Patterns directory](../patterns/) — reusable architectural patterns for agent and application design
