import type { MetadataRoute } from "next";
import { getCategories, getPublishedProducts } from "@/lib/data/catalog";
import { getPublishedPosts } from "@/lib/data/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://terminal3.example";

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/new`, lastModified: new Date(), priority: 0.7 },
    { url: `${baseUrl}/promotions`, lastModified: new Date(), priority: 0.7 },
    { url: `${baseUrl}/club`, lastModified: new Date(), priority: 0.6 },
    { url: `${baseUrl}/inspirations`, lastModified: new Date(), priority: 0.6 },
  ];

  const [categories, products, posts] = await Promise.all([
    getCategories(),
    getPublishedProducts({ limit: 500 }),
    getPublishedPosts(100),
  ]);

  const categoryUrls: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/categories/${cat.slug}`,
    lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
    priority: 0.7,
  }));

  const productUrls: MetadataRoute.Sitemap = products.map((prod) => ({
    url: `${baseUrl}/products/${prod.slug}`,
    lastModified: prod.updated_at ? new Date(prod.updated_at) : new Date(),
    priority: 0.8,
  }));

  const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/inspirations/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
    priority: 0.5,
  }));

  return [...staticPages, ...categoryUrls, ...productUrls, ...postUrls];
}
