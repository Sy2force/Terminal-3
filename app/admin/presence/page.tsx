import { requireAdminPermission } from "@/lib/admin/auth";
import { getPresenceStats } from "@/lib/data/presence";
import { PresencePanel } from "@/components/admin/presence-panel";

export const metadata = {
  title: "Présence | Terminal 3 Admin",
};

export default async function AdminPresencePage() {
  await requireAdminPermission("store.settings");
  const initial = await getPresenceStats();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 font-serif text-2xl text-noir-profond">Présence en ligne</h1>
      <p className="mb-6 text-sm text-gris-chaud">
        Visiteurs actifs sur les 5 dernières minutes. Les sessions anonymes sont
        comptées par onglet ; les utilisateurs connectés sont dédupliqués.
      </p>
      <PresencePanel initial={initial} />
    </div>
  );
}
