import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Optimize for static export (good for Netlify)
  trailingSlash: false,
  
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'arweave.net',
        pathname: '/**',
      },
    ],
    // For static export, we need to disable image optimization
    unoptimized: true,
  },
  
  // Webpack configuration for SVG handling
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  
  // Environment variables that should be available at build time
  env: {
    CUSTOM_KEY: 'vibes-defi-production',
  },
  
  // Output configuration for Docker deployment
  output: 'standalone',
};

export default nextConfig;