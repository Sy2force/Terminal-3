import Link from "next/link";
import Image from "next/image";
import { getPublishedProducts } from "@/lib/data/catalog";
import { formatUnitPrice } from "@/lib/money";

/**
 * "Pour compléter votre dégustation" — real saumon fumé and apéritif
 * products, fetched through the normal catalog data layer (never a
 * hardcoded list), excluding the product currently being viewed.
 */
export async function ComplementarySuggestions({ excludeProductId }: { excludeProductId: string }) {
  const [salmon, spirits] = await Promise.all([
    getPublishedProducts({ categorySlug: "saumon-fume", limit: 2 }),
    getPublishedProducts({ categorySlug: "spiritueux", limit: 6 }),
  ]);

  const aperitifs = spirits.filter((s) => s.subcategory === "APERITIF").slice(0, 2);
  const items = [...salmon, ...aperitifs].filter((p) => p.id !== excludeProductId);
  if (items.length === 0) return null;

  return (
    <section className="border-t border-brun-cave/15 pt-10">
      <p className="text-xs uppercase tracking-[0.3em] text-bordeaux-principal">Idée d&apos;accord</p>
      <h2 className="mt-2 font-serif text-2xl text-noir-profond sm:text-3xl">
        Pour compléter votre dégustation
      </h2>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {items.map((product) => {
          const name = product.name_fr || product.name_he;
          const cover = product.media?.[0];
          const defaultVariant = product.variants?.find((v) => v.is_default) ?? product.variants?.[0];
          const price = defaultVariant?.regular_price_agorot ?? product.base_price_agorot;
          const basePath = product.category?.slug === "spiritueux" ? "/spiritueux" : "/products";
          return (
            <Link
              key={product.id}
              href={`${basePath}/${product.slug}`}
              className="group flex flex-col gap-2 rounded-sm border border-brun-cave/15 bg-white/40 p-3 transition-colors hover:border-bordeaux-principal/40"
            >
              <div className="relative aspect-square overflow-hidden rounded-sm bg-[#F1EADC]">
                {cover?.url ? (
                  <Image
                    src={cover.url}
                    alt={cover.alt ?? name}
                    fill
                    sizes="120px"
                    className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] uppercase text-gris-chaud">
                    Photo à venir
                  </div>
                )}
              </div>
              <p className="line-clamp-2 text-xs text-noir-profond">{name}</p>
              {price != null && (
                <p className="text-xs font-medium text-bordeaux-principal">
                  {formatUnitPrice(price, defaultVariant?.pricing_unit)}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
