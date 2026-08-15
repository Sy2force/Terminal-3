import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Truck, Store, IdCard } from "lucide-react";
import { getProductBySlug, getPublishedProducts } from "@/lib/data/catalog";
import { getFavoriteProductIds } from "@/lib/data/favorites";
import { getProductReviews } from "@/lib/data/reviews";
import { getSiteSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo-mode";
import { agorotToILS } from "@/lib/money";
import { WineBreadcrumb } from "@/components/wine-detail/wine-breadcrumb";
import { WineGallery } from "@/components/wine-detail/wine-gallery";
import { WinePurchasePanel } from "@/components/wine-detail/wine-purchase-panel";
import { WineSpecs } from "@/components/wine-detail/wine-specs";
import { TastingProfile } from "@/components/wine-detail/tasting-profile";
import { WineInfoAccordion, type AccordionSection } from "@/components/wine-detail/wine-info-accordion";
import { WineReviews } from "@/components/wine-detail/wine-reviews";
import { SimilarWines } from "@/components/wine-detail/similar-wines";
import { ComplementaryProducts } from "@/components/wine-detail/complementary-products";
import { ShareButtons } from "@/components/wine-detail/share-buttons";
import { SpiritCard } from "@/components/catalog/spirit-card";
import { SUBCATEGORY_LABELS } from "@/lib/spirits";

export const revalidate = 60;

/**
 * A spirits detail page only ever serves products that belong to the
 * spiritueux category — a slug that resolves to a wine or fish product
 * (or to nothing at all) renders the standard 404, never a technical
 * error.
 */
async function getSpirit(slug: string) {
  const product = await getProductBySlug(slug);
  if (!product) return null;
  if (product.category?.slug !== "spiritueux") return null;
  return product;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getSpirit(slug);
  if (!product) return {};

  const name = product.name_fr || product.name_he;
  const categoryLabel = product.subcategory ? SUBCATEGORY_LABELS[product.subcategory] ?? product.subcategory : "Spiritueux";
  const title = `${name} – ${categoryLabel} | Terminal 3`;
  const description =
    product.description_fr ??
    `${name} — ${categoryLabel}${product.country ? ` de ${product.country}` : ""}, disponible chez Terminal 3, Jérusalem.`;
  const cover = product.media?.[0];

  return {
    title,
    description,
    alternates: { canonical: `/spiritueux/${product.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      images: cover ? [{ url: cover.url, alt: cover.alt ?? name }] : undefined,
    },
  };
}

export default async function SpiritDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getSpirit(slug);
  if (!product) notFound();

  const [settings, favoriteIds, allSpirits, reviews, currentUser] = await Promise.all([
    getSiteSettings(),
    getFavoriteProductIds(),
    getPublishedProducts({ categorySlug: "spiritueux" }),
    getProductReviews(product.id),
    isDemoMode()
      ? Promise.resolve(null)
      : createClient().then((supabase) => supabase.auth.getUser().then(({ data }) => data.user)),
  ]);

  const name = product.name_fr || product.name_he;
  const media = [...(product.media ?? [])].sort((a, b) => a.display_order - b.display_order);
  const defaultVariant = product.variants?.find((v) => v.is_default) ?? product.variants?.[0];
  const priceAgorot = defaultVariant?.regular_price_agorot ?? product.base_price_agorot ?? null;
  const categoryLabel = product.subcategory ? SUBCATEGORY_LABELS[product.subcategory] ?? product.subcategory : product.category?.name_fr;

  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://terminal3.co.il"}/spiritueux/${product.slug}`;

  const similarSpirits = allSpirits
    .filter((s) => s.id !== product.id)
    .sort((a, b) => {
      const score = (s: typeof a) =>
        (s.subcategory === product.subcategory ? 2 : 0) +
        (s.brand === product.brand ? 2 : 0) +
        (s.country === product.country ? 1 : 0);
      return score(b) - score(a);
    })
    .slice(0, 4);

  const specs = [
    { label: "Type", value: categoryLabel ?? "" },
    { label: "Marque", value: product.brand ?? "" },
    { label: "Pays", value: product.country ?? "" },
    { label: "Région", value: product.region ?? "" },
    { label: "Âge", value: product.age_years ? `${product.age_years} ans` : "" },
    { label: "Contenance", value: defaultVariant?.volume_ml ? `${defaultVariant.volume_ml / 10} cl` : "" },
    { label: "Degré d'alcool", value: defaultVariant?.abv ? `${defaultVariant.abv}% vol.` : "" },
    { label: "Cacherout", value: product.kosher_status ?? "" },
    { label: "Méthode de fabrication", value: product.production_method ?? "" },
    { label: "Type de fût", value: product.cask_type ?? "" },
    { label: "Édition", value: product.edition ?? "" },
    { label: "Référence", value: defaultVariant?.sku ?? "" },
  ];

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
          <div className="flex items-start gap-3">
            <IdCard className="mt-0.5 h-4 w-4 shrink-0 text-bordeaux-principal" aria-hidden />
            <span>
              Vente réservée aux personnes de 18 ans et plus. Une pièce d&apos;identité valide sera
              contrôlée lors du retrait ou de la livraison.
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "cacherout",
      title: "Cacherout",
      content: product.kosher_status ? (
        <p className="text-sm leading-relaxed text-noir-profond/80">{product.kosher_status}</p>
      ) : null,
    },
    {
      id: "avis",
      title: `Avis (${reviews.length})`,
      content: (
        <WineReviews
          productId={product.id}
          pagePath={`/spiritueux/${product.slug}`}
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
      priceAgorot != null
        ? {
            "@type": "Offer",
            priceCurrency: "ILS",
            price: agorotToILS(priceAgorot).toFixed(2),
            availability:
              product.availability_status === "OUT_OF_STOCK"
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
            url: pageUrl,
          }
        : undefined,
  };

  return (
    <div className="min-h-screen bg-fond-papier">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <WineBreadcrumb basePath="/spiritueux" catalogLabel="Spiritueux" domaine={product.brand} name={name} />

      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left: gallery, beige background */}
          <div className="rounded-sm bg-beige-fonce/60 p-4 sm:p-8">
            <WineGallery images={media} name={name} />
          </div>

          {/* Right: info, cream/paper background */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-bordeaux-principal">
                {categoryLabel}
                {product.country ? ` · ${product.country}` : ""}
              </p>
              <h1 className="mt-2 font-serif text-4xl leading-tight text-noir-profond sm:text-5xl">
                {name}
              </h1>
              <p className="mt-2 text-base text-gris-chaud">
                {[product.brand, defaultVariant?.volume_ml ? `${defaultVariant.volume_ml} ml` : null]
                  .filter(Boolean)
                  .join(" · ")}
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
            </div>

            <WinePurchasePanel
              basePath="/spiritueux"
              productId={product.id}
              productSlug={product.slug}
              productName={name}
              domaine={product.brand}
              extraDetail={product.age_years ? `${product.age_years} ans` : null}
              imageUrl={media[0]?.url ?? null}
              variantId={defaultVariant?.id ?? null}
              variantLabel={defaultVariant?.label ?? null}
              priceAgorot={priceAgorot}
              compareAgorot={product.compare_at_price_agorot}
              availability={product.availability_status}
              whatsapp={settings.STORE_WHATSAPP}
              pageUrl={pageUrl}
              initialFavorited={favoriteIds.has(product.id)}
            />

            {(product.nose_notes || product.palate_notes || product.finish_notes) && (
              <div>
                <h2 className="mb-3 font-serif text-lg text-noir-profond">Profil de dégustation</h2>
                <TastingProfile nose={product.nose_notes} palate={product.palate_notes} finish={product.finish_notes} />
              </div>
            )}

            {product.how_to_serve && (
              <div>
                <h2 className="mb-3 font-serif text-lg text-noir-profond">Conseils de dégustation</h2>
                <p className="text-sm leading-relaxed text-noir-profond/80">{product.how_to_serve}</p>
                {product.serving_temperature && (
                  <p className="mt-2 text-xs text-gris-chaud">
                    Température idéale : {product.serving_temperature}
                  </p>
                )}
              </div>
            )}

            <ShareButtons title={name} url={pageUrl} />
          </div>
        </div>

        {/* Accordion */}
        <div className="mt-14">
          <WineInfoAccordion sections={accordionSections} />
        </div>

        {/* Complementary products */}
        <div className="mt-14">
          <ComplementaryProducts />
        </div>

        {/* Similar spirits */}
        <div className="mt-14">
          <SimilarWines
            wines={similarSpirits}
            favoriteIds={favoriteIds}
            surtitle="La sélection continue"
            title="Vous aimerez aussi"
            CardComponent={SpiritCard}
          />
        </div>
      </div>
    </div>
  );
}
