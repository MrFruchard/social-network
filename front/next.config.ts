import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpackDevMiddleware: (
    config: import("webpack-dev-middleware").Options & { watchOptions?: any }
  ) => {
    config.watchOptions = {
      poll: 1000, // Vérifie les changements toutes les 1000ms
      aggregateTimeout: 300, // Délai avant de recompiler
    };
    return config;
  },
};

export default nextConfig;
