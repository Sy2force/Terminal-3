import { getSiteSettings } from "@/lib/settings";
import { getActivePromotions } from "@/lib/data/promotions";
import { getCategories, getNewArrivals, getPublishedProducts } from "@/lib/data/catalog";
import type { ProductWithMedia } from "@/lib/data/catalog";
import { getFavoriteProductIds } from "@/lib/data/favorites";
import { getPublishedPosts } from "@/lib/data/content";
import { getHomepageSections } from "@/lib/data/homepage";
import { HomepageRenderer } from "@/components/home/homepage-renderer";

export const revalidate = 60;

export default async function HomePage() {
  const [
    settings,
    promotions,
    newArrivals,
    posts,
    categories,
    favoriteIds,
    sections,
  ] = await Promise.all([
    getSiteSettings(),
    getActivePromotions({ limit: 5 }),
    getNewArrivals(8),
    getPublishedPosts(6),
    getCategories(),
    getFavoriteProductIds(),
    getHomepageSections(),
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
    />
  );
}

