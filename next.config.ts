import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    serverActions: {
      allowedOrigins: ["127.0.0.1:50824", "127.0.0.1:3000", "localhost:3000"],
    },
  },
  images: {
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Supabase Storage — product photography and editorial imagery.
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  outputFileTracingExcludes: {
    "/*": ["public/images/terminal-3/**/*"],
  },
  async redirects() {
    return [
      // Legacy URL from before the /vins wine catalog existed.
      {
        source: "/categories/alcohol",
        destination: "/vins",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
