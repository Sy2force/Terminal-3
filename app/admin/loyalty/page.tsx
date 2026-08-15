import { requireAdminPermission } from "@/lib/admin/auth";
import { listLoyaltyTiers } from "@/lib/data/loyalty";
import { LoyaltyManager } from "@/components/admin/loyalty-manager";

export default async function AdminLoyaltyPage() {
  await requireAdminPermission("loyalty.manage");
  const tiers = await listLoyaltyTiers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-ivory">Fidélité</h1>
        <p className="mt-1 text-sm text-muted-grey">
          Configurez les niveaux, seuils et le multiplicateur de points. Les ajustements manuels
          exigent toujours un motif et sont journalisés.
        </p>
      </div>

      <LoyaltyManager
        initialTiers={tiers.map((t) => ({
          id: t.id,
          nameFr: t.nameFr,
          minSpendAgorot: t.minSpendAgorot,
          pointsMultiplier: t.pointsMultiplier,
          isActive: true,
        }))}
      />
    </div>
  );
}
