import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["127.0.0.1"], // أو حسب السيرفر الخاص بك
  },
  experimental: {
    turbo: false, // ✅ تعطيل Turbopack واستعمال Webpack
  },
};

export default nextConfig;
