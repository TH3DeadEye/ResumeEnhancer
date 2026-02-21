import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  
  // Environment variables that will be available on the client side
  env: {
    // Add your AWS region and other public configs here when ready
    // AWS_REGION: process.env.AWS_REGION,
    // COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
  },
};

export default nextConfig;
