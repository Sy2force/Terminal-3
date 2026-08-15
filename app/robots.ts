import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://terminal3.example";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/account", "/compte", "/courier", "/cart", "/checkout", "/orders"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
