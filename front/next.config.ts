import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration moderne pour Next.js
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:80/api/:path*',
      },
    ];
  },
};

export default nextConfig;