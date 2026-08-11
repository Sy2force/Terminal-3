import type { HomepageSectionRow } from "@/types/database";
import type { SiteSettings } from "@/lib/settings";
import type { ProductWithMedia } from "@/lib/data/catalog";
import type { PromotionWithProduct } from "@/lib/data/promotions";
import type { CategoryRow } from "@/types/database";
import type { ContentPostRow } from "@/types/database";
import { HeroSection } from "@/components/home/hero-section";
import { CellarDescentSection } from "@/components/home/cellar-descent";
import { TodaySection } from "@/components/home/today-section";
import { FeaturedCategorySection } from "@/components/home/featured-category-section";
import { SalmonGallerySection } from "@/components/home/salmon-gallery-section";
import { InspirationSection } from "@/components/home/inspiration-section";
import { ClubSection } from "@/components/home/club-section";
import { TerminalCarousel } from "@/components/home/terminal-carousel";
import { MarketingSection } from "@/components/home/marketing-section";

interface HomepageRendererProps {
  sections: HomepageSectionRow[];
  settings: SiteSettings;
  promotions: PromotionWithProduct[];
  newArrivals: ProductWithMedia[];
  posts: ContentPostRow[];
  categories: CategoryRow[];
  favoriteIds: Set<string>;
  categoryProducts: Record<string, ProductWithMedia[]>;
}

function getConfigString(config: Record<string, unknown>, key: string): string | undefined {
  const val = config[key];
  return typeof val === "string" ? val : undefined;
}

function getConfigNumber(config: Record<string, unknown>, key: string, fallback: number): number {
  const val = config[key];
  return typeof val === "number" ? val : fallback;
}

export function HomepageRenderer({
  sections,
  settings,
  promotions,
  newArrivals,
  posts,
  categories,
  favoriteIds,
  categoryProducts,
}: HomepageRendererProps) {
  const flagshipPromotion = promotions.find((p) => p.featured) ?? promotions[0];
  void flagshipPromotion;

  return (
    <>
      <HeroSection />
      <TerminalCarousel />
      <MarketingSection />
      {sections.map((section) => {
        const config = section.config;
        switch (section.section_type) {
          case "HERO":
            return null; // Hero is now rendered above

          case "CELLAR_DESCENT":
            return <CellarDescentSection key={section.id} />;

          case "PROMOTIONS":
            return (
              <TodaySection
                key={section.id}
                promotions={promotions}
                newArrivals={newArrivals}
              />
            );

          case "NEW_PRODUCTS": {
            const limit = getConfigNumber(config, "limit", 5);
            return (
              <TodaySection
                key={section.id}
                promotions={[]}
                newArrivals={newArrivals.slice(0, limit)}
              />
            );
          }

          case "FEATURED_CATEGORY": {
            const slug = getConfigString(config, "category_slug");
            const title = getConfigString(config, "title") ?? "Collection";
            const subtitle = getConfigString(config, "subtitle");
            const limit = getConfigNumber(config, "limit", 4);
            const category = slug ? categories.find((c) => c.slug === slug) ?? null : null;
            const products = slug ? (categoryProducts[slug] ?? []).slice(0, limit) : [];
            return (
              <FeaturedCategorySection
                key={section.id}
                title={title}
                subtitle={subtitle}
                category={category}
                products={products}
                favoriteIds={favoriteIds}
              />
            );
          }

          case "FEATURED_PRODUCTS": {
            const title = getConfigString(config, "title") ?? "Sélection";
            const productIds = (config.product_ids as string[]) ?? [];
            const products = newArrivals.filter((p) => productIds.includes(p.id));
            return (
              <FeaturedCategorySection
                key={section.id}
                title={title}
                subtitle={undefined}
                category={null}
                products={products}
                favoriteIds={favoriteIds}
              />
            );
          }

          case "GALLERY":
            return (
              <SalmonGallerySection
                key={section.id}
                images={settings.SALMON_GALLERY_IMAGES}
              />
            );

          case "INSPIRATIONS": {
            const limit = getConfigNumber(config, "limit", 6);
            return (
              <InspirationSection
                key={section.id}
                posts={posts.slice(0, limit)}
              />
            );
          }

          case "MEMBERSHIP":
            return <ClubSection key={section.id} settings={settings} />;

          case "EDITORIAL_IMAGE_TEXT":
            // Reserved for future editorial blocks — admin can enable but
            // the component is not yet built. Safe no-op.
            return null;

          case "PLATTERS":
            // Reserved — same as FEATURED_CATEGORY with platter slug
            return null;

          case "STORE_INFORMATION":
            // Reserved — store info is in footer
            return null;

          default:
            return null;
        }
      })}
    </>
  );
}
