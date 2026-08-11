import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listOrdersForCurrentUser } from "@/lib/data/orders";
import { formatAgorot } from "@/lib/money";
import { ORDER_STATUS_LABELS } from "@/lib/order-status-labels";
import { EmptyState } from "@/components/ui/empty-state";

export default async function AccountOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account/orders");

  const orders = await listOrdersForCurrentUser();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
      <span className="text-xs uppercase tracking-[0.3em] text-champagne">
        Mon compte
      </span>
      <h1 className="mt-2 font-serif text-3xl text-ivory">Mes commandes</h1>

      {orders.length === 0 ? (
        <EmptyState className="mt-8" message="Aucune commande pour le moment." />
      ) : (
        <div className="mt-8 flex flex-col divide-y divide-white/5 border-y border-white/5">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between py-5"
            >
              <Link
                href={`/orders/${order.id}`}
                className="flex-1 transition-colors hover:bg-graphite/40"
              >
                <p className="font-serif text-base text-ivory">
                  Réf. {order.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-xs text-muted-grey">
                  {new Date(order.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  · {ORDER_STATUS_LABELS[order.status]}
                </p>
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  href={`/orders/${order.id}/tracking`}
                  className="text-xs text-champagne transition-colors hover:text-soft-gold"
                >
                  Suivre
                </Link>
                <span className="text-sm text-champagne">
                  {formatAgorot(order.total_agorot)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
