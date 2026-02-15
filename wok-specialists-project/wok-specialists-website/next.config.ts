import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
  trailingSlash: true,
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_GAME_CLIENT_URL: process.env.NEXT_PUBLIC_GAME_CLIENT_URL || 'http://localhost:3002',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
};

export default nextConfig;
