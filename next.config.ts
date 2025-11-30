import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["127.0.0.1"], // أو حسب السيرفر الخاص بك
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    turbo: {
      loaders: {
        // loaders config هنا لو محتاج، أو خليه فارغ
      },
    },
  },
};

export default nextConfig;
