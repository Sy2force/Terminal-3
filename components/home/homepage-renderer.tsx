import Image from "next/image";
import type { HomepageSectionRow, PageContentRow } from "@/types/database";
import type { SiteSettings } from "@/lib/settings";
import type { ProductWithMedia } from "@/lib/data/catalog";
import type { PromotionWithProduct } from "@/lib/data/promotions";
import type { CategoryRow } from "@/types/database";
import type { ContentPostRow } from "@/types/database";
import { LuxuryHeroSection } from "@/components/home/luxury-hero-section";
import { NotreUniversSection } from "@/components/home/notre-univers-section";
import { SelectionCavisteSection } from "@/components/home/selection-caviste-section";
import { PromotionsLuxurySection } from "@/components/home/promotions-luxury-section";
import { PlattersSection } from "@/components/home/platters-section";
import { StorePresentationSection } from "@/components/home/store-presentation-section";
import { CellarDescentSection } from "@/components/home/cellar-descent";
import { TodaySection } from "@/components/home/today-section";
import { FeaturedCategorySection } from "@/components/home/featured-category-section";
import { SalmonGallerySection } from "@/components/home/salmon-gallery-section";
import { InspirationSection } from "@/components/home/inspiration-section";
import { ClubSection } from "@/components/home/club-section";

interface HomepageRendererProps {
  sections: HomepageSectionRow[];
  settings: SiteSettings;
  promotions: PromotionWithProduct[];
  newArrivals: ProductWithMedia[];
  posts: ContentPostRow[];
  categories: CategoryRow[];
  favoriteIds: Set<string>;
  categoryProducts: Record<string, ProductWithMedia[]>;
  heroBottles: ProductWithMedia[];
  pageContent?: PageContentRow | null;
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
  heroBottles,
  pageContent,
}: HomepageRendererProps) {
  const flagshipPromotion = promotions.find((p) => p.featured) ?? promotions[0];
  void flagshipPromotion;

  return (
    <div className="relative">
      {/* Global landing page background image */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <Image
          src="/images/terminal-3/couvertures/store.webp"
          alt=""
          fill
          className="object-cover opacity-[0.12]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-noir-profond/85" />
      </div>

      <LuxuryHeroSection
        settings={settings}
        bottles={heroBottles}
        title={pageContent?.title ?? undefined}
        subtitle={pageContent?.subtitle ?? undefined}
        backgroundImage={pageContent?.og_image_url ?? undefined}
      />
      <NotreUniversSection categories={categories} />
      <SelectionCavisteSection products={newArrivals} favoriteIds={favoriteIds} />
      {promotions.length > 0 && <PromotionsLuxurySection promotions={promotions} settings={settings} />}
      <PlattersSection settings={settings} />
      <StorePresentationSection settings={settings} />
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
    </div>
  );
}