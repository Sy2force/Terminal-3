import { requireAdminPermission } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo-mode";
import { History } from "lucide-react";
import type { AuditLogRow } from "@/types/database";

type AuditLogWithActor = AuditLogRow & {
  actor: { first_name: string | null; last_name: string | null; email: string | null } | null;
};

const ACTION_LABELS: Record<string, string> = {
  created: "Créé",
  updated: "Modifié",
  deleted: "Supprimé",
  published: "Publié",
  archived: "Archivé",
  price_changed: "Prix modifié",
  stock_changed: "Stock modifié",
  status_changed: "Statut modifié",
  promotion_created: "Promotion créée",
  promotion_edited: "Promotion modifiée",
  settings_changed: "Paramètres modifiés",
  staff_role_changed: "Rôle modifié",
  age_verified: "Âge vérifié",
  age_verification_failed: "Vérification d'âge échouée",
  homepage_section_created: "Section accueil créée",
  homepage_section_edited: "Section accueil modifiée",
  homepage_section_deleted: "Section accueil supprimée",
  homepage_section_toggled: "Section accueil activée/désactivée",
  delivery_assigned: "Livraison assignée",
  identity_verified: "Identité validée",
  identity_rejected: "Identité refusée",
  identity_resubmission_requested: "Nouveau document demandé",
  scheduled: "Planifié",
  restored: "Restauré",
};

export default async function HistoriquePage() {
  await requireAdminPermission("audit.view");

  const demoMode = isDemoMode();
  const logs: AuditLogWithActor[] = demoMode
    ? []
    : await createClient().then((supabase) =>
        supabase
          .from("audit_logs")
          .select("*, actor:profiles(first_name, last_name, email)")
          .order("created_at", { ascending: false })
          .limit(100)
          .then(({ data }) => (data ?? []) as unknown as AuditLogWithActor[]),
      );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-[#151411]">Historique</h1>
        <p className="mt-1 text-sm text-[#71695F]">
          Journal des 100 dernières actions administratives.
        </p>
      </div>

      {demoMode && (
        <div className="rounded-sm border border-[#B97832]/30 bg-[#B97832]/10 px-4 py-3 text-sm text-[#B97832]">
          Mode démo actif : aucune base Supabase connectée.
        </div>
      )}

      {logs.length === 0 && !demoMode ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-sm border border-[#E7DECE] bg-white py-20 text-center shadow-sm">
          <History className="h-10 w-10 text-[#71695F]/40" />
          <p className="text-sm text-[#71695F]">Aucune action enregistrée pour le moment.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-sm border border-[#E7DECE] bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FBF8F1] text-[#71695F]">
              <tr>
                <th className="px-4 py-3 font-normal">Date</th>
                <th className="px-4 py-3 font-normal">Administrateur</th>
                <th className="px-4 py-3 font-normal">Action</th>
                <th className="px-4 py-3 font-normal">Type</th>
                <th className="px-4 py-3 font-normal">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7DECE]">
              {logs.map((log) => {
                const actor = log.actor;
                return (
                  <tr key={log.id}>
                    <td className="px-4 py-3 text-xs text-[#71695F]">
                      {new Date(log.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-4 py-3 text-[#151411]">
                      {actor?.first_name || actor?.last_name
                        ? `${actor.first_name ?? ""} ${actor.last_name ?? ""}`.trim()
                        : actor?.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[#151411]">{ACTION_LABELS[log.action] ?? log.action}</td>
                    <td className="px-4 py-3 text-xs text-[#71695F]">{log.entity_type}</td>
                    <td className="px-4 py-3 text-xs text-[#71695F]">
                      {log.metadata && Object.keys(log.metadata).length > 0
                        ? JSON.stringify(log.metadata)
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
