import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    // Handle worker files
    config.module.rules.push({
      test: /ffmpeg-worker\.js$/,
      type: "asset/resource",
    });

    return config;
  },
};

export default nextConfig;
