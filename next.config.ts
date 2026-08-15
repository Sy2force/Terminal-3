import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Supabase Storage — product photography and editorial imagery.
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
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
