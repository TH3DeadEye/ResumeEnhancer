import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Silence the multiple-lockfiles warning by declaring the correct root
  experimental: {
    outputFileTracingRoot: path.join(__dirname),
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  env: {
    // Add your AWS region and other public configs here when ready
    // AWS_REGION: process.env.AWS_REGION,
  },
};

export default nextConfig;
