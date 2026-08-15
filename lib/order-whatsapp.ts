import type { OrderWithDetails } from "@/lib/data/orders";
import { formatAgorot } from "@/lib/money";

/**
 * Builds the WhatsApp order recap message (never sent automatically —
 * only opened when the customer taps the button) with every field the
 * store needs to prepare the order: products, variants, quantities,
 * pricing, fulfillment details and the cash-on-pickup/delivery reminder.
 */
export function buildOrderWhatsAppMessage(order: OrderWithDetails): string {
  const lines: (string | null)[] = [
    `Bonjour Terminal 3, voici ma commande n°${order.id.slice(0, 8).toUpperCase()} :`,
    `Client : ${order.customer_name ?? ""} — ${order.customer_phone ?? ""}`,
    "",
  ];

  for (const group of order.fulfillment_groups) {
    for (const item of group.items) {
      const parts = [
        `${item.quantity} × ${item.product_name_snapshot}`,
        item.variant_label_snapshot ? `(${item.variant_label_snapshot})` : null,
        `— ${formatAgorot(item.final_price_agorot_snapshot * item.quantity)}`,
      ].filter(Boolean);
      lines.push(parts.join(" "));
    }
  }

  lines.push("");
  if (order.discount_agorot > 0) {
    lines.push(`${order.discount_label ?? "Réduction"} : -${formatAgorot(order.discount_agorot)}`);
  }
  lines.push(`Total : ${formatAgorot(order.total_agorot)}`);
  lines.push("");
  lines.push(
    order.fulfillment_type === "delivery"
      ? "Mode : Livraison"
      : "Mode : Retrait en boutique",
  );
  if (order.fulfillment_type === "delivery" && order.delivery_address) {
    lines.push(
      [
        `Adresse : ${order.delivery_address}`,
        order.city ? `, ${order.city}` : "",
        order.floor ? ` — étage ${order.floor}` : "",
      ].join(""),
    );
    if (order.entry_code) lines.push(`Code d'entrée : ${order.entry_code}`);
    if (order.delivery_instructions) lines.push(`Instructions : ${order.delivery_instructions}`);
  }
  if (order.desired_date) lines.push(`Date souhaitée : ${order.desired_date}`);
  if (order.time_slot) lines.push(`Créneau : ${order.time_slot}`);
  if (order.customer_notes) lines.push(`Commentaire : ${order.customer_notes}`);
  lines.push("");
  lines.push("Paiement en espèces au retrait ou à la livraison.");
  if (order.age_self_declared) {
    lines.push("Une pièce d'identité valide sera présentée pour les produits 18+.");
  }

  return lines.filter((l) => l !== null).join("\n");
}

export function buildOrderWhatsAppHref(order: OrderWithDetails, storeWhatsapp: string): string | null {
  if (!storeWhatsapp) return null;
  const digits = storeWhatsapp.replace(/[^\d+]/g, "").replace(/^\+/, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(buildOrderWhatsAppMessage(order))}`;
}
