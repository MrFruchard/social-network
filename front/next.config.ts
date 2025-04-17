import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration moderne pour Next.js
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:80/api/:path*",
      },
    ];
  },
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 1000, // Vérifie les changements toutes les 1000ms
      aggregateTimeout: 300, // Délai avant de recompiler
    };
    return config;
  },
};

export default nextConfig;
