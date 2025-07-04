import type { NextConfig } from 'next';

const cdnDomain = process.env.NEXT_PUBLIC_CDN_URL
  ? process.env.NEXT_PUBLIC_CDN_URL.split('//')[1]
  : '202502-test-bucket.s3.ap-northeast-1.amazonaws.com';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com', cdnDomain, 'lh3.googleusercontent.com'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
