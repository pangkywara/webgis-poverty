import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Turbopack's on-disk dev cache (default-on since Next 16.1) grew to ~4GB
    // here and pinned next-server at ~700% CPU churning it while idle.
    // Cold compiles take ~2s in this project, so the cache isn't worth it.
    turbopackFileSystemCacheForDev: false,
  },
  async rewrites() {
    return [
      {
        source: "/households/:path*",
        destination: `${backendUrl}/households/:path*`,
      },
      {
        source: "/auth/:path*",
        destination: `${backendUrl}/auth/:path*`,
      },
      {
        source: "/poi/:path*",
        destination: `${backendUrl}/poi/:path*`,
      },
      {
        source: "/land/:path*",
        destination: `${backendUrl}/land/:path*`,
      },
      {
        source: "/gas-station/:path*",
        destination: `${backendUrl}/gas-station/:path*`,
      },
      {
        source: "/health",
        destination: `${backendUrl}/health`,
      },
    ];
  },
};

export default nextConfig;
