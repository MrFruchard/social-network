import type { NextConfig } from 'next';

interface Rewrite {
  source: string;
  destination: string;
}

const nextConfig: NextConfig = {
  // Configuration moderne pour Next.js
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
