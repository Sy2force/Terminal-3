import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/data/orders";
import { generateOrderRecapPdf } from "@/lib/pdf/order-recap";

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

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="commande-${order.id.slice(0, 8)}.pdf"`,
    },
  });
}
