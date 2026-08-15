import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Truck, Store, AlertTriangle } from "lucide-react";
import { getProductBySlug, getPublishedProducts } from "@/lib/data/catalog";
import { getFavoriteProductIds } from "@/lib/data/favorites";
import { getProductReviews } from "@/lib/data/reviews";
import { getSiteSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo-mode";
import { agorotToILS } from "@/lib/money";
import { WineBreadcrumb } from "@/components/wine-detail/wine-breadcrumb";
import { WineGallery } from "@/components/wine-detail/wine-gallery";
import { WinePurchasePanel, type PurchaseVariantOption } from "@/components/wine-detail/wine-purchase-panel";
import { WineSpecs } from "@/components/wine-detail/wine-specs";
import { WineInfoAccordion, type AccordionSection } from "@/components/wine-detail/wine-info-accordion";
import { WineReviews } from "@/components/wine-detail/wine-reviews";
import { SimilarWines } from "@/components/wine-detail/similar-wines";
import { ShareButtons } from "@/components/wine-detail/share-buttons";
import { WinePairingSuggestions } from "@/components/wine-detail/wine-pairing-suggestions";
import { ComplementarySuggestions } from "@/components/charcuterie-detail/complementary-suggestions";
import { AddToPlatterButton } from "@/components/commerce/add-to-platter-button";
import { CharcuterieCard } from "@/components/catalog/charcuterie-card";
import { CHARCUTERIE_SUBCATEGORY_LABELS } from "@/lib/charcuterie";

export const revalidate = 60;

/**
 * A charcuterie detail page only ever serves products that belong to the
 * charcuterie category — a slug that resolves to a wine, spirit, or any
 * other category (or to nothing at all) renders the standard 404, never
 * a technical error.
 */
async function getCharcuterie(slug: string) {
  const product = await getProductBySlug(slug);
  if (!product) return null;
  if (product.category?.slug !== "charcuterie") return null;
  return product;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCharcuterie(slug);
  if (!product) return {};

  const name = product.name_fr || product.name_he;
  const categoryLabel = product.subcategory
    ? CHARCUTERIE_SUBCATEGORY_LABELS[product.subcategory] ?? product.subcategory
    : "Charcuterie";
  const title = `${name} ${product.kosher_status ? "casher " : ""}| Terminal 3`;
  const description =
    product.description_fr ??
    `${name} — ${categoryLabel}, disponible chez Terminal 3, Jérusalem.`;
  const cover = product.media?.[0];

  return {
    title,
    description,
    alternates: { canonical: `/charcuterie/${product.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      images: cover ? [{ url: cover.url, alt: cover.alt ?? name }] : undefined,
    },
  };
}

export default async function CharcuterieDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getCharcuterie(slug);
  if (!product) notFound();

  const [settings, favoriteIds, allCharcuterie, reviews, currentUser] = await Promise.all([
    getSiteSettings(),
    getFavoriteProductIds(),
    getPublishedProducts({ categorySlug: "charcuterie" }),
    getProductReviews(product.id),
    isDemoMode()
      ? Promise.resolve(null)
      : createClient().then((supabase) => supabase.auth.getUser().then(({ data }) => data.user)),
  ]);

  const name = product.name_fr || product.name_he;
  const media = [...(product.media ?? [])].sort((a, b) => a.display_order - b.display_order);
  const sortedVariants = [...(product.variants ?? [])].sort((a, b) => a.display_order - b.display_order);
  const defaultVariant = sortedVariants.find((v) => v.is_default) ?? sortedVariants[0];
  const categoryLabel = product.subcategory
    ? CHARCUTERIE_SUBCATEGORY_LABELS[product.subcategory] ?? product.subcategory
    : product.category?.name_fr;

  const purchaseVariants: PurchaseVariantOption[] = sortedVariants.map((v) => ({
    id: v.id,
    label: v.label,
    priceAgorot: v.regular_price_agorot,
    compareAgorot: product.compare_at_price_agorot,
    pricingUnit: v.pricing_unit,
    availability: v.availability_status,
  }));

  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://terminal3.co.il"}/charcuterie/${product.slug}`;

  const similarCharcuterie = allCharcuterie
    .filter((c) => c.id !== product.id)
    .sort((a, b) => {
      const score = (c: typeof a) =>
        (c.subcategory === product.subcategory ? 2 : 0) +
        (c.meat_type === product.meat_type ? 1 : 0) +
        (c.brand === product.brand ? 1 : 0);
      return score(b) - score(a);
    })
    .slice(0, 4);

  const specs = [
    { label: "Type", value: categoryLabel ?? "" },
    { label: "Marque", value: product.brand ?? "" },
    { label: "Type de viande", value: product.meat_type ?? "" },
    { label: "Format", value: defaultVariant?.label ?? "" },
    { label: "Poids", value: defaultVariant?.weight_g ? `${defaultVariant.weight_g} g` : "" },
    { label: "Cacherout", value: product.kosher_status ?? "" },
    { label: "Pays d'origine", value: product.origin ?? "" },
    { label: "Référence", value: defaultVariant?.sku ?? "" },
  ];

  const hasCompositionInfo = Boolean(
    product.composition_text || product.allergen_info || product.nutrition_info || product.kosher_status,
  );
  const hasConservationInfo = Boolean(product.storage_info || product.expiration_info || product.how_to_serve);

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
      id: "details",
      title: "Détails",
      content: <WineSpecs specs={specs} />,
    },
    {
      id: "composition",
      title: "Composition & allergènes",
      content: hasCompositionInfo ? (
        <div className="space-y-3 text-sm text-noir-profond/80">
          {product.composition_text && (
            <p>
              <span className="font-medium text-noir-profond">Ingrédients : </span>
              {product.composition_text}
            </p>
          )}
          {product.allergen_info && (
            <div className="flex items-start gap-3 rounded-sm border border-bordeaux-principal/30 bg-bordeaux-principal/5 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-bordeaux-principal" aria-hidden />
              <p>
                <span className="font-medium text-bordeaux-principal">Allergènes : </span>
                {product.allergen_info}
              </p>
            </div>
          )}
          {product.nutrition_info && (
            <p>
              <span className="font-medium text-noir-profond">Informations nutritionnelles : </span>
              {product.nutrition_info}
            </p>
          )}
          {product.kosher_status && (
            <p>
              <span className="font-medium text-noir-profond">Cacherout : </span>
              {product.kosher_status}
            </p>
          )}
        </div>
      ) : null,
    },
    {
      id: "conservation",
      title: "Conservation",
      content: hasConservationInfo ? (
        <div className="space-y-2 text-sm text-noir-profond/80">
          {product.storage_info && <p>{product.storage_info}</p>}
          {product.expiration_info && <p>{product.expiration_info}</p>}
          {product.how_to_serve && (
            <p>
              <span className="font-medium text-noir-profond">Comment le déguster : </span>
              {product.how_to_serve}
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
            <span>Livraison à Jérusalem — délai estimé 24 à 48h</span>
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
          pagePath={`/charcuterie/${product.slug}`}
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
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    sku: defaultVariant?.sku ?? undefined,
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

      <WineBreadcrumb basePath="/charcuterie" catalogLabel="Charcuterie" domaine={product.brand} name={name} />

      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left: gallery, beige background */}
          <div className="rounded-sm bg-beige-fonce/60 p-4 sm:p-8">
            <WineGallery images={media} name={name} />
          </div>

          {/* Right: info, cream/paper background */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-bordeaux-principal">{categoryLabel}</p>
              <h1 className="mt-2 font-serif text-4xl leading-tight text-noir-profond sm:text-5xl">
                {name}
              </h1>
              {product.name_he && (
                <p dir="rtl" className="mt-1 text-sm text-gris-chaud">
                  {product.name_he}
                </p>
              )}
              <p className="mt-2 text-base text-gris-chaud">
                {[product.brand, defaultVariant?.label].filter(Boolean).join(" · ")}
              </p>

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
              basePath="/charcuterie"
              productId={product.id}
              productSlug={product.slug}
              productName={name}
              domaine={product.brand}
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

            {product.is_available_for_platter && (
              <AddToPlatterButton
                productId={product.id}
                productSlug={product.slug}
                productName={name}
                variantId={defaultVariant?.id ?? null}
                variantLabel={defaultVariant?.label ?? null}
                priceAgorot={defaultVariant?.regular_price_agorot ?? null}
                imageUrl={media[0]?.url ?? null}
              />
            )}

            <ShareButtons title={name} url={pageUrl} />
          </div>
        </div>

        {/* Accordion */}
        <div className="mt-14">
          <WineInfoAccordion sections={accordionSections} />
        </div>

        {/* Wine pairing */}
        <div className="mt-14">
          <WinePairingSuggestions favoriteIds={favoriteIds} />
        </div>

        {/* Complementary products */}
        <div className="mt-14">
          <ComplementarySuggestions excludeProductId={product.id} />
        </div>

        {/* Similar charcuterie */}
        <div className="mt-14">
          <SimilarWines
            wines={similarCharcuterie}
            favoriteIds={favoriteIds}
            surtitle="La sélection continue"
            title="Dans le même esprit"
            CardComponent={CharcuterieCard}
          />
        </div>
      </div>
    </div>
  );
}
