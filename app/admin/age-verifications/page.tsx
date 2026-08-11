import Link from "next/link";
import { Phone, MapPin, AlertTriangle } from "lucide-react";
import { requireAdminPermission } from "@/lib/admin/auth";
import { getPendingAgeVerifications } from "@/lib/data/orders-admin";
import { createClient } from "@/lib/supabase/server";
import { AgeVerificationActions } from "@/components/admin/age-verification-actions";
import { formatAgorot } from "@/lib/money";

export default async function AdminAgeVerificationsPage() {
  await requireAdminPermission("sales.age_verification");
  const supabase = await createClient();
  const verifications = await getPendingAgeVerifications();

  const orderIds = verifications.map((v) => v.order_id);
  const [{ data: items }, { data: groups }] = await Promise.all([
    orderIds.length > 0
      ? supabase.from("order_items").select("*").in("order_id", orderIds)
      : Promise.resolve({ data: [], error: null }),
    orderIds.length > 0
      ? supabase.from("order_fulfillment_groups").select("*").in("order_id", orderIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const itemsByOrder = (items ?? []).reduce<Record<string, typeof items>>((acc, item) => {
    const arr = acc[item.order_id] ?? [];
    arr.push(item);
    acc[item.order_id] = arr;
    return acc;
  }, {});

  const restrictedGroupIds = new Set(
    (groups ?? []).filter((g) => g.group_type === "AGE_RESTRICTED").map((g) => g.id),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-ivory">
          Vérifications d&apos;âge en attente
        </h1>
        <p className="mt-1 text-sm text-muted-grey">
          {verifications.length} vérification{verifications.length > 1 ? "s" : ""} en attente
        </p>
      </div>

      {verifications.length === 0 && (
        <div className="rounded-sm border border-white/5 bg-graphite p-12 text-center text-sm text-muted-grey">
          Aucune vérification d&apos;âge en attente.
        </div>
      )}

      <div className="grid gap-4">
        {verifications.map((v) => {
          const orderItems = itemsByOrder[v.order_id] ?? [];
          const restrictedItems = orderItems.filter(
            (i) => restrictedGroupIds.has(i.fulfillment_group_id),
          );
          const order = v.order;

          return (
            <div
              key={v.id}
              className="flex flex-col gap-4 rounded-sm border border-amber-400/20 bg-graphite/30 p-5 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <Link
                    href={`/admin/orders/${v.order_id}`}
                    className="text-sm font-medium text-champagne hover:text-soft-gold"
                  >
                    Commande {v.order_id.slice(0, 8).toUpperCase()}
                  </Link>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-ivory/70">
                  <span>{order?.customer_name || "Client anonyme"}</span>
                  {order?.customer_phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-muted-grey" />
                      {order.customer_phone}
                    </span>
                  )}
                  {order?.fulfillment_type === "delivery" && order?.delivery_address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-grey" />
                      {order.delivery_address}
                    </span>
                  )}
                </div>

                {restrictedItems.length > 0 && (
                  <div className="rounded-sm border border-amber-400/20 bg-amber-400/5 p-3">
                    <span className="text-xs uppercase tracking-widest text-amber-400">
                      Produits 18+
                    </span>
                    <ul className="mt-2 space-y-1">
                      {restrictedItems.map((item) => (
                        <li key={item.id} className="flex justify-between text-sm text-ivory/80">
                          <span>
                            {item.quantity}× {item.product_name_snapshot}
                            {item.variant_label_snapshot && (
                              <span className="text-muted-grey"> ({item.variant_label_snapshot})</span>
                            )}
                          </span>
                          <span className="text-ivory/60">
                            {formatAgorot(item.final_price_agorot_snapshot)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-muted-grey">
                  Créée le{" "}
                  {new Date(v.created_at).toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
              </div>

              <div className="shrink-0">
                <AgeVerificationActions verificationId={v.id} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
