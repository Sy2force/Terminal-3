import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { getProductBySlug, getPublishedProducts } from "@/lib/data/catalog";
import { getFavoriteProductIds } from "@/lib/data/favorites";
import { getSiteSettings, isStoreOnline } from "@/lib/settings";
import { getMediaFit, isSalmonCategory } from "@/lib/catalog-visual-config";
import {
  WhatsAppButton,
  CallButton,
} from "@/components/commerce/contact-actions";
import { ProductPurchasePanel } from "@/components/commerce/product-purchase-panel";
import { FavoriteButton } from "@/components/commerce/favorite-button";
import { ProductCard } from "@/components/commerce/product-card";
import { SalmonProductCard } from "@/components/commerce/salmon-product-card";
import { ProductSpecs } from "@/components/commerce/product-specs";
import { formatAgorot } from "@/lib/money";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const name = product.name_fr || product.name_he;
  const cover = product.media?.find((m) => m.kind === "COVER") ?? product.media?.[0];
  return {
    title: `${name} | Terminal 3`,
    description: product.description_fr ?? product.description_he ?? undefined,
    openGraph: {
      type: "website",
      title: name,
      description: product.description_fr ?? product.description_he ?? undefined,
      images: cover ? [{ url: cover.url, alt: cover.alt ?? name }] : undefined,
    },
  };
}

const INFO_SECTIONS: {
  key: keyof NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;
  label: string;
}[] = [
  { key: "description_fr", label: "Description" },
  { key: "origin", label: "Origine" },
  { key: "tasting_notes", label: "Notes de dégustation" },
  { key: "pairing_notes", label: "Accords" },
  { key: "how_to_serve", label: "Comment servir" },
  { key: "storage_info", label: "Conservation" },
  { key: "kosher_status", label: "Cacherout" },
  { key: "allergen_info", label: "Allergènes" },
];

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [settings, storeOnline, favoriteIds, relatedProducts] = await Promise.all([
    getSiteSettings(),
    isStoreOnline(),
    getFavoriteProductIds(),
    product.category?.slug
      ? getPublishedProducts({ categorySlug: product.category.slug, limit: 4 })
      : Promise.resolve([]),
  ]);

  const name = product.name_fr || product.name_he;
  const media = product.media?.sort((a, b) => a.display_order - b.display_order) ?? [];
  const cover = media.find((m) => m.kind === "COVER") ?? media[0];
  const gallery = media.filter((m) => m.id !== cover?.id);
  const defaultVariant =
    product.variants?.find((v) => v.is_default) ?? product.variants?.[0];
  const isPlatter = product.product_type === "PLATTER";
  const isNew = product.new_until && new Date(product.new_until) > new Date();
  const salmon = isSalmonCategory(product.category?.slug ?? "");
  const related = relatedProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);
  const imageFit = getMediaFit(cover?.kind, product.category?.slug ?? null);
  const hasCover = Boolean(cover?.url);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const productUrl = siteUrl ? `${siteUrl}/products/${slug}` : `/products/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    image: cover?.url ? (siteUrl ? `${siteUrl}${cover.url}` : cover.url) : undefined,
    description: product.description_fr ?? product.description_he ?? undefined,
    brand: {
      "@type": "Brand",
      name: product.brand ?? "Terminal 3",
    },
    category: product.category?.name_fr ?? product.category?.name_he ?? undefined,
    offers: defaultVariant
      ? {
          "@type": "Offer",
          url: productUrl,
          priceCurrency: "ILS",
          price: ((defaultVariant.regular_price_agorot ?? product.base_price_agorot ?? 0) / 100).toFixed(2),
          availability:
            defaultVariant.availability_status === "IN_STOCK" ||
            defaultVariant.availability_status === "LOW_STOCK" ||
            defaultVariant.availability_status === "PREORDER"
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
        }
      : undefined,
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid gap-12 lg:grid-cols-[58fr_42fr]">
        {/* LEFT: Image gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-warm-black">
            {hasCover && cover ? (
              <Image
                src={cover.url}
                alt={cover.alt ?? name}
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className={`${imageFit === "contain" ? "object-contain p-8" : "object-cover"}`}
                priority
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-sm text-muted-grey">
                <span className="text-[10px] uppercase tracking-widest">Photo manquante</span>
              </div>
            )}
          </div>
          {gallery.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {gallery.slice(0, 4).map((m) => (
                <div key={m.id} className="relative aspect-square overflow-hidden rounded-sm bg-warm-black">
                  <Image
                    src={m.url}
                    alt={m.alt ?? name}
                    fill
                    sizes="15vw"
                    className={imageFit === "contain" ? "object-contain p-2" : "object-cover"}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Product info */}
        <div className="flex flex-col gap-6">
          <div>
            {product.category && (
              <span className="text-xs uppercase tracking-widest text-champagne">
                {product.category.name_fr || product.category.name_he}
              </span>
            )}
            <div className="mt-2 flex items-start justify-between gap-4">
              <h1 className="font-serif text-3xl leading-tight text-ivory sm:text-4xl">
                {name}
              </h1>
              <FavoriteButton
                productId={product.id}
                initialFavorited={favoriteIds.has(product.id)}
                className="mt-1 shrink-0 bg-transparent p-1"
              />
            </div>
            {product.brand && (
              <p className="mt-2 text-sm text-muted-grey">
                {product.brand}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {isPlatter && (
                <span className="rounded-full border border-champagne/40 px-3 py-1 text-[10px] uppercase tracking-widest text-champagne">
                  Plateau
                </span>
              )}
              {isNew && (
                <span className="rounded-full border border-ivory/20 px-3 py-1 text-[10px] uppercase tracking-widest text-ivory">
                  Nouveauté
                </span>
              )}
              {product.age_restricted && (
                <span className="rounded-full border border-amber-400/40 px-3 py-1 text-[10px] uppercase tracking-widest text-amber-400">
                  18+
                </span>
              )}
            </div>
          </div>

          {(product.description_fr || product.description_he) && (
            <p className="text-sm leading-relaxed text-ivory/70">
              {product.description_fr || product.description_he}
            </p>
          )}

          {product.age_restricted && (
            <div className="flex items-center gap-2 rounded-sm border border-amber-400/40 bg-amber-400/5 px-4 py-3 text-sm text-amber-300">
              <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
              <span>18+ — pièce d&rsquo;identité requise au retrait</span>
            </div>
          )}

          {isPlatter && product.composition_text && (
            <div className="rounded-sm border border-white/5 bg-graphite/30 p-4">
              <h2 className="font-serif text-lg text-ivory">Composition</h2>
              <p className="mt-2 text-sm leading-relaxed text-ivory/70">
                {product.composition_text}
              </p>
              {(product.serves_min || product.serves_max) && (
                <p className="mt-3 text-xs text-muted-grey">
                  Convient pour {product.serves_min ?? "?"} à {product.serves_max ?? "?"} personnes
                </p>
              )}
            </div>
          )}

          <ProductPurchasePanel
            productId={product.id}
            productSlug={product.slug}
            productName={name}
            imageUrl={cover?.url ?? null}
            ageRestricted={product.age_restricted}
            variants={product.variants}
            basePriceAgorot={product.base_price_agorot ?? null}
            compareAtPriceAgorot={product.compare_at_price_agorot ?? null}
            storeOnline={storeOnline}
          />

          <ProductSpecs product={product} />

          <div className="flex gap-3 pt-2">
            <CallButton phone={settings.STORE_PHONE} className="flex-1" />
            <WhatsAppButton
              whatsapp={settings.STORE_WHATSAPP}
              productName={name}
              variantLabel={defaultVariant?.label}
              promoPriceLabel={
                defaultVariant?.regular_price_agorot != null
                  ? formatAgorot(defaultVariant.regular_price_agorot)
                  : undefined
              }
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Additional info sections */}
      <div className="mt-16 grid gap-10 border-t border-white/5 pt-10 sm:grid-cols-2">
        {INFO_SECTIONS.map(({ key, label }) => {
          const value = product[key];
          if (!value || typeof value !== "string") return null;
          return (
            <div key={key}>
              <h2 className="font-serif text-lg text-ivory">{label}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ivory/70">
                {value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-20 border-t border-white/5 pt-14">
          <span className="text-xs uppercase tracking-[0.3em] text-champagne">
            Vous pourriez aussi aimer
          </span>
          <h2 className="mt-2 font-serif text-2xl text-ivory sm:text-3xl">
            Dans la même sélection
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) =>
              salmon ? (
                <SalmonProductCard
                  key={p.id}
                  product={p}
                  isFavorited={favoriteIds.has(p.id)}
                />
              ) : (
                <ProductCard
                  key={p.id}
                  product={p}
                  isFavorited={favoriteIds.has(p.id)}
                />
              ),
            )}
          </div>
        </section>
      )}
    </div>
  );
}
