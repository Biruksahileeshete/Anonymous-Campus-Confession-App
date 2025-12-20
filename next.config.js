/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static generation for all pages to avoid SSR issues
  trailingSlash: false,
  
  experimental: {
    // Enable build worker for faster compilation
    webpackBuildWorker: true,
    // Enable optimized package imports
    optimizePackageImports: ['react', 'react-dom', 'lucide-react', 'framer-motion'],
    // Disable CSS optimization for now to avoid critters dependency issue
    // optimizeCss: true,
  },

  // Move serverComponentsExternalPackages to root level
  serverExternalPackages: ['pg', 'bcryptjs'],

  // Optimize webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Only apply webpack optimizations when not using Turbopack
    if (process.env.TURBOPACK) {
      return config;
    }

    // Optimize for development
    if (dev) {
      config.watchOptions = {
        poll: false,
        aggregateTimeout: 200,
        ignored: ['**/node_modules', '**/.git', '**/.next', '**/test-*.js'],
      };
      
      // Faster source maps in development
      config.devtool = 'eval-cheap-module-source-map';
    }

    // Client-side optimizations
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        buffer: false,
        util: false,
        path: false,
        os: false,
      };
    }
    
    // Exclude heavy server-only modules from client bundle
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        'pg': 'pg',
        'bcryptjs': 'bcryptjs',
        'firebase-admin': 'firebase-admin',
        'undici': 'undici'
      });
    }

    // Optimize module resolution
    config.resolve.modules = ['node_modules'];
    config.resolve.symlinks = false;
    
    // Optimize chunks for better caching
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    return config;
  },

  // Enable compression
  compress: true,
  
  // Optimize images
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Reduce bundle size
  modularizeImports: {
    'next-auth': {
      transform: 'next-auth/{{member}}',
    },
    // Removed lucide-react modular imports as it's causing issues with some icons
  },
  
  // Optimize output
  output: 'standalone',
  
  // Add performance headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0'
          }
        ]
      }
    ];
  }
}

module.exports = nextConfig