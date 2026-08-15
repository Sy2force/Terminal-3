import { WineCard } from "@/components/catalog/wine-card";
import type { ProductWithMedia } from "@/lib/data/catalog";

interface SimilarWinesProps {
  wines: ProductWithMedia[];
  favoriteIds: Set<string>;
  surtitle?: string;
  title?: string;
  CardComponent?: (props: { product: ProductWithMedia; initialFavorited: boolean }) => React.ReactElement;
}

export function SimilarWines({
  wines,
  favoriteIds,
  surtitle = "La sélection continue",
  title = "Dans le même esprit",
  CardComponent = WineCard,
}: SimilarWinesProps) {
  if (wines.length === 0) return null;

  return (
    <section className="border-t border-brun-cave/15 pt-10">
      <p className="text-xs uppercase tracking-[0.3em] text-bordeaux-principal">{surtitle}</p>
      <h2 className="mt-2 font-serif text-2xl text-noir-profond sm:text-3xl">{title}</h2>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {wines.map((wine) => (
          <CardComponent key={wine.id} product={wine} initialFavorited={favoriteIds.has(wine.id)} />
        ))}
      </div>
    </section>
  );
}
