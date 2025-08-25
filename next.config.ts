import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Fix Turbopack root directory warning
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
