import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Configure to work with the new structure
  outputFileTracingRoot: process.cwd(),
  
  // Output configuration for production
  // Use export for Netlify, standalone for Docker
  output: process.env.NETLIFY ? 'export' : 'standalone',
  
  // For static export on Netlify
  ...(process.env.NETLIFY && {
    distDir: 'out',
    trailingSlash: true,
    images: {
      unoptimized: true
    }
  }),
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Handle ES modules
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    
    // Add support for WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }
    
    // Wallet adapter configurations
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      url: false,
    }
    
    return config
  },
  
  // Environment variables configuration
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Redirects and rewrites (only for non-static builds)
  ...(!process.env.NETLIFY && {
    async redirects() {
      return []
    }
  }),
  
  // Image optimization (only if not already set by NETLIFY config)
  ...(!process.env.NETLIFY && {
    images: {
      domains: [],
      formats: ['image/webp', 'image/avif'],
    }
  }),
  
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