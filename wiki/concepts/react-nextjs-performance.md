---
id: 01KQ2ZMAF0EJA9PN1H58EJE4SB
title: "React & Next.js Performance Optimization"
type: concept
tags: [patterns, architecture, workflow, frameworks]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
source: my-skills/vercel-react-best-practices-skill.md
---

# React & Next.js Performance Optimization

A prioritized set of performance guidelines for React and Next.js applications, derived from Vercel Engineering best practices. Covers 8 categories ranked by impact — from critical rendering bottlenecks to low-level JavaScript tuning.

## Definition

Performance optimization in React/Next.js encompasses patterns for eliminating network and rendering waterfalls, reducing JavaScript bundle size, minimizing unnecessary re-renders, and making effective use of server-side capabilities. Vercel's guidelines organize these into a priority stack, ensuring the highest-impact work is addressed first.

## Why It Matters

Poor performance patterns — especially data-fetch waterfalls and bloated bundles — are among the most common causes of slow React applications. In Next.js specifically, the server/client boundary introduces additional complexity: data can be fetched at different layers, serialized across the wire, and cached at multiple levels. Without clear guidelines, it's easy to introduce subtle but costly anti-patterns.

## Priority Categories

| Priority | Category | Impact |
|---|---|---|
| 1 | Eliminating Waterfalls | CRITICAL |
| 2 | Bundle Size Optimization | CRITICAL |
| 3 | Server-Side Performance | HIGH |
| 4 | Client-Side Data Fetching | MEDIUM-HIGH |
| 5 | Re-render Optimization | MEDIUM |
| 6 | Rendering Performance | MEDIUM |
| 7 | JavaScript Performance | LOW-MEDIUM |
| 8 | Advanced Patterns | LOW |

## Key Patterns by Category

### 1. Eliminating Waterfalls (CRITICAL)
- **`async-parallel`** — Use `Promise.all()` for independent async operations instead of sequential `await`
- **`async-defer-await`** — Move `await` as late as possible; start promises early
- **`async-suspense-boundaries`** — Use React `Suspense` to stream content and unblock rendering
- **`async-dependencies`** — Use `better-all` for operations with partial dependencies

### 2. Bundle Size Optimization (CRITICAL)
- **`bundle-dynamic-imports`** — Use `next/dynamic` for heavy, non-critical components
- **`bundle-barrel-imports`** — Import directly from source files; avoid barrel (`index.ts`) re-exports that pull in unused code
- **`bundle-defer-third-party`** — Load analytics/logging scripts after hydration
- **`bundle-preload`** — Preload resources on hover/focus to improve perceived speed

### 3. Server-Side Performance (HIGH)
- **`server-cache-react`** — Use `React.cache()` for per-request deduplication of server fetches
- **`server-cache-lru`** — Use LRU cache for cross-request (shared) caching
- **`server-serialization`** — Minimize data serialized and passed to client components
- **`server-after-nonblocking`** — Use Next.js `after()` for side effects that shouldn't block the response

### 4. Client-Side Data Fetching (MEDIUM-HIGH)
- **`client-swr-dedup`** — Use SWR for automatic deduplication of client-side requests
- **`client-event-listeners`** — Deduplicate global event listeners to avoid redundant processing

### 5. Re-render Optimization (MEDIUM)
- **`rerender-memo`** — Extract expensive computations into memoized components
- **`rerender-defer-reads`** — Avoid subscribing to state that is only read inside event callbacks
- **`rerender-transitions`** — Use `startTransition` for non-urgent UI updates
- **`rerender-functional-setstate`** — Use functional `setState` form for stable callback references
- **`rerender-lazy-state-init`** — Pass an initializer function to `useState` for expensive default values

### 6. Rendering Performance (MEDIUM)
- **`rendering-content-visibility`** — Use CSS `content-visibility` for long off-screen lists
- **`rendering-hoist-jsx`** — Extract static JSX outside component render functions
- **`rendering-activity`** — Use the `Activity` component for show/hide instead of conditional mounting
- **`rendering-conditional-render`** — Prefer ternary (`? :`) over `&&` for conditional rendering to avoid accidental `0` renders
- **`rendering-hydration-no-flicker`** — Use inline scripts to initialize client-only data and prevent hydration flicker

## Example: Parallel Fetching vs. Waterfall

```typescript
// ❌ Waterfall — each awaits the previous
const user = await fetchUser(id);
const posts = await fetchPosts(user.id);
const comments = await fetchComments(posts[0].id);

// ✅ Parallel — independent fetches run simultaneously
const [user, settings] = await Promise.all([
  fetchUser(id),
  fetchUserSettings(id),
]);
```

## Common Pitfalls

- **Barrel file imports** pulling in entire libraries when only one utility is needed
- **Sequential awaits** in server components where requests are actually independent
- **Subscribing to full objects** in state when only a derived boolean is needed — triggers unnecessary re-renders
- **Using `&&` for conditional rendering** when the left-hand value might be `0` or another falsy non-boolean

## See Also

- [Cost Optimization](../concepts/cost-optimization.md) — related concerns around resource efficiency
- [Context Management](../concepts/context-management.md) — managing data flow and serialization across boundaries
- [Agent Loops](../concepts/agent-loops.md) — async coordination patterns relevant to parallel execution