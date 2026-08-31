import type { Metadata } from "next";
import Link from "next/link";
import { Store } from "lucide-react";
import { requireAdminPermission } from "@/lib/admin/auth";
import { listBarProfiles } from "@/lib/data/bar-profiles";
import type { BarStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Bars & professionnels | Terminal 3 Admin",
};

const STATUS_LABEL: Record<BarStatus, string> = {
  new: "Nouveau",
  contacted: "Contacté",
  qualified: "Qualifié",
  approved: "Approuvé",
  inactive: "Inactif",
};

const STATUS_STYLES: Record<BarStatus, string> = {
  new: "bg-[#C6A15B]/10 text-[#7C5129]",
  contacted: "bg-[#C6A15B]/15 text-[#7C5129]",
  qualified: "bg-[#986236]/10 text-[#7C5129]",
  approved: "bg-emerald-100 text-emerald-800",
  inactive: "bg-[#E7DECE] text-[#71695F]",
};

const STATUSES: (BarStatus | "all")[] = [
  "all",
  "new",
  "contacted",
  "qualified",
  "approved",
  "inactive",
];

export default async function AdminBarsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireAdminPermission("customers.view");

  const params = await searchParams;
  const status = (STATUSES as string[]).includes(params.status ?? "")
    ? (params.status as BarStatus | "all")
    : "all";
  const search = params.q?.trim() ?? "";

  const bars = await listBarProfiles({ status, search });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#71695F]">
            <Store className="h-3.5 w-3.5" /> B2B
          </div>
          <h2 className="mt-1 font-serif text-2xl text-[#151411]">
            Bars et professionnels
          </h2>
          <p className="mt-1 text-sm text-[#71695F]">
            Fiches créées par les gérants d&rsquo;établissements via le site. Vous
            pouvez qualifier chaque lead et suivre les demandes associées.
          </p>
        </div>
      </div>

      <form className="mt-6 flex flex-wrap items-center gap-3">
        <input
          name="q"
          defaultValue={search}
          placeholder="Recherche par nom, contact, téléphone, ville..."
          className="min-w-[280px] flex-1 rounded-sm border border-[#E7DECE] bg-white px-4 py-2.5 text-sm text-[#151411] outline-none focus:border-[#C6A15B]"
        />
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => {
            const active = s === status;
            const label = s === "all" ? "Tous" : STATUS_LABEL[s as BarStatus];
            return (
              <Link
                key={s}
                href={s === "all" ? "/admin/bars" : `/admin/bars?status=${s}`}
                className={`rounded-sm px-3 py-1.5 text-xs font-medium uppercase tracking-widest transition-colors ${
                  active
                    ? "bg-[#692031] text-[#F7F0E4]"
                    : "border border-[#E7DECE] text-[#151411] hover:border-[#C6A15B]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
        <button
          type="submit"
          className="rounded-sm bg-[#692031] px-4 py-2 text-xs font-medium uppercase tracking-widest text-[#F7F0E4] hover:bg-[#551525]"
        >
          Filtrer
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-sm border border-[#E7DECE] bg-white">
        <table className="w-full">
          <thead className="border-b border-[#E7DECE] bg-[#F4EFE5] text-left text-xs uppercase tracking-widest text-[#71695F]">
            <tr>
              <th className="px-4 py-3">Bar</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Ville</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Ajouté le</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {bars.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#71695F]">
                  Aucun bar ne correspond à ce filtre.
                </td>
              </tr>
            ) : (
              bars.map((bar) => (
                <tr key={bar.id} className="border-t border-[#E7DECE]/60 hover:bg-[#F4EFE5]/40">
                  <td className="px-4 py-3">
                    <p className="font-serif text-base text-[#151411]">
                      {bar.business_name}
                    </p>
                    {bar.legal_name && (
                      <p className="text-xs text-[#71695F]">{bar.legal_name}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#151411]">
                    {bar.contact_first_name} {bar.contact_last_name}
                    {bar.contact_email && (
                      <p className="text-xs text-[#71695F]">{bar.contact_email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#151411]">{bar.contact_phone}</td>
                  <td className="px-4 py-3 text-sm text-[#151411]">{bar.city ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-sm px-2 py-1 text-[10px] font-semibold uppercase tracking-widest ${STATUS_STYLES[bar.status]}`}
                    >
                      {STATUS_LABEL[bar.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#71695F]">
                    {new Date(bar.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/bars/${bar.id}`}
                      className="text-xs font-medium uppercase tracking-widest text-[#692031] hover:underline"
                    >
                      Ouvrir
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
