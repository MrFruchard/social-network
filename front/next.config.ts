import type { NextConfig } from "next";

interface Rewrite {
  source: string;
  destination: string;
}

interface WatchOptions {
  poll: number;
  aggregateTimeout: number;
}

const nextConfig: NextConfig = {
  // Configuration moderne pour Next.js
  async rewrites(): Promise<Rewrite[]> {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:80/api/:path*",
      },
    ];
  },
  webpackDevMiddleware: (config: { watchOptions?: WatchOptions }) => {
    config.watchOptions = {
      poll: 1000, // Vérifie les changements toutes les 1000ms
      aggregateTimeout: 300, // Délai avant de recompiler
    };
    return config;
  },
};

export default nextConfig;
