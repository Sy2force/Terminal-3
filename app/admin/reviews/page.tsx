import { requireAdminPermission } from "@/lib/admin/auth";
import { MessageSquare } from "lucide-react";

export default async function ReviewsPage() {
  await requireAdminPermission("customers.view");
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-[#151411]">Avis</h1>
      <div className="rounded-sm border border-[#E7DECE] bg-white p-6 shadow-sm">
        <MessageSquare className="h-8 w-8 text-[#71695F]/40" />
        <p className="mt-4 text-sm text-[#71695F]">Modération et publication des avis produits.</p>
      </div>
    </div>
  );
}
