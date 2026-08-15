import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/data/orders";
import { generateOrderRecapPdf } from "@/lib/pdf/order-recap";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Streams a "récapitulatif de commande" PDF for the given order. Access is
 * gated by RLS inside `getOrderById` — a user can only fetch their own
 * order (staff can fetch any). This is always the pre-payment order
 * summary; a real invoice/receipt is a distinct `kind` generated only once
 * payment has been recorded (see lib/pdf/order-recap.ts).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  const pdfBytes = await generateOrderRecapPdf(order, "order_summary");

  // Records that this document exists (for /admin/invoices and /compte/factures
  // to list) — this is only ever the pre-payment "order_summary" kind here.
  // Best-effort: never block the download if this write fails.
  try {
    const service = createServiceRoleClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- invoices not yet in generated Database type
    const db = service as any;
    await db.from("invoices").upsert(
      {
        order_id: order.id,
        kind: "order_summary",
        number: order.id.slice(0, 8).toUpperCase(),
        payment_status: "unpaid",
        order_status: order.status,
        totals: { total_agorot: order.total_agorot, discount_agorot: order.discount_agorot },
      },
      { onConflict: "order_id,kind" },
    );
  } catch {
    // ignored — the PDF download itself already succeeded
  }

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="commande-${order.id.slice(0, 8)}.pdf"`,
    },
  });
}
