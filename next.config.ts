import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath: "/hospital-management",
  assetPrefix: "/hospital-management",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;