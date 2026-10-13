import type { NextConfig } from "next";

process.loadEnvFile("../../.env");

const nextConfig: NextConfig = {
  devIndicators: false,
  transpilePackages: ["@scru/core", "@scru/db"],
  serverExternalPackages: ["postgres"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
