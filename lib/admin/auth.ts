import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { AdminRoleType } from "@/types/database";

export type AdminPermission =
  | "store.settings"
  | "catalog.products"
  | "catalog.categories"
  | "catalog.media"
  | "marketing.promotions"
  | "marketing.content"
  | "sales.orders"
  | "sales.age_verification"
  | "customers.view"
  | "customers.edit"
  | "customers.view_sensitive"
  | "customers.verify"
  | "orders.view"
  | "orders.edit"
  | "payments.confirm"
  | "invoices.manage"
  | "deliveries.manage"
  | "loyalty.manage"
  | "discounts.manage"
  | "data.export"
  | "audit.view"
  | "staff.manage"
  | "admin.users";

/**
 * The full permission matrix, per role. This is the single source of truth
 * for what each role can do — server-side checks (`requireAdminPermission`)
 * and RLS policies both enforce it independently; hiding a button in the UI
 * is never treated as sufficient protection on its own.
 */
const ROLE_PERMISSIONS: Record<AdminRoleType, AdminPermission[]> = {
  OWNER: [
    "store.settings",
    "catalog.products",
    "catalog.categories",
    "catalog.media",
    "marketing.promotions",
    "marketing.content",
    "sales.orders",
    "sales.age_verification",
    "customers.view",
    "customers.edit",
    "customers.view_sensitive",
    "customers.verify",
    "orders.view",
    "orders.edit",
    "payments.confirm",
    "invoices.manage",
    "deliveries.manage",
    "loyalty.manage",
    "discounts.manage",
    "data.export",
    "audit.view",
    "staff.manage",
    "admin.users",
  ],
  MANAGER: [
    "store.settings",
    "catalog.products",
    "catalog.categories",
    "catalog.media",
    "marketing.promotions",
    "marketing.content",
    "sales.orders",
    "sales.age_verification",
    "customers.view",
    "customers.edit",
    "customers.view_sensitive",
    "customers.verify",
    "orders.view",
    "orders.edit",
    "payments.confirm",
    "invoices.manage",
    "deliveries.manage",
    "loyalty.manage",
    "discounts.manage",
    "data.export",
    "audit.view",
  ],
  CONTENT_EDITOR: [
    "catalog.media",
    "marketing.content",
    "catalog.products",
  ],
  STAFF: [
    "sales.orders",
    "sales.age_verification",
    "customers.view",
    "customers.verify",
    "orders.view",
    "orders.edit",
  ],
  COURIER: ["sales.orders", "sales.age_verification", "deliveries.manage"],
  ORDER_MANAGER: [
    "sales.orders",
    "sales.age_verification",
    "orders.view",
    "orders.edit",
    "payments.confirm",
    "invoices.manage",
    "customers.view",
  ],
  DELIVERY_MANAGER: [
    "sales.orders",
    "deliveries.manage",
    "orders.view",
    "customers.view",
  ],
  // Can help a customer (view non-sensitive info, orders) without ever
  // needing to see their identity document or edit their coordinates.
  CUSTOMER_SUPPORT: [
    "customers.view",
    "orders.view",
    "sales.orders",
  ],
};

export interface AdminSession {
  userId: string;
  email: string | null;
  role: AdminRoleType;
}

/**
 * Verifies the current user is authenticated and has an admin role.
 * Redirects to login or home if not. Call from Server Components.
 */
export async function requireAdmin(): Promise<AdminSession> {
  // getCurrentUser() returns null in demo mode (no live Supabase project
  // to authenticate against) — this redirects exactly like an
  // unauthenticated visitor rather than crashing the whole /admin
  // section with a raw "URL and Key are required" error.
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  const supabase = await createClient();
  const { data: roleRow } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!roleRow) {
    redirect("/");
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    role: roleRow.role as AdminRoleType,
  };
}

export function hasPermission(
  role: AdminRoleType,
  permission: AdminPermission,
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getRolePermissions(role: AdminRoleType): AdminPermission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Like requireAdmin but also checks a specific permission.
 */
export async function requireAdminPermission(
  permission: AdminPermission,
): Promise<AdminSession> {
  const session = await requireAdmin();
  if (!hasPermission(session.role, permission)) {
    redirect("/admin");
  }
  return session;
}

/**
 * Non-redirecting variant for API route handlers. Returns the admin session
 * only if the user is authenticated and holds any admin role.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
}
