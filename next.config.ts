import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'backend.real-support.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      '@mui/material',
      '@mui/lab',
      '@mui/system',
      '@mui/x-data-grid',
      '@mui/x-date-pickers',
      '@mui/icons-material',
      '@iconify/react',
      '@emotion/react',
      '@emotion/styled',
      'framer-motion',
      'lucide-react',
      'react-icons',
      'lodash',
      'date-fns',
      'react-hook-form',
      '@hookform/resolvers',
      'notistack',
      'yup',
      'apexcharts',
      'react-apexcharts',
      'numeral',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-icons',
      '@radix-ui/react-label',
      '@radix-ui/react-tabs',
    ],
  },
  transpilePackages: ['aws-amplify', '@aws-amplify/storage', '@aws-amplify/core', '@react-pdf/renderer'],
};

export default nextConfig;
