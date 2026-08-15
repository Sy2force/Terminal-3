import { requireAdminPermission } from "@/lib/admin/auth";
import { Star } from "lucide-react";

export default async function BrandsPage() {
  await requireAdminPermission("catalog.products");
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-[#151411]">Marques</h1>
      <div className="rounded-sm border border-[#E7DECE] bg-white p-6 shadow-sm">
        <Star className="h-8 w-8 text-[#71695F]/40" />
        <p className="mt-4 text-sm text-[#71695F]">Gestion des marques et logos.</p>
      </div>
    </div>
  );
}
