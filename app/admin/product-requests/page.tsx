import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { requireAdminPermission } from "@/lib/admin/auth";
import { listProductRequests } from "@/lib/data/product-requests";
import { ProductRequestRow } from "@/components/admin/product-request-row";
import type {
  ProductRequestKind,
  ProductRequestStatus,
} from "@/types/database";

export const metadata: Metadata = {
  title: "Demandes de produits | Terminal 3 Admin",
};

const STATUS_FILTERS: (ProductRequestStatus | "all")[] = [
  "all",
  "new",
  "reviewing",
  "quoted",
  "accepted",
  "declined",
  "fulfilled",
];

const KIND_FILTERS: (ProductRequestKind | "all")[] = [
  "all",
  "in_catalog",
  "out_of_catalog",
];

const STATUS_LABEL: Record<ProductRequestStatus, string> = {
  new: "Nouvelles",
  reviewing: "En étude",
  quoted: "Devis proposés",
  accepted: "Acceptées",
  declined: "Refusées",
  fulfilled: "Traitées",
  cancelled: "Annulées",
};

const KIND_LABEL: Record<ProductRequestKind, string> = {
  in_catalog: "Catalogue",
  out_of_catalog: "Hors catalogue",
};

export default async function AdminProductRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; kind?: string; q?: string }>;
}) {
  await requireAdminPermission("customers.view");

  const params = await searchParams;
  const status = (STATUS_FILTERS as string[]).includes(params.status ?? "")
    ? (params.status as ProductRequestStatus | "all")
    : "all";
  const kind = (KIND_FILTERS as string[]).includes(params.kind ?? "")
    ? (params.kind as ProductRequestKind | "all")
    : "all";
  const search = params.q?.trim() ?? "";

  const requests = await listProductRequests({ status, kind, search });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#71695F]">
            <MessageSquare className="h-3.5 w-3.5" /> Demandes
          </div>
          <h2 className="mt-1 font-serif text-2xl text-[#151411]">
            Demandes de produits
          </h2>
          <p className="mt-1 text-sm text-[#71695F]">
            Toutes les demandes : produits du catalogue et hors catalogue,
            envoyées par les particuliers et les bars.
          </p>
        </div>
      </div>

      <form className="mt-6 flex flex-wrap items-center gap-3">
        <input
          name="q"
          defaultValue={search}
          placeholder="Recherche par nom, marque, référence..."
          className="min-w-[240px] flex-1 rounded-sm border border-[#E7DECE] bg-white px-4 py-2.5 text-sm text-[#151411] outline-none focus:border-[#C6A15B]"
        />
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((s) => {
            const active = s === status;
            const label = s === "all" ? "Tous" : STATUS_LABEL[s as ProductRequestStatus];
            const href = new URLSearchParams();
            if (s !== "all") href.set("status", s);
            if (kind !== "all") href.set("kind", kind);
            if (search) href.set("q", search);
            const query = href.toString();
            return (
              <Link
                key={s}
                href={query ? `/admin/product-requests?${query}` : "/admin/product-requests"}
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
        <div className="flex gap-1.5">
          {KIND_FILTERS.map((k) => {
            const active = k === kind;
            const label = k === "all" ? "Tous types" : KIND_LABEL[k as ProductRequestKind];
            const href = new URLSearchParams();
            if (status !== "all") href.set("status", status);
            if (k !== "all") href.set("kind", k);
            if (search) href.set("q", search);
            const query = href.toString();
            return (
              <Link
                key={k}
                href={query ? `/admin/product-requests?${query}` : "/admin/product-requests"}
                className={`rounded-sm px-3 py-1.5 text-xs font-medium uppercase tracking-widest transition-colors ${
                  active
                    ? "bg-[#684734] text-[#F7F0E4]"
                    : "border border-[#E7DECE] text-[#151411] hover:border-[#C6A15B]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </form>

      {requests.length === 0 ? (
        <div className="mt-8 rounded-sm border border-[#E7DECE] bg-white p-10 text-center text-sm text-[#71695F]">
          Aucune demande ne correspond aux filtres.
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {requests.map((r) => (
            <ProductRequestRow key={r.id} request={r} />
          ))}
        </ul>
      )}
    </div>
  );
}
