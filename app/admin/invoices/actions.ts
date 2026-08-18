"use server";

import { revalidatePath } from "next/cache";
import { requireAdminPermission } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { createInvoiceFromOrder } from "@/lib/data/invoices";

export interface InvoiceActionResult {
  success: boolean;
  invoiceId?: string;
  error?: string;
}

export async function createInvoiceFromOrderAction(orderId: string): Promise<InvoiceActionResult> {
  const session = await requireAdminPermission("invoices.manage");
  const result = await createInvoiceFromOrder(orderId);
  if (result.success && result.invoiceId) {
    await logAudit({
      actor: session.userId,
      action: "created",
      entityType: "payment",
      entityId: result.invoiceId,
      metadata: { order_id: orderId, kind: "invoice_draft" },
    });
    revalidatePath("/admin/invoices");
    revalidatePath(`/admin/orders/${orderId}`);
  }
  return result;
}
