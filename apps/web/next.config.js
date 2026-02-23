/** @type {import('next').NextConfig} */
const nextConfig = {
  // ---------------------------------------------------------------------------
  // Environment variable exposure
  // Variables prefixed with NEXT_PUBLIC_ are inlined at build time and
  // accessible on the client. Server-only vars are NOT listed here.
  // ---------------------------------------------------------------------------
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
  },

  // ---------------------------------------------------------------------------
  // Image optimisation — allowlist remote hostnames used by each provider
  // ---------------------------------------------------------------------------
  images: {
    remotePatterns: [
      // Replicate
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
      },
      {
        protocol: 'https',
        hostname: 'pbxt.replicate.delivery',
      },
      {
        protocol: 'https',
        hostname: '**.replicate.delivery',
      },
      // fal.ai
      {
        protocol: 'https',
        hostname: '**.fal.run',
      },
      {
        protocol: 'https',
        hostname: '**.fal.ai',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/fal-flux-sc/**',
      },
      // Together.ai CDN (b64_json is used by default, but URL mode is a fallback)
      {
        protocol: 'https',
        hostname: '**.together.xyz',
      },
      {
        protocol: 'https',
        hostname: '**.together.ai',
      },
      // Hugging Face (some Replicate outputs)
      {
        protocol: 'https',
        hostname: 'cdn-lfs.huggingface.co',
      },
      {
        protocol: 'https',
        hostname: '**.huggingface.co',
      },
      // Local ComfyUI — data URIs are handled in code, but allow localhost
      // for cases where ComfyUI serves images via URL
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      // Docker internal host (Mac/Windows Docker Desktop)
      {
        protocol: 'http',
        hostname: 'host.docker.internal',
      },
    ],
    // Pixel art assets look best uncompressed — keep quality high
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },

  // ---------------------------------------------------------------------------
  // Prisma + heavy native modules must run in the Node.js runtime, not Edge
  // ---------------------------------------------------------------------------
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },

  // ---------------------------------------------------------------------------
  // CORS headers for the API.
  // Allow-Credentials is intentionally NOT set at this level — setting it
  // alongside a wildcard origin is a security misconfiguration. Individual
  // routes that genuinely need credentials (e.g. auth callbacks) handle it
  // themselves. This header set is for unauthenticated/BYOK cross-origin use.
  // ---------------------------------------------------------------------------
  async headers() {
    const origin = process.env.CORS_ORIGIN ??
      (process.env.NODE_ENV === 'production'
        ? (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://wokgen.wokspec.org')
        : 'http://localhost:3000');
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin',  value: origin },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,PATCH,DELETE,OPTIONS' },
          {
            key:   'Access-Control-Allow-Headers',
            value: [
              'X-CSRF-Token',
              'X-Requested-With',
              'Accept',
              'Accept-Version',
              'Content-Length',
              'Content-MD5',
              'Content-Type',
              'Date',
              'X-Api-Version',
              'Authorization',
              'X-Provider-Key',
              'X-Provider',
            ].join(', '),
          },
        ],
      },
    ];
  },

  // ---------------------------------------------------------------------------
  // Redirects — keep old paths working if ever restructured
  // ---------------------------------------------------------------------------
  async redirects() {
    return [
      // Mode migration — preserve existing shared links
      { source: '/studio',  destination: '/pixel/studio',  permanent: false },
      { source: '/gallery', destination: '/pixel/gallery', permanent: false },
      // Legacy convenience aliases
      { source: '/generate', destination: '/pixel/studio', permanent: false },
      { source: '/art',      destination: '/pixel/gallery', permanent: false },
    ];
  },

  // ---------------------------------------------------------------------------
  // Standalone output — for Docker/self-hosted builds only.
  // Disabled for Vercel (Vercel manages its own output format).
  // Uncomment this line if building a Docker image:
  // output: 'standalone',
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Webpack customisation
  // ---------------------------------------------------------------------------
  webpack(config, { isServer }) {
    // Exclude server-only Prisma files from the client bundle
    if (!isServer) {
      config.resolve = config.resolve ?? {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs:     false,
        net:    false,
        tls:    false,
        crypto: false,
      };
    }
    return config;
  },

  // ---------------------------------------------------------------------------
  // TypeScript / ESLint build behaviour
  // ---------------------------------------------------------------------------
  typescript: {
    // Type errors must not ship to production. Fix TS errors rather than ignoring them.
    ignoreBuildErrors: false,
  },

  eslint: {
    // Lint is run as a separate CI step; do not block production builds.
    ignoreDuringBuilds: true,
  },

  // Reduce build output noise
  poweredByHeader: false,
};

// Wrap with Sentry (no-ops when SENTRY_DSN is not set)
const { withSentryConfig } = require('@sentry/nextjs');
module.exports = withSentryConfig(nextConfig, {
  silent: true,        // suppress Sentry CLI output during builds
  hideSourceMaps: true,
  disableLogger: true,
  // Only upload source maps when SENTRY_AUTH_TOKEN is set
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
