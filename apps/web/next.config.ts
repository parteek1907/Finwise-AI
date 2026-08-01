import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // @ts-ignore - 'eslint' is a valid Next.js config property but might be missing from the local type definition
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
