import { requireAdminPermission } from "@/lib/admin/auth";
import { isDemoMode } from "@/lib/demo-mode";
import { getAllDeliveriesForAdmin } from "@/lib/data/deliveries";
import { getActiveDeliveryDrivers } from "@/lib/data/delivery-drivers";
import { DeliveriesBoard } from "@/components/admin/deliveries-board";
import { Truck } from "lucide-react";

export default async function LivraisonsPage() {
  await requireAdminPermission("sales.orders");

  const demoMode = isDemoMode();
  const [deliveries, drivers] = demoMode
    ? [[], []]
    : await Promise.all([getAllDeliveriesForAdmin(), getActiveDeliveryDrivers()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-[#151411]">Livraisons</h1>
        <p className="mt-1 text-sm text-[#71695F]">
          Assignez un livreur, suivez le statut et confirmez l&apos;encaissement à la livraison.
        </p>
      </div>

      {demoMode && (
        <div className="rounded-sm border border-[#B97832]/30 bg-[#B97832]/10 px-4 py-3 text-sm text-[#B97832]">
          Mode démo actif : aucune base Supabase connectée.
        </div>
      )}

      {deliveries.length === 0 && !demoMode ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-sm border border-[#E7DECE] bg-white py-20 text-center shadow-sm">
          <Truck className="h-10 w-10 text-[#71695F]/40" />
          <p className="font-serif text-xl text-[#151411]">Aucune livraison à afficher.</p>
          <p className="max-w-md text-sm text-[#71695F]">
            Les livraisons apparaissent ici dès qu&apos;une commande est marquée pour livraison.
          </p>
        </div>
      ) : (
        <DeliveriesBoard initialDeliveries={deliveries} drivers={drivers} />
      )}
    </div>
  );
}
