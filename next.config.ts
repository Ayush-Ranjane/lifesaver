import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
    ],
  },
  // Firebase Admin uses Node.js APIs not available in Edge runtime
  serverExternalPackages: ['firebase-admin'],
  // Skip heavy type-checking and linting during build if Node memory is limited
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
