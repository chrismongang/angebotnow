/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    // Deaktiviere die Suspense-Regel für useSearchParams (Next.js 14)
    missingSuspenseWithCSRBailout: false,
  },
  // Force dynamic rendering for all pages to avoid prerendering issues
  output: 'standalone',
  // Webpack-Konfiguration für bessere Chunk-Verwaltung
  webpack: (config, { isServer, dev }) => {
    // Chunk-Splitting optimieren
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        // NextAuth in separaten Chunk
        nextauth: {
          name: 'nextauth',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](next-auth|@auth)[\\/]/,
          priority: 20,
        },
        // React in separaten Chunk
        react: {
          name: 'react',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          priority: 30,
        },
        // UI-Komponenten in separaten Chunk
        ui: {
          name: 'ui',
          chunks: 'all',
          test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
          priority: 10,
        },
        // Gemeinsame Chunks
        commons: {
          name: 'commons',
          chunks: 'all',
          minChunks: 2,
          priority: 5,
        },
      },
    };

    // Chunk-Loading-Fehler vermeiden
    config.output.chunkLoadingGlobal = 'webpackChunkAngebotNow';
    
    // Produktions-Optimierungen
    if (!dev) {
      config.optimization.minimize = true;
      config.optimization.minimizer = config.optimization.minimizer || [];
    }
    
    return config;
  },
  // Chunk-Loading-Optimierungen
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Produktions-Optimierungen
  poweredByHeader: false,
  compress: true,
  // Turbopack deaktiviert um Chunk-Loading-Probleme zu vermeiden
};

module.exports = nextConfig;
