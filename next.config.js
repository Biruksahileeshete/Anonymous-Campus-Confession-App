/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static generation for all pages to avoid SSR issues
  trailingSlash: false,
  
  experimental: {
    // Enable build worker for faster compilation
    webpackBuildWorker: true,
    // Enable optimized package imports
    optimizePackageImports: ['react', 'react-dom'],
  },

  // Move serverComponentsExternalPackages to root level
  serverExternalPackages: ['pg', 'bcryptjs', 'next-auth'],

  // Optimize webpack configuration
  webpack: (config, { isServer, dev }) => {
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
    
    // Optimize chunks
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
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
  },

  // Reduce bundle size
  modularizeImports: {
    'next-auth': {
      transform: 'next-auth/{{member}}',
    },
  },
  
  // Optimize output
  output: 'standalone',
}

module.exports = nextConfig