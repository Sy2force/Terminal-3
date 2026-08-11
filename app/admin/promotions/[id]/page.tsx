import { notFound } from "next/navigation";
import { requireAdminPermission } from "@/lib/admin/auth";
import { getPromotionById } from "@/lib/data/promotions-admin";
import { getAllProducts } from "@/lib/data/products";
import { PromotionForm } from "@/components/admin/promotion-form";

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPermission("marketing.promotions");
  const { id } = await params;

  const [promotion, products] = await Promise.all([
    getPromotionById(id),
    getAllProducts(),
  ]);
  if (!promotion) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-ivory">Modifier la promotion</h1>
      <PromotionForm initial={promotion} products={products} />
    </div>
  );
}
