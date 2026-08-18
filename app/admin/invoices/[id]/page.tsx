import { notFound } from "next/navigation";
import { requireAdminPermission } from "@/lib/admin/auth";
import { getInvoiceById } from "@/lib/data/invoices";
import { getOrderDetailsForStaff } from "@/lib/data/orders-admin";
import { InvoicePreview } from "@/components/admin/invoice-preview";

export default async function AdminInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPermission("invoices.manage");
  const { id } = await params;
  const invoice = await getInvoiceById(id);
  if (!invoice) notFound();

  const order = await getOrderDetailsForStaff(invoice.order_id);
  if (!order) notFound();

  return <InvoicePreview invoice={invoice} order={order} />;
}
