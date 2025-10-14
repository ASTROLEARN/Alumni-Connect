import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  // Ensure proper chunk loading
  output: 'standalone',
  // Handle large files
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
