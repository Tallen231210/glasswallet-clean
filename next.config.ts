import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: process.cwd(),
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  output: 'standalone',
  trailingSlash: false,
  async generateBuildId() {
    return 'glasswallet-build'
  },
  async redirects() {
    return [
      {
        source: '/activity',
        destination: '/dashboard',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
