import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Truck, Store, Settings2 } from "lucide-react";
import { getProductBySlug, getPlatterProducts } from "@/lib/data/catalog";
import { getFavoriteProductIds } from "@/lib/data/favorites";
import { getProductReviews } from "@/lib/data/reviews";
import { getSiteSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo-mode";
import { agorotToILS } from "@/lib/money";
import { WineBreadcrumb } from "@/components/wine-detail/wine-breadcrumb";
import { WineGallery } from "@/components/wine-detail/wine-gallery";
import { WinePurchasePanel, type PurchaseVariantOption } from "@/components/wine-detail/wine-purchase-panel";
import { WineInfoAccordion, type AccordionSection } from "@/components/wine-detail/wine-info-accordion";
import { WineReviews } from "@/components/wine-detail/wine-reviews";
import { SimilarWines } from "@/components/wine-detail/similar-wines";
import { ShareButtons } from "@/components/wine-detail/share-buttons";
import { PlatterCard } from "@/components/catalog/platter-card";

export const revalidate = 60;

/**
 * A platter detail page only ever serves products actually flagged as a
 * platter (`product_type === "PLATTER"`) — platters can legitimately
 * belong to different categories (saumon, charcuterie...), so the check
 * is on `product_type`, not on a single category slug. Anything else
 * (or a missing slug) renders the standard 404.
 */
async function getPlatter(slug: string) {
  const product = await getProductBySlug(slug);
  if (!product) return null;
  if (product.product_type !== "PLATTER") return null;
  return product;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPlatter(slug);
  if (!product) return {};

  const name = product.name_fr || product.name_he;
  const title = `${name} | Terminal 3`;
  const description =
    product.description_fr ?? `${name} — un plateau composé par Terminal 3, Jérusalem.`;
  const cover = product.media?.[0];

  return {
    title,
    description,
    alternates: { canonical: `/plateaux/${product.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      images: cover ? [{ url: cover.url, alt: cover.alt ?? name }] : undefined,
    },
  };
}

export default async function PlatterDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getPlatter(slug);
  if (!product) notFound();

  const [settings, favoriteIds, allPlatters, reviews, currentUser] = await Promise.all([
    getSiteSettings(),
    getFavoriteProductIds(),
    getPlatterProducts(),
    getProductReviews(product.id),
    isDemoMode()
      ? Promise.resolve(null)
      : createClient().then((supabase) => supabase.auth.getUser().then(({ data }) => data.user)),
  ]);

  const name = product.name_fr || product.name_he;
  const media = [...(product.media ?? [])].sort((a, b) => a.display_order - b.display_order);
  const sortedVariants = [...(product.variants ?? [])].sort((a, b) => a.display_order - b.display_order);
  const defaultVariant = sortedVariants.find((v) => v.is_default) ?? sortedVariants[0];

  const purchaseVariants: PurchaseVariantOption[] = sortedVariants.map((v) => ({
    id: v.id,
    label: v.label,
    priceAgorot: v.regular_price_agorot,
    compareAgorot: product.compare_at_price_agorot,
    pricingUnit: v.pricing_unit,
    availability: v.availability_status,
  }));

  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://terminal3.co.il"}/plateaux/${product.slug}`;

  const similarPlatters = allPlatters.filter((p) => p.id !== product.id).slice(0, 4);

  const accordionSections: AccordionSection[] = [
    {
      id: "description",
      title: "Description",
      defaultOpen: true,
      content: product.description_fr ? (
        <p className="text-sm leading-relaxed text-noir-profond/80">{product.description_fr}</p>
      ) : null,
    },
    {
      id: "composition",
      title: "Composition",
      content: product.composition_text ? (
        <p className="text-sm leading-relaxed text-noir-profond/80">{product.composition_text}</p>
      ) : null,
    },
    {
      id: "conservation",
      title: "Conservation & service",
      content: product.storage_info || product.how_to_serve ? (
        <div className="space-y-2 text-sm text-noir-profond/80">
          {product.storage_info && <p>{product.storage_info}</p>}
          {product.how_to_serve && <p>{product.how_to_serve}</p>}
          {product.advance_order_hours > 0 && (
            <p className="text-xs text-gris-chaud">
              Commande à passer au moins {product.advance_order_hours}h à l&rsquo;avance.
            </p>
          )}
        </div>
      ) : null,
    },
    {
      id: "livraison",
      title: "Livraison",
      content: (
        <div className="space-y-3 text-sm text-noir-profond/80">
          <div className="flex items-start gap-3">
            <Store className="mt-0.5 h-4 w-4 shrink-0 text-bordeaux-principal" aria-hidden />
            <span>Retrait gratuit en boutique — {settings.STORE_ADDRESS}</span>
          </div>
          <div className="flex items-start gap-3">
            <Truck className="mt-0.5 h-4 w-4 shrink-0 text-bordeaux-principal" aria-hidden />
            <span>Livraison à Jérusalem — sur demande, selon délai de préparation.</span>
          </div>
        </div>
      ),
    },
    {
      id: "avis",
      title: `Avis (${reviews.length})`,
      content: (
        <WineReviews
          productId={product.id}
          pagePath={`/plateaux/${product.slug}`}
          aggregateRating={product.rating}
          aggregateCount={product.review_count}
          reviews={reviews}
          canReview={Boolean(currentUser)}
        />
      ),
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: product.description_fr ?? undefined,
    image: media[0]?.url ? [media[0].url] : undefined,
    ...(product.rating != null && product.review_count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.review_count,
          },
        }
      : {}),
    offers:
      defaultVariant?.regular_price_agorot != null
        ? {
            "@type": "Offer",
            priceCurrency: "ILS",
            price: agorotToILS(defaultVariant.regular_price_agorot).toFixed(2),
            availability:
              defaultVariant.availability_status === "OUT_OF_STOCK"
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
            url: pageUrl,
          }
        : undefined,
  };

  return (
    <div className="min-h-screen bg-fond-papier">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <WineBreadcrumb basePath="/plateaux" catalogLabel="Plateaux" domaine={null} name={name} />

      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="rounded-sm bg-beige-fonce/60 p-4 sm:p-8">
            <WineGallery images={media} name={name} />
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-bordeaux-principal">
                {product.category?.name_fr ?? "Plateau"}
              </p>
              <h1 className="mt-2 font-serif text-4xl leading-tight text-noir-profond sm:text-5xl">
                {name}
              </h1>
              {product.serves_min && product.serves_max && (
                <p className="mt-2 text-base text-gris-chaud">
                  Pour {product.serves_min} à {product.serves_max} personnes
                </p>
              )}

              {product.rating != null && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex text-or-principal" aria-hidden>
                    {"★".repeat(Math.round(product.rating))}
                    {"☆".repeat(5 - Math.round(product.rating))}
                  </div>
                  <span className="text-sm text-gris-chaud">
                    {product.rating.toFixed(1)} · {product.review_count} avis
                  </span>
                </div>
              )}

              {product.description_fr && (
                <p className="mt-4 text-sm leading-relaxed text-noir-profond/80">
                  {product.description_fr}
                </p>
              )}
            </div>

            <WinePurchasePanel
              basePath="/plateaux"
              productId={product.id}
              productSlug={product.slug}
              productName={name}
              domaine={null}
              extraDetail={defaultVariant?.label ?? null}
              imageUrl={media[0]?.url ?? null}
              variantId={defaultVariant?.id ?? null}
              variantLabel={defaultVariant?.label ?? null}
              priceAgorot={defaultVariant?.regular_price_agorot ?? null}
              compareAgorot={product.compare_at_price_agorot}
              pricingUnit={defaultVariant?.pricing_unit}
              availability={defaultVariant?.availability_status ?? product.availability_status}
              whatsapp={settings.STORE_WHATSAPP}
              pageUrl={pageUrl}
              initialFavorited={favoriteIds.has(product.id)}
              variants={purchaseVariants.length > 1 ? purchaseVariants : undefined}
            />

            {product.customizable && (
              <Link
                href={`/plateaux/composer?base=${product.slug}`}
                className="flex items-center justify-center gap-2 rounded-sm border border-brun-cave/25 px-6 py-3 text-sm font-medium uppercase tracking-widest text-noir-profond transition-colors hover:border-bordeaux-principal hover:text-bordeaux-principal"
              >
                <Settings2 className="h-4 w-4" aria-hidden />
                Personnaliser ce plateau
              </Link>
            )}

            <ShareButtons title={name} url={pageUrl} />
          </div>
        </div>

        <div className="mt-14">
          <WineInfoAccordion sections={accordionSections} />
        </div>

        <div className="mt-14">
          <SimilarWines
            wines={similarPlatters}
            favoriteIds={favoriteIds}
            surtitle="Pour vos réceptions"
            title="Dans le même esprit"
            CardComponent={PlatterCard}
          />
        </div>
      </div>
    </div>
  );
}
