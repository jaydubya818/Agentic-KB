import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // Silence workspace root warning (multiple lockfiles detected)
  turbopack: {
    root: path.resolve(__dirname),
  },
}

export default nextConfig
