import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFavoriteProducts } from "@/lib/data/favorites";
import { ProductCard } from "@/components/commerce/product-card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = {
  title: "Mes favoris | Terminal 3",
};

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account/favorites");

  const products = await getFavoriteProducts();

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <span className="text-xs uppercase tracking-[0.3em] text-champagne">
        Mon compte
      </span>
      <h1 className="mt-2 font-serif text-3xl text-ivory sm:text-4xl">
        Mes favoris
      </h1>

      {products.length === 0 ? (
        <EmptyState
          className="mt-10"
          message="Vous n'avez pas encore de favoris — touchez le cœur sur une fiche produit pour l'ajouter ici."
        />
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} isFavorited />
          ))}
        </div>
      )}
    </div>
  );
}
