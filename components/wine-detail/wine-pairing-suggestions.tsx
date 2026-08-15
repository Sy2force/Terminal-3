import { getPublishedProducts, type ProductWithMedia } from "@/lib/data/catalog";
import { WineCard } from "@/components/catalog/wine-card";
import type { WineType } from "@/types/database";

const PAIRING_TYPES: WineType[] = ["ROUGE", "ROSE", "BLANC", "EFFERVESCENT"];

/**
 * "Le vin qui l'accompagne" — up to three real, published wines (one per
 * style when available), fetched through the normal catalog data layer.
 * Never fabricates wines just to fill the section; renders nothing if
 * the wine catalog is empty.
 */
export async function WinePairingSuggestions({ favoriteIds }: { favoriteIds: Set<string> }) {
  const wines = await getPublishedProducts({ categorySlug: "vin" });
  if (wines.length === 0) return null;

  function bestOfType(type: WineType): ProductWithMedia | null {
    const candidates = wines.filter((w) => w.wine_type === type);
    if (candidates.length === 0) return null;
    return [...candidates].sort(
      (a, b) => (b.is_best_seller ? 1 : 0) - (a.is_best_seller ? 1 : 0) || (b.rating ?? 0) - (a.rating ?? 0),
    )[0];
  }

  const picks: ProductWithMedia[] = [];
  for (const type of PAIRING_TYPES) {
    const pick = bestOfType(type);
    if (pick) picks.push(pick);
    if (picks.length === 3) break;
  }

  if (picks.length === 0) return null;

  return (
    <section className="border-t border-brun-cave/15 pt-10">
      <p className="text-xs uppercase tracking-[0.3em] text-bordeaux-principal">Accord suggéré</p>
      <h2 className="mt-2 font-serif text-2xl text-noir-profond sm:text-3xl">Le vin qui l&apos;accompagne</h2>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {picks.map((wine) => (
          <WineCard key={wine.id} product={wine} initialFavorited={favoriteIds.has(wine.id)} />
        ))}
      </div>
    </section>
  );
}
