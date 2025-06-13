import type { NextConfig } from 'next';

interface Rewrite {
  source: string;
  destination: string;
}

const nextConfig: NextConfig = {
  // Configuration moderne pour Next.js
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '80',
        pathname: '/api/**',
      },
    ],
  },
  async rewrites(): Promise<Rewrite[]> {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:80/api/:path*',
      },
    ];
  },
};

export default nextConfig;
