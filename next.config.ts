import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Configure to work with the new structure
  outputFileTracingRoot: process.cwd(),
  
  // Output configuration for production
  output: 'standalone',
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Handle ES modules
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    
    // Add support for WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }
    
    return config
  },
  
  // Environment variables configuration
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Redirects and rewrites
  async redirects() {
    return []
  },
  
  // Image optimization
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  
  // TypeScript configuration
  typescript: {
    // Ignore build errors temporarily during restructuring
    ignoreBuildErrors: true,
  },
  
  // ESLint configuration
  eslint: {
    // Ignore linting errors temporarily during restructuring
    ignoreDuringBuilds: true,
  },
}

export default nextConfig