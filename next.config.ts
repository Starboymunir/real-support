import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  transpilePackages: ['aws-amplify', '@aws-amplify/storage', '@aws-amplify/core'],
};

export default nextConfig;
