import { requireAdminPermission } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo-mode";
import { Store, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/admin/button";

export default async function WoltPage() {
  await requireAdminPermission("sales.orders");

  const supabase = isDemoMode() ? null : await createClient();
  const connection = supabase
    ? await supabase.from("wolt_connections").select("*").order("created_at", { ascending: false }).limit(1).then(({ data }) => data?.[0] ?? null)
    : null;

  const statusLabel: Record<string, string> = {
    not_configured: "Non configuré",
    configured: "Configuré",
    syncing: "Synchronisation en cours",
    error: "Erreur",
    disconnected: "Déconnecté",
  };

  const currentStatus = statusLabel[connection?.status ?? "not_configured"] ?? "Non configuré";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-[#151411]">Wolt Business</h1>
        <p className="mt-1 text-sm text-[#71695F]">Connexion et synchronisation avec Wolt.</p>
      </div>

      <div className="rounded-sm border border-[#E7DECE] bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[#9B3444]/10 text-[#9B3444]">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl text-[#151411]">Configuration Wolt requise</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#71695F]">
              Aucune intégration officielle Wolt n&apos;est configurée. Terminal 3 ne simule pas de
              connexion fictive pour des raisons de sécurité et de conformité.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-sm border border-[#E7DECE] bg-[#FBF8F1] p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#71695F]">
            Informations nécessaires pour activer la connexion
          </h3>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-[#151411]">
            <li>Merchant ID Wolt</li>
            <li>Venue ID Wolt</li>
            <li>Client ID / Client Secret officiels de l&apos;API Wolt</li>
            <li>Scope autorisé par Wolt (read menu, read orders, update orders)</li>
          </ul>
        </div>

        <div className="mt-6 flex items-center gap-3 text-sm text-[#71695F]">
          <Store className="h-4 w-4" />
          État actuel : <strong className="text-[#9B3444]">{currentStatus}</strong>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button disabled icon={CheckCircle}>
            Connecter Wolt Business
          </Button>
          <Button disabled variant="outline" icon={RefreshCw}>
            Relancer la synchronisation
          </Button>
        </div>

        <p className="mt-3 text-xs text-[#71695F]">
          Les boutons sont désactivés tant qu&apos;aucune vraie intégration n&apos;est fournie. Une fois
          configurée, cette page permettra d&apos;importer les commandes, mapper les produits et
          synchroniser la disponibilité.
        </p>
      </div>
    </div>
  );
}
