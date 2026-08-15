import "server-only";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { OrderWithDetails } from "@/lib/data/orders";
import { formatAgorot } from "@/lib/money";
import { DEFAULT_BUSINESS_CONFIG } from "@/lib/config";

/**
 * Generates a PDF for an order. Before the store has actually collected
 * payment, this is only ever a "récapitulatif de commande" (order
 * summary) — never a fiscal invoice or payment receipt, per the
 * accounting rule that a real invoice/receipt is only issued once payment
 * status allows it (see `kind` parameter).
 */
export async function generateOrderRecapPdf(
  order: OrderWithDetails,
  kind: "order_summary" | "invoice" | "receipt" = "order_summary",
  invoiceNumber?: string,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  let y = 800;
  const gold = rgb(0.71, 0.62, 0.36);
  const dark = rgb(0.09, 0.08, 0.07);
  const grey = rgb(0.45, 0.45, 0.45);

  function text(
    value: string,
    x: number,
    yPos: number,
    options: { size?: number; f?: typeof font; color?: ReturnType<typeof rgb> } = {},
  ) {
    page.drawText(value, {
      x,
      y: yPos,
      size: options.size ?? 10,
      font: options.f ?? font,
      color: options.color ?? dark,
    });
  }

  const titles: Record<string, string> = {
    order_summary: "Récapitulatif de commande",
    invoice: "Facture",
    receipt: "Reçu de paiement",
  };

  text(DEFAULT_BUSINESS_CONFIG.STORE_NAME, margin, y, { size: 20, f: bold, color: gold });
  y -= 18;
  text(DEFAULT_BUSINESS_CONFIG.STORE_ADDRESS, margin, y, { size: 9, color: grey });
  y -= 12;
  text(DEFAULT_BUSINESS_CONFIG.STORE_PHONE, margin, y, { size: 9, color: grey });

  y -= 30;
  text(titles[kind], margin, y, { size: 16, f: bold });
  y -= 20;
  text(`N° ${invoiceNumber ?? order.id.slice(0, 8).toUpperCase()}`, margin, y, { size: 10 });
  y -= 14;
  text(`Commande #${order.id.slice(0, 8).toUpperCase()}`, margin, y, { size: 10 });
  y -= 14;
  text(`Date : ${new Date(order.created_at).toLocaleString("fr-FR")}`, margin, y, { size: 10 });
  y -= 14;
  text(`Client : ${order.customer_name ?? "—"} (${order.customer_phone ?? "—"})`, margin, y, { size: 10 });
  y -= 14;
  text(
    `Mode : ${order.fulfillment_type === "delivery" ? "Livraison" : "Retrait en magasin"}`,
    margin,
    y,
    { size: 10 },
  );
  if (order.fulfillment_type === "delivery" && order.delivery_address) {
    y -= 14;
    text(`Adresse : ${order.delivery_address}`, margin, y, { size: 10 });
  }

  y -= 30;
  text("Produits", margin, y, { size: 11, f: bold });
  y -= 16;

  for (const group of order.fulfillment_groups) {
    for (const item of group.items) {
      const label = `${item.quantity} × ${item.product_name_snapshot}${
        item.variant_label_snapshot ? ` (${item.variant_label_snapshot})` : ""
      }`;
      text(label, margin, y, { size: 10 });
      text(
        formatAgorot(item.final_price_agorot_snapshot * item.quantity),
        margin + 400,
        y,
        { size: 10 },
      );
      y -= 16;
      if (y < 120) {
        y = 800;
        doc.addPage([595.28, 841.89]);
      }
    }
  }

  y -= 14;
  page.drawLine({
    start: { x: margin, y: y + 6 },
    end: { x: 545, y: y + 6 },
    thickness: 0.5,
    color: grey,
  });
  y -= 14;

  if (order.discount_agorot > 0) {
    text(order.discount_label ?? "Réduction", margin, y, { size: 10 });
    text(`-${formatAgorot(order.discount_agorot)}`, margin + 400, y, { size: 10, color: gold });
    y -= 16;
  }

  text("Total", margin, y, { size: 13, f: bold });
  text(formatAgorot(order.total_agorot), margin + 400, y, { size: 13, f: bold, color: gold });
  y -= 24;

  text("Paiement : espèces au retrait ou à la livraison — non encaissé en ligne.", margin, y, {
    size: 9,
    color: grey,
  });
  y -= 12;
  text(`Statut de la commande : ${order.status}`, margin, y, { size: 9, color: grey });

  return doc.save();
}
