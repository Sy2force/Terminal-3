import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { getAllProducts } from "@/lib/data/products";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const products = await getAllProducts();

  const headers = [
    "id",
    "name_fr",
    "name_he",
    "slug",
    "category",
    "brand",
    "product_type",
    "status",
    "availability_status",
    "base_price_agorot",
    "compare_at_price_agorot",
    "is_featured",
    "is_best_seller",
    "created_at",
    "updated_at",
  ];

  const rows = products.map((p) => [
    p.id,
    p.name_fr ?? "",
    p.name_he ?? "",
    p.slug,
    p.category?.name_fr ?? "",
    p.brand ?? "",
    p.product_type,
    p.status,
    p.availability_status,
    String(p.base_price_agorot ?? 0),
    p.compare_at_price_agorot != null ? String(p.compare_at_price_agorot) : "",
    p.is_featured ? "1" : "0",
    p.is_best_seller ? "1" : "0",
    p.created_at,
    p.updated_at,
  ]);

  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const filename = `products-terminal3-${new Date().toISOString().slice(0, 10)}.csv`;

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
