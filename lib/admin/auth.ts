import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
  | "staff.manage"
  | "admin.users";

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
  ],
  CONTENT_EDITOR: [
    "catalog.media",
    "marketing.content",
    "catalog.products",
  ],
  STAFF: ["sales.orders", "sales.age_verification", "customers.view"],
  COURIER: ["sales.orders", "sales.age_verification"],
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

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
