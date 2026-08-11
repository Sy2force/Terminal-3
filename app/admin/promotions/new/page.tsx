import { requireAdminPermission } from "@/lib/admin/auth";
import { getAllProducts } from "@/lib/data/products";
import { PromotionForm } from "@/components/admin/promotion-form";

export default async function NewPromotionPage() {
  await requireAdminPermission("marketing.promotions");
  const products = await getAllProducts();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-ivory">Nouvelle promotion</h1>
      <PromotionForm products={products} />
    </div>
  );
}
