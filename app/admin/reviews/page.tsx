import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { ReviewsTable } from "@/components/admin/reviews-table";
import type { ProductReviewRow } from "@/types/database";

interface ReviewWithProduct extends ProductReviewRow {
  products: { name_fr: string | null }[] | null;
}

export const metadata = {
  title: "Avis produits | Terminal 3 Admin",
};

export default async function ReviewsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data } = await supabase
    .from("product_reviews")
    .select("id, product_id, author_name, rating, comment, is_published, created_at, products(name_fr)")
    .order("created_at", { ascending: false });

  const reviews = (data as ReviewWithProduct[] | null) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-[#151411]">Avis produits</h1>
        <p className="mt-1 text-sm text-[#71695F]">Modération et publication des avis clients.</p>
      </div>
      <ReviewsTable reviews={reviews} />
    </div>
  );
}
