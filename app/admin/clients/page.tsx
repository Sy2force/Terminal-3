import { requireAdminPermission } from "@/lib/admin/auth";
import { Users } from "lucide-react";

export default async function ClientsPage() {
  await requireAdminPermission("customers.view");
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-[#151411]">Clients</h1>
      <div className="rounded-sm border border-[#E7DECE] bg-white p-6 shadow-sm">
        <Users className="h-8 w-8 text-[#71695F]/40" />
        <p className="mt-4 text-sm text-[#71695F]">Liste et historique des clients.</p>
      </div>
    </div>
  );
}
