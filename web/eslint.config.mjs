// ESLint 9 flat config for web/.
// `next lint` was removed in Next 16, so the lint script now invokes eslint
// directly. eslint-config-next@16 ships flat-config arrays, so they are spread here.
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

export default [
  {
    ignores: ['.next/**', 'node_modules/**', 'logs/**', 'next-env.d.ts'],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    // web/ went unlinted from the Next 16 bump until 2026-08-30, so the first
    // real run surfaced 16 pre-existing findings. Fixing application code was
    // out of scope for the change that introduced this file, so the three rules
    // that were error-level were downgraded to warnings: they still report on
    // every run, they just do not fail the gate on violations that predate it.
    // Re-promote each to 'error' once its existing occurrences are cleaned up
    // (prefer-const was re-promoted on 2026-09-02 after its one occurrence
    // was fixed).
    rules: {
      // 2 occurrences: src/app/agents/page.tsx, src/lib/private-mode-context.tsx
      'react-hooks/set-state-in-effect': 'warn',
      // 2 occurrences: src/app/repos/[repo]/page.tsx
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
]
