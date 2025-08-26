import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Turbopack deaktiviert um Chunk-Loading-Probleme zu vermeiden
};

export default nextConfig;
