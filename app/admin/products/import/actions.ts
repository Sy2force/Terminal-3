"use server";

import { revalidatePath } from "next/cache";
import { requireAdminPermission } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { createProduct, type ProductInput } from "@/lib/data/products";
import { getAllCategories } from "@/lib/data/categories";

export interface CsvImportRowResult {
  row: number;
  slug: string;
  success: boolean;
  error?: string;
}

export interface CsvImportResult {
  total: number;
  created: number;
  failed: number;
  rows: CsvImportRowResult[];
}

const REQUIRED_COLUMNS = ["slug", "name_he", "name_fr", "category_slug", "base_price_agorot"];

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    // Basic CSV split; sufficient for simple product exports without
    // embedded commas inside quoted fields.
    const values = line.split(",").map((v) => v.trim());
    const record: Record<string, string> = {};
    headers.forEach((h, i) => {
      record[h] = values[i] ?? "";
    });
    return record;
  });
}

/**
 * Bulk product import from CSV. Expected header row includes at least:
 * slug, name_he, name_fr, category_slug, base_price_agorot
 * Optional: brand, description_fr, status, age_restricted
 *
 * Each row is created independently through the same validated
 * `createProduct` path used by the single-product form — a failure on
 * one row does not stop the rest of the import.
 */
export async function importProductsCsvAction(csvText: string): Promise<CsvImportResult> {
  const session = await requireAdminPermission("catalog.products");

  const rows = parseCsv(csvText);
  const categories = await getAllCategories();
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  const results: CsvImportRowResult[] = [];

  if (rows.length === 0) {
    return { total: 0, created: 0, failed: 0, rows: [] };
  }

  const missingColumns = REQUIRED_COLUMNS.filter((col) => !(col in rows[0]));
  if (missingColumns.length > 0) {
    return {
      total: rows.length,
      created: 0,
      failed: rows.length,
      rows: rows.map((r, i) => ({
        row: i + 2,
        slug: r.slug ?? "",
        success: false,
        error: `Colonnes manquantes: ${missingColumns.join(", ")}`,
      })),
    };
  }

  let created = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNumber = i + 2; // account for header row, 1-indexed

    try {
      if (!row.slug || !row.name_he) {
        throw new Error("slug et name_he sont requis");
      }

      const categoryId = row.category_slug ? categoryBySlug.get(row.category_slug) ?? null : null;
      const basePrice = row.base_price_agorot ? parseInt(row.base_price_agorot, 10) : null;

      const product: ProductInput = {
        slug: row.slug,
        name_he: row.name_he,
        name_fr: row.name_fr || row.name_he,
        category_id: categoryId,
        brand: row.brand || null,
        description_fr: row.description_fr || null,
        base_price_agorot: Number.isFinite(basePrice) ? basePrice : null,
        status: (row.status as ProductInput["status"]) || "draft",
        age_restricted: row.age_restricted === "true" || row.age_restricted === "1",
      };

      const result = await createProduct(product, [{ label: "Défaut", is_default: true }], []);
      results.push({ row: lineNumber, slug: row.slug, success: true });
      void result;
      created += 1;
    } catch (err) {
      results.push({
        row: lineNumber,
        slug: row.slug ?? "",
        success: false,
        error: err instanceof Error ? err.message : "import_row_failed",
      });
    }
  }

  await logAudit({
    actor: session.userId,
    action: "created",
    entityType: "product",
    entityId: "csv_import",
    metadata: { total: rows.length, created, failed: rows.length - created },
  });

  revalidatePath("/admin/products");
  revalidatePath("/categories");

  return { total: rows.length, created, failed: rows.length - created, rows: results };
}
