import "server-only";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type {
  ProductRequestRow,
  ProductRequestStatus,
  ProductRequestKind,
} from "@/types/database";

export type ProductRequest = ProductRequestRow;

export interface ProductRequestWithProduct extends ProductRequest {
  product: {
    id: string;
    slug: string;
    name_fr: string | null;
    name_he: string;
    brand: string | null;
  } | null;
}

/**
 * Product requests — either a "please quote me this catalog item" request
 * (in_catalog) or an out-of-catalog request (client asked for an alcohol
 * we don't currently stock). Both live in the same table so admins have
 * a single inbox.
 */

export async function getMyProductRequests(): Promise<ProductRequestWithProduct[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("product_requests")
    .select("*, product:products(id, slug, name_fr, name_he, brand)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data as unknown as ProductRequestWithProduct[]) ?? [];
}

export async function getProductRequestById(
  id: string,
): Promise<ProductRequestWithProduct | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_requests")
    .select("*, product:products(id, slug, name_fr, name_he, brand)")
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as ProductRequestWithProduct | null) ?? null;
}

export async function listProductRequests(options?: {
  status?: ProductRequestStatus | "all";
  kind?: ProductRequestKind | "all";
  search?: string;
  limit?: number;
}): Promise<ProductRequestWithProduct[]> {
  const supabase = await createClient();
  let query = supabase
    .from("product_requests")
    .select("*, product:products(id, slug, name_fr, name_he, brand)")
    .order("created_at", { ascending: false })
    .limit(options?.limit ?? 200);

  if (options?.status && options.status !== "all") {
    query = query.eq("status", options.status);
  }
  if (options?.kind && options.kind !== "all") {
    query = query.eq("kind", options.kind);
  }
  if (options?.search) {
    const term = `%${options.search}%`;
    query = query.or(
      `requested_name.ilike.${term},requested_brand.ilike.${term},public_reference.ilike.${term}`,
    );
  }

  const { data, error } = await query;
  if (error) return [];
  return (data as unknown as ProductRequestWithProduct[]) ?? [];
}

/**
 * Admin action to move a product request through its workflow. Uses the
 * service role client to write to `audit_logs` immutably (see
 * 0021_identity_verification.sql for the audit_logs shape).
 */
export async function adminUpdateProductRequest(
  requestId: string,
  actorUserId: string,
  patch: Partial<
    Pick<
      ProductRequest,
      | "status"
      | "quote_price_agorot"
      | "quote_note"
      | "admin_response"
      | "product_id"
      | "variant_id"
    >
  >,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceRoleClient();

  const update = {
    ...patch,
    handled_by: actorUserId,
    handled_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("product_requests")
    .update(update)
    .eq("id", requestId);

  if (error) return { success: false, error: error.message };

  await supabase.from("audit_logs").insert({
    actor_user_id: actorUserId,
    action: "product_request.update",
    entity_type: "product_request",
    entity_id: requestId,
    metadata: patch as Record<string, unknown>,
  });

  return { success: true };
}

export async function countOpenProductRequests(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("product_requests")
    .select("id", { count: "exact", head: true })
    .in("status", ["new", "reviewing"]);
  return count ?? 0;
}
