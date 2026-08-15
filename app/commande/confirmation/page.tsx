import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { getOrderById } from "@/lib/data/orders";
import { getSiteSettings } from "@/lib/settings";
import { formatAgorot } from "@/lib/money";
import { orderStatusLabel } from "@/lib/order-status-labels";
import { buildOrderWhatsAppHref } from "@/lib/order-whatsapp";

export const metadata = {
  title: "Commande envoyée | Terminal 3",
};

/**
 * A dedicated, French-named confirmation page for the /commande flow —
 * distinct from the technical /orders/[id] route used by "Mes
 * commandes", but backed by the exact same `getOrderById` (which only
 * ever returns the caller's own order under RLS — the id in the URL
 * alone is never sufficient to read someone else's order).
 */
export default async function CommandeConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  if (!orderId) notFound();

  const [order, settings] = await Promise.all([getOrderById(orderId), getSiteSettings()]);
  if (!order) notFound();

  const whatsappHref = buildOrderWhatsAppHref(order, settings.STORE_WHATSAPP);

  return (
    <div className="min-h-screen bg-fond-papier">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="h-10 w-10 text-bordeaux-principal" aria-hidden />
          <h1 className="mt-4 font-serif text-3xl text-noir-profond sm:text-4xl">
            Commande envoyée
          </h1>
          <p className="mt-2 text-sm text-gris-chaud">
            Réf. {order.id.slice(0, 8).toUpperCase()} · {orderStatusLabel(order.status)}
          </p>
          <p className="mt-4 max-w-md text-sm text-noir-profond/80">
            {order.fulfillment_type === "delivery"
              ? "Notre équipe vous contacte pour organiser la livraison."
              : "Votre commande sera prête au retrait en boutique."}{" "}
            Le paiement se fait{" "}
            {order.fulfillment_type === "delivery" ? "auprès du livreur" : "sur place"}, en
            espèces — aucun paiement en ligne n&rsquo;a été effectué. Cette commande reste
            soumise à confirmation du magasin.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-4 rounded-sm border border-brun-cave/15 bg-white/50 p-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gris-chaud">Mode de récupération</span>
            <span className="font-medium text-noir-profond">
              {order.fulfillment_type === "delivery" ? "Livraison" : "Retrait en boutique"}
            </span>
          </div>
          {order.fulfillment_type === "delivery" && order.delivery_address ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gris-chaud">Adresse</span>
              <span className="font-medium text-noir-profond">
                {order.delivery_address}
                {order.city ? `, ${order.city}` : ""}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gris-chaud">Boutique</span>
              <span className="font-medium text-noir-profond">{settings.STORE_ADDRESS}</span>
            </div>
          )}
          {order.desired_date && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gris-chaud">Date souhaitée</span>
              <span className="font-medium text-noir-profond">{order.desired_date}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-brun-cave/15 pt-4">
            <span className="text-sm text-noir-profond/80">Montant total</span>
            <span className="font-serif text-2xl text-bordeaux-principal">
              {formatAgorot(order.total_agorot)}
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-sm bg-bordeaux-principal px-6 py-3 text-sm font-medium uppercase tracking-widest text-texte-clair transition-colors hover:bg-bordeaux-fonce"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Envoyer sur WhatsApp
            </a>
          )}
          <Link
            href="/"
            className="rounded-sm border border-brun-cave/25 px-6 py-3 text-sm font-medium uppercase tracking-widest text-noir-profond transition-colors hover:border-bordeaux-principal hover:text-bordeaux-principal"
          >
            Retour à l&rsquo;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
