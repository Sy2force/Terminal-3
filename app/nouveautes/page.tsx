import { getNewArrivals } from "@/lib/data/catalog";
import { getCategories } from "@/lib/data/catalog";
import { getFavoriteProductIds } from "@/lib/data/favorites";
import { WineCatalogClient } from "@/components/catalog/wine-catalog-client";

export const revalidate = 60;

export default async function NewPage() {
  const [products, categories, favoriteIds] = await Promise.all([
    getNewArrivals(50),
    getCategories(),
    getFavoriteProductIds(),
  ]);

  return (
    <WineCatalogClient 
      products={products}
      categories={categories}
      favoriteIds={favoriteIds}
      title="Nouveautés"
      description="Découvrez nos dernières arrivages et nouvelles sélections."
    />
  );
}