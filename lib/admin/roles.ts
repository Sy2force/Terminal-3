// Client-safe list of admin roles (no `server-only` import) — usable from
// both server code and client components like the roles manager form.
import type { AdminRoleType } from "@/types/database";

export const ALL_ADMIN_ROLES: AdminRoleType[] = [
  "OWNER",
  "MANAGER",
  "CONTENT_EDITOR",
  "STAFF",
  "COURIER",
  "ORDER_MANAGER",
  "DELIVERY_MANAGER",
  "CUSTOMER_SUPPORT",
];
