import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";
import { getActivePromotions } from "@/lib/data/promotions";
import { getCategories, getNewArrivals, getPublishedProducts, getProductsByIds } from "@/lib/data/catalog";
import type { ProductWithMedia } from "@/lib/data/catalog";
import { getFavoriteProductIds } from "@/lib/data/favorites";
import { getPublishedPosts } from "@/lib/data/content";
import { getHomepageSections } from "@/lib/data/homepage";
import { getPublishedPageContent, buildPageMetadata } from "@/lib/data/page-contents";
import { HomepageRenderer } from "@/components/home/homepage-renderer";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("home", {
    title: "Terminal 3 — Cave à vin et épicerie fine à Jérusalem",
    description:
      "Vins casher, spiritueux d'exception, saumon fumé, charcuterie et plateaux pour vos réceptions à Jérusalem.",
    canonical: "/",
  });
}

export default async function HomePage() {
  const [
    settings,
    promotions,
    newArrivals,
    posts,
    categories,
    favoriteIds,
    sections,
    pageContent,
  ] = await Promise.all([
    getSiteSettings(),
    getActivePromotions({ limit: 5 }),
    getNewArrivals(8),
    getPublishedPosts(6),
    getCategories(),
    getFavoriteProductIds(),
    getHomepageSections(),
    getPublishedPageContent("home"),
  ]);

  const categorySlugs = sections
    .filter((s) => s.section_type === "FEATURED_CATEGORY")
    .map((s) => s.config.category_slug as string)
    .filter(Boolean);

  const categoryProducts: Record<string, ProductWithMedia[]> = {};
  await Promise.all(
    categorySlugs.map(async (slug) => {
      categoryProducts[slug] = await getPublishedProducts({ categorySlug: slug, limit: 8 });
    }),
  );

  // Hero bottle carousel — admin-picked products from /admin/couvertures,
  // stored on the HERO homepage_sections row as config.bottle_ids.
  // Falls back to the latest arrival when nothing has been configured.
  const heroSection = sections.find((s) => s.section_type === "HERO");
  const heroBottleIds = Array.isArray(heroSection?.config?.bottle_ids)
    ? (heroSection.config.bottle_ids as string[]).slice(0, 7)
    : [];
  const heroBottles = heroBottleIds.length
    ? await getProductsByIds(heroBottleIds)
    : newArrivals.slice(0, 1);

  return (
    <HomepageRenderer
      sections={sections}
      settings={settings}
      promotions={promotions}
      newArrivals={newArrivals}
      posts={posts}
      categories={categories}
      favoriteIds={favoriteIds}
      categoryProducts={categoryProducts}
      heroBottles={heroBottles}
      pageContent={pageContent}
    />
  );
}

