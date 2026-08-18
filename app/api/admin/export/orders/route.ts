import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { getOrdersForStaff } from "@/lib/data/orders-admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const orders = await getOrdersForStaff("all");

  const headers = [
    "id",
    "status",
    "channel",
    "fulfillment_type",
    "customer_name",
    "customer_phone",
    "total_agorot",
    "discount_agorot",
    "discount_label",
    "delivery_address",
    "city",
    "floor",
    "customer_notes",
    "created_at",
    "updated_at",
  ];

  const rows = orders.map((o) => [
    o.id,
    o.status,
    o.channel,
    o.fulfillment_type,
    o.customer_name ?? "",
    o.customer_phone ?? "",
    String(o.total_agorot ?? 0),
    String(o.discount_agorot ?? 0),
    o.discount_label ?? "",
    o.delivery_address ?? "",
    o.city ?? "",
    o.floor ?? "",
    o.customer_notes ?? "",
    o.created_at,
    o.updated_at,
  ]);

  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const filename = `orders-terminal3-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function csvCell(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
