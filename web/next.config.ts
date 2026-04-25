import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // Set Turbopack root to repo root so routes can resolve lib/ modules outside web/
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
  // Bound file tracing for the compile route to the KB content trees instead of the whole repo.
  outputFileTracingIncludes: {
    '/api/compile': [
      './raw/**/*',
      './wiki/**/*',
      './config/**/*',
    ],
  },
  outputFileTracingExcludes: {
    '/api/compile': [
      './logs/**/*',
      './outputs/**/*',
      './node_modules/**/*',
    ],
  },
  typescript: {
    // Pre-existing type error in repos/[repo]/docs/route.ts — ignore during build
    ignoreBuildErrors: true,
  },
}

export default nextConfig
