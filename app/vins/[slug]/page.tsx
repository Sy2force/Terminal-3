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
import { WineTastingNotes } from "@/components/wine-detail/wine-tasting-notes";
import { WinePairing } from "@/components/wine-detail/wine-pairing";
import { WineInfoAccordion, type AccordionSection } from "@/components/wine-detail/wine-info-accordion";
import { WineReviews } from "@/components/wine-detail/wine-reviews";
import { SimilarWines } from "@/components/wine-detail/similar-wines";
import { ComplementaryProducts } from "@/components/wine-detail/complementary-products";
import { ShareButtons } from "@/components/wine-detail/share-buttons";

export const revalidate = 60;

const WINE_TYPE_LABELS: Record<string, string> = {
  ROUGE: "Rouge",
  BLANC: "Blanc",
  ROSE: "Rosé",
  EFFERVESCENT: "Effervescent",
  DOUX: "Doux",
};

/**
 * A wine detail page only ever serves products that belong to the wine
 * category — a slug that resolves to a charcuterie or fish product (or to
 * nothing at all) renders the standard 404, never a technical error.
 */
async function getWine(slug: string) {
  const product = await getProductBySlug(slug);
  if (!product) return null;
  if (product.category?.slug !== "vin") return null;
  return product;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getWine(slug);
  if (!product) return {};

  const name = product.name_fr || product.name_he;
  const vintage = product.variants?.find((v) => v.is_default)?.vintage ?? product.variants?.[0]?.vintage;
  const title = `${name}${vintage ? ` ${vintage}` : ""}${product.brand ? ` – ${product.brand}` : ""} | Terminal 3`;
  const description =
    product.description_fr ??
    `${name} — ${product.wine_type ? WINE_TYPE_LABELS[product.wine_type] : "Vin"}${product.region ? ` de ${product.region}` : ""}, disponible chez Terminal 3, Jérusalem.`;
  const cover = product.media?.[0];

  return {
    title,
    description,
    alternates: { canonical: `/vins/${product.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      images: cover ? [{ url: cover.url, alt: cover.alt ?? name }] : undefined,
    },
  };
}

export default async function WineDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getWine(slug);
  if (!product) notFound();

  const [settings, favoriteIds, allWines, reviews, currentUser] = await Promise.all([
    getSiteSettings(),
    getFavoriteProductIds(),
    getPublishedProducts({ categorySlug: "vin" }),
    getProductReviews(product.id),
    isDemoMode()
      ? Promise.resolve(null)
      : createClient().then((supabase) => supabase.auth.getUser().then(({ data }) => data.user)),
  ]);

  const name = product.name_fr || product.name_he;
  const media = [...(product.media ?? [])].sort((a, b) => a.display_order - b.display_order);
  const defaultVariant = product.variants?.find((v) => v.is_default) ?? product.variants?.[0];
  const priceAgorot = defaultVariant?.regular_price_agorot ?? product.base_price_agorot ?? null;

  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://terminal3.co.il"}/vins/${product.slug}`;

  const similarWines = allWines
    .filter((w) => w.id !== product.id)
    .sort((a, b) => {
      const score = (w: typeof a) =>
        (w.wine_type === product.wine_type ? 2 : 0) + (w.region === product.region ? 1 : 0);
      return score(b) - score(a);
    })
    .slice(0, 4);

  const specs = [
    { label: "Type", value: product.wine_type ? WINE_TYPE_LABELS[product.wine_type] : "" },
    { label: "Domaine", value: product.brand ?? "" },
    { label: "Pays", value: product.country ?? "" },
    { label: "Région", value: product.region ?? "" },
    { label: "Millésime", value: defaultVariant?.vintage ? String(defaultVariant.vintage) : "" },
    { label: "Cépages", value: (product.grape_varieties ?? []).join(", ") },
    { label: "Contenance", value: defaultVariant?.volume_ml ? `${defaultVariant.volume_ml / 10} cl` : "" },
    { label: "Taux d'alcool", value: defaultVariant?.abv ? `${defaultVariant.abv}% vol.` : "" },
    { label: "Température de service", value: product.serving_temperature ?? "" },
    { label: "Cacherout", value: product.kosher_status ?? "" },
    { label: "Méthode de vinification", value: product.vinification_method ?? "" },
    { label: "Potentiel de garde", value: product.aging_potential ?? "" },
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
              Vente réservée aux personnes de 18 ans et plus — une pièce d&apos;identité sera demandée
              au retrait ou à la livraison.
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
          pagePath={`/vins/${product.slug}`}
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

      <WineBreadcrumb domaine={product.brand} name={name} />

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
                {product.wine_type ? WINE_TYPE_LABELS[product.wine_type] : product.category?.name_fr}
                {product.region ? ` · ${product.region}` : ""}
              </p>
              <h1 className="mt-2 font-serif text-4xl leading-tight text-noir-profond sm:text-5xl">
                {name}
              </h1>
              <p className="mt-2 text-base text-gris-chaud">
                {[product.brand, defaultVariant?.vintage ? `Millésime ${defaultVariant.vintage}` : null]
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
              productId={product.id}
              productSlug={product.slug}
              productName={name}
              domaine={product.brand}
              extraDetail={defaultVariant?.vintage ? `Millésime ${defaultVariant.vintage}` : null}
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

            {product.tasting_notes && (
              <div>
                <h2 className="mb-3 font-serif text-lg text-noir-profond">Notes de dégustation</h2>
                <WineTastingNotes notes={product.tasting_notes} />
              </div>
            )}

            {product.pairing_notes && (
              <div>
                <h2 className="mb-3 font-serif text-lg text-noir-profond">À servir avec</h2>
                <WinePairing pairingNotes={product.pairing_notes} />
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

        {/* Similar wines */}
        <div className="mt-14">
          <SimilarWines wines={similarWines} favoriteIds={favoriteIds} />
        </div>
      </div>
    </div>
  );
}
