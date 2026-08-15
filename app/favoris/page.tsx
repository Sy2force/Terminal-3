import type { Metadata } from "next";
import { getFavoriteProducts } from "@/lib/data/favorites";
import { FavoritesGrid } from "@/components/favorites/favorites-grid";

export const metadata: Metadata = {
  title: "Mes favoris | Terminal 3",
  description: "Retrouvez votre sélection personnelle de vins, spiritueux, charcuteries et poissons chez Terminal 3.",
};

export default async function FavoritesPage() {
  const favoriteProducts = await getFavoriteProducts();

  return (
    <div className="min-h-screen bg-fond-papier">
      <div className="border-b border-brun-cave/15 bg-noir-chaud py-14 sm:py-16">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-or-principal">Votre sélection</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-texte-clair sm:text-5xl">
            Mes favoris
          </h1>
          <p className="mt-2 max-w-lg text-sm text-texte-clair/70">
            Vos produits préférés, retrouvés en un instant.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
        <FavoritesGrid products={favoriteProducts} />
      </div>
    </div>
  );
}
