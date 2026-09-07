import Link from "next/link";
import { requireAdminPermission } from "@/lib/admin/auth";
import { getAllPromotions } from "@/lib/data/promotions-admin";
import { formatAgorot } from "@/lib/money";
import { PromotionRowActions } from "@/components/admin/promotion-row-actions";

export default async function AdminPromotionsPage() {
  await requireAdminPermission("marketing.promotions");
  const promotions = await getAllPromotions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-noir-profond">Promotions</h1>
        <Link
          href="/admin/promotions/new"
          className="rounded-full bg-or-principal px-5 py-2 text-sm font-semibold text-noir-profond transition-colors hover:bg-or-clair"
        >
          Nouvelle promotion
        </Link>
      </div>

      <div className="overflow-hidden rounded-sm border border-beige-fonce">
        <table className="w-full text-left text-sm">
          <thead className="bg-white text-noir-profond/70">
            <tr>
              <th className="px-4 py-3 font-normal">Titre</th>
              <th className="px-4 py-3 font-normal">Prix promo</th>
              <th className="px-4 py-3 font-normal">Début</th>
              <th className="px-4 py-3 font-normal">Fin</th>
              <th className="px-4 py-3 font-normal">Statut</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-beige-fonce">
            {promotions.map((promotion) => (
              <tr key={promotion.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium text-noir-profond">
                  {promotion.title}
                  {promotion.featured && (
                    <span className="ml-2 rounded-full border border-champagne/30 px-2 py-0.5 text-[10px] uppercase tracking-widest text-or-principal">
                      Mise en avant
                    </span>
                  )}
                  {promotion.members_only && (
                    <span className="ml-2 rounded-full border border-ivory/20 px-2 py-0.5 text-[10px] uppercase tracking-widest text-noir-profond/70">
                      Membres
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-noir-profond/80">
                  {formatAgorot(promotion.promo_price_agorot)}
                </td>
                <td className="px-4 py-3 text-gris-chaud">
                  {new Date(promotion.start_at).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3 text-gris-chaud">
                  {new Date(promotion.end_at).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={promotion.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <PromotionRowActions promotionId={promotion.id} />
                </td>
              </tr>
            ))}
            {promotions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gris-chaud">
                  Aucune promotion.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    draft: "Brouillon",
    scheduled: "Programmée",
    active: "Active",
    expired: "Expirée",
    paused: "Pause",
  };
  const styles: Record<string, string> = {
    draft: "text-gris-chaud",
    scheduled: "text-noir-profond",
    active: "text-or-principal",
    expired: "text-amber-700",
    paused: "text-amber-700",
  };
  return <span className={`text-xs ${styles[status] ?? "text-noir-profond"}`}>{labels[status] ?? status}</span>;
}
