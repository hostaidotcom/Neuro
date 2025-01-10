import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
      },
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });
    return config;
  },
  experimental: {
    turbo: {
      // Define unsupported webpack loaders
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'], // Example loader for SVG files
          as: '*.js',
        },
      },
      // Resolve aliases
      resolveAlias: {
        underscore: 'lodash', // Alias underscore to lodash
        mocha: { browser: 'mocha/browser-entry.js' }, // Conditional alias for browser
      },
      // Resolve custom extensions
      resolveExtensions: [
        '.mdx', 
        '.tsx', 
        '.ts', 
        '.jsx', 
        '.js', 
        '.mjs', 
        '.json',
      ],
      // Assign module IDs
      moduleIdStrategy: 'deterministic', // Use hashed IDs for better caching
      // Enable tree shaking
      treeShaking: true,
      // Set a memory limit for Turbopack
      memoryLimit: 1024 * 1024 * 512, // 512MB in bytes
    },
  },
};

export default nextConfig;
