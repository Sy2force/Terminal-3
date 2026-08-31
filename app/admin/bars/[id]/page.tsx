import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, MessageCircle, Phone, Store } from "lucide-react";
import { requireAdminPermission } from "@/lib/admin/auth";
import { getBarProfileById } from "@/lib/data/bar-profiles";
import { listProductRequests } from "@/lib/data/product-requests";
import { createClient } from "@/lib/supabase/server";
import { formatAgorot } from "@/lib/money";
import { BarStatusControls } from "@/components/admin/bar-status-controls";

export const metadata: Metadata = {
  title: "Fiche bar | Terminal 3 Admin",
};

const PICKUP_LABEL: Record<string, string> = {
  self: "Vient lui-même",
  delegate: "Envoie un employé",
  delivery_when_available: "Livraison si disponible",
};

export default async function AdminBarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPermission("customers.view");

  const { id } = await params;
  const bar = await getBarProfileById(id);
  if (!bar) notFound();

  const supabase = await createClient();
  const [{ data: profile }, requests, { data: orders }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, first_name, last_name, created_at")
      .eq("id", bar.user_id)
      .maybeSingle(),
    listProductRequests({ status: "all", limit: 50 }),
    supabase
      .from("orders")
      .select("id, public_order_number, status, total_agorot, created_at")
      .eq("user_id", bar.user_id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const barRequests = requests.filter((r) => r.bar_profile_id === bar.id);
  const cleanPhone = (bar.whatsapp_number ?? bar.contact_phone).replace(/[^\d+]/g, "");

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/admin/bars"
        className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-[#71695F] hover:text-[#151411]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Retour aux bars
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#71695F]">
            <Store className="h-3.5 w-3.5" /> Bar / pro
          </div>
          <h2 className="mt-1 font-serif text-2xl text-[#151411]">{bar.business_name}</h2>
          {bar.legal_name && (
            <p className="text-sm text-[#71695F]">{bar.legal_name}</p>
          )}
          {bar.registration_number && (
            <p className="text-xs text-[#71695F]">ח״פ / עוסק : {bar.registration_number}</p>
          )}
        </div>

        <div className="flex gap-2">
          <a
            href={`tel:${bar.contact_phone.replace(/\s/g, "")}`}
            className="rounded-sm border border-[#E7DECE] px-4 py-2 text-xs font-medium uppercase tracking-widest text-[#151411] hover:border-[#C6A15B]"
          >
            <Phone className="mr-1.5 inline h-3.5 w-3.5" /> Appeler
          </a>
          {bar.contact_email && (
            <a
              href={`mailto:${bar.contact_email}`}
              className="rounded-sm border border-[#E7DECE] px-4 py-2 text-xs font-medium uppercase tracking-widest text-[#151411] hover:border-[#C6A15B]"
            >
              <Mail className="mr-1.5 inline h-3.5 w-3.5" /> Email
            </a>
          )}
          <a
            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Bonjour ${bar.contact_first_name}, ici Terminal 3.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm border border-emerald-600 bg-emerald-600 px-4 py-2 text-xs font-medium uppercase tracking-widest text-white hover:bg-emerald-700"
          >
            <MessageCircle className="mr-1.5 inline h-3.5 w-3.5" /> WhatsApp
          </a>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Left: bar info */}
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-sm border border-[#E7DECE] bg-white p-6">
            <h3 className="mb-3 font-serif text-lg text-[#151411]">Statut</h3>
            <BarStatusControls barProfileId={bar.id} currentStatus={bar.status} />
            {bar.approved_at && (
              <p className="mt-3 text-xs text-[#71695F]">
                Approuvé le {new Date(bar.approved_at).toLocaleDateString("fr-FR")}
              </p>
            )}
          </section>

          <section className="rounded-sm border border-[#E7DECE] bg-white p-6">
            <h3 className="mb-3 font-serif text-lg text-[#151411]">Contact</h3>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-widest text-[#71695F]">Contact</dt>
                <dd className="text-[#151411]">
                  {bar.contact_first_name} {bar.contact_last_name}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-[#71695F]">Téléphone</dt>
                <dd className="text-[#151411]">{bar.contact_phone}</dd>
              </div>
              {bar.whatsapp_number && (
                <div>
                  <dt className="text-xs uppercase tracking-widest text-[#71695F]">WhatsApp</dt>
                  <dd className="text-[#151411]">{bar.whatsapp_number}</dd>
                </div>
              )}
              {bar.contact_email && (
                <div>
                  <dt className="text-xs uppercase tracking-widest text-[#71695F]">Email</dt>
                  <dd className="text-[#151411]">{bar.contact_email}</dd>
                </div>
              )}
              {(bar.address || bar.city) && (
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-widest text-[#71695F]">
                    <MapPin className="mr-1 inline h-3 w-3" /> Adresse
                  </dt>
                  <dd className="text-[#151411]">
                    {[bar.address, bar.postal_code, bar.city].filter(Boolean).join(", ")}
                  </dd>
                </div>
              )}
              {bar.preferred_contact_window && (
                <div>
                  <dt className="text-xs uppercase tracking-widest text-[#71695F]">
                    Créneau préféré
                  </dt>
                  <dd className="text-[#151411]">{bar.preferred_contact_window}</dd>
                </div>
              )}
              {bar.pickup_preference && (
                <div>
                  <dt className="text-xs uppercase tracking-widest text-[#71695F]">Retrait</dt>
                  <dd className="text-[#151411]">
                    {PICKUP_LABEL[bar.pickup_preference] ?? bar.pickup_preference}
                  </dd>
                </div>
              )}
            </dl>
            {bar.notes && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-widest text-[#71695F]">Notes</p>
                <p className="mt-1 text-sm text-[#151411]">{bar.notes}</p>
              </div>
            )}
          </section>

          <section className="rounded-sm border border-[#E7DECE] bg-white p-6">
            <h3 className="mb-3 font-serif text-lg text-[#151411]">
              Demandes de produits ({barRequests.length})
            </h3>
            {barRequests.length === 0 ? (
              <p className="text-sm text-[#71695F]">Aucune demande pour ce bar.</p>
            ) : (
              <ul className="divide-y divide-[#E7DECE]">
                {barRequests.map((r) => (
                  <li key={r.id} className="py-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-serif text-base text-[#151411]">
                        {r.kind === "in_catalog"
                          ? r.product?.name_fr || r.product?.name_he
                          : `${r.requested_brand ?? ""} ${r.requested_name ?? ""}`.trim()}
                      </p>
                      <span className="text-xs text-[#71695F]">
                        {r.public_reference} · {new Date(r.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <p className="text-xs text-[#71695F]">
                      Statut : {r.status} · Quantité : {r.requested_quantity}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right: profile & orders summary */}
        <div className="space-y-4">
          {profile && (
            <section className="rounded-sm border border-[#E7DECE] bg-white p-6">
              <h3 className="mb-3 font-serif text-lg text-[#151411]">Compte client</h3>
              <p className="text-sm text-[#151411]">
                {profile.first_name} {profile.last_name}
              </p>
              {profile.email && <p className="text-xs text-[#71695F]">{profile.email}</p>}
              <p className="mt-2 text-xs text-[#71695F]">
                Inscrit le {new Date(profile.created_at).toLocaleDateString("fr-FR")}
              </p>
              <Link
                href={`/admin/clients/${profile.id}`}
                className="mt-3 inline-block text-xs font-medium uppercase tracking-widest text-[#692031] hover:underline"
              >
                Fiche client complète
              </Link>
            </section>
          )}

          <section className="rounded-sm border border-[#E7DECE] bg-white p-6">
            <h3 className="mb-3 font-serif text-lg text-[#151411]">Commandes récentes</h3>
            {(orders?.length ?? 0) === 0 ? (
              <p className="text-sm text-[#71695F]">Aucune commande pour ce compte.</p>
            ) : (
              <ul className="divide-y divide-[#E7DECE]">
                {(orders ?? []).map((o) => (
                  <li key={o.id} className="py-2">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="flex items-baseline justify-between gap-2 hover:text-[#692031]"
                    >
                      <span className="text-sm text-[#151411]">
                        {o.public_order_number ?? o.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className="text-xs text-[#71695F]">
                        {formatAgorot(o.total_agorot)}
                      </span>
                    </Link>
                    <p className="text-xs text-[#71695F]">
                      {o.status} · {new Date(o.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
