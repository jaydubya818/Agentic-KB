import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // Set Turbopack root to repo root so routes can resolve lib/ modules outside web/
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
}

export default nextConfig
