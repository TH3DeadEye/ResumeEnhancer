import type { NextConfig } from 'next';
import path from 'path';

const CSP = [
  "default-src 'self'",
  // Next.js requires unsafe-inline + unsafe-eval for its runtime chunks and GSAP
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  // Amplify / Cognito / API Gateway all live under *.amazonaws.com
  "connect-src 'self' https://*.amazonaws.com https://*.amazoncognito.com https://cognito-idp.us-west-2.amazonaws.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'X-Frame-Options',           value: 'DENY' },
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy',   value: CSP },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Silence the multiple-lockfiles warning by declaring the correct root
  outputFileTracingRoot: path.join(__dirname),

  // No remote image sources are currently used in the active codebase
  images: {
    remotePatterns: [],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  env: {
    // Add your AWS region and other public configs here when ready
    // AWS_REGION: process.env.AWS_REGION,
  },
};

export default nextConfig;
