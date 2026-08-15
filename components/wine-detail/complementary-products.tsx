import Link from "next/link";
import Image from "next/image";
import { getPublishedProducts } from "@/lib/data/catalog";
import { formatAgorot } from "@/lib/money";

/**
 * "Pour accompagner cette bouteille" — real charcuterie/smoked-fish
 * products, fetched through the normal catalog data layer (never a
 * hardcoded list), so it always reflects what's actually published.
 */
export async function ComplementaryProducts() {
  const [charcuterie, salmon] = await Promise.all([
    getPublishedProducts({ categorySlug: "charcuterie", limit: 2 }),
    getPublishedProducts({ categorySlug: "saumon-fume", limit: 2 }),
  ]);

  const items = [...charcuterie, ...salmon];
  if (items.length === 0) return null;

  return (
    <section className="border-t border-brun-cave/15 pt-10">
      <p className="text-xs uppercase tracking-[0.3em] text-bordeaux-principal">Idée d&apos;accord</p>
      <h2 className="mt-2 font-serif text-2xl text-noir-profond sm:text-3xl">
        Pour accompagner cette bouteille
      </h2>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {items.map((product) => {
          const name = product.name_fr || product.name_he;
          const cover = product.media?.[0];
          const price = product.variants?.[0]?.regular_price_agorot ?? product.base_price_agorot;
          return (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
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
                <p className="text-xs font-medium text-bordeaux-principal">{formatAgorot(price)}</p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
