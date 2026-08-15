import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getOrderById } from "@/lib/data/orders";
import { formatAgorot } from "@/lib/money";
import {
  ORDER_STATUS_LABELS,
  FOOD_STATUS_LABELS,
  ALCOHOL_STATUS_LABELS,
} from "@/lib/order-status-labels";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <CheckCircle2 className="h-10 w-10 text-champagne" aria-hidden />
        <h1 className="mt-4 font-serif text-3xl text-ivory">
          Commande envoyée
        </h1>
        <p className="mt-2 text-sm text-muted-grey">
          Réf. {order.id.slice(0, 8).toUpperCase()} ·{" "}
          {ORDER_STATUS_LABELS[order.status]}
        </p>
        <p className="mt-4 max-w-md text-sm text-ivory/70">
          {order.fulfillment_type === "delivery"
            ? "Notre équipe vous contacte pour organiser la livraison."
            : "Votre commande sera prête au retrait en magasin."}{" "}
          Le paiement se fait{" "}
          {order.fulfillment_type === "delivery"
            ? "auprès du livreur"
            : "sur place"}
          , aucun paiement en ligne n&rsquo;a été effectué.
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-6 rounded-sm border border-white/5 bg-graphite p-6">
        {order.fulfillment_groups.map((group) => (
          <div key={group.id}>
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg text-ivory">
                {group.group_type === "AGE_RESTRICTED"
                  ? "Produits 18+"
                  : "Produits"}
              </h2>
              <span className="text-xs uppercase tracking-widest text-champagne">
                {group.group_type === "AGE_RESTRICTED"
                  ? ALCOHOL_STATUS_LABELS[group.alcohol_status!]
                  : FOOD_STATUS_LABELS[group.food_status!]}
              </span>
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {group.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between text-sm text-ivory/80"
                >
                  <span>
                    {item.quantity} × {item.product_name_snapshot}
                    {item.variant_label_snapshot && (
                      <span className="text-muted-grey">
                        {" "}
                        ({item.variant_label_snapshot})
                      </span>
                    )}
                  </span>
                  <span className="text-champagne">
                    {formatAgorot(item.final_price_agorot_snapshot * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="flex flex-col gap-1 border-t border-white/5 pt-4">
          {order.discount_agorot > 0 && (
            <div className="flex items-center justify-between text-sm text-champagne">
              <span>{order.discount_label ?? "Réduction"}</span>
              <span>-{formatAgorot(order.discount_agorot)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-ivory/70">Total</span>
            <span className="font-serif text-xl text-champagne">
              {formatAgorot(order.total_agorot)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Link
          href={`/orders/${order.id}/tracking`}
          className="rounded-full border border-champagne/40 px-6 py-3 text-sm font-medium text-champagne transition-colors hover:bg-champagne/10"
        >
          Suivre ma commande
        </Link>
        <Link
          href="/account/orders"
          className="rounded-full border border-white/10 px-6 py-3 text-sm text-ivory/80 transition-colors hover:border-champagne hover:text-champagne"
        >
          Mes commandes
        </Link>
        <Link
          href="/nouveautes"
          className="rounded-full bg-champagne px-6 py-3 text-sm font-semibold text-obsidian transition-colors hover:bg-soft-gold"
        >
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}
