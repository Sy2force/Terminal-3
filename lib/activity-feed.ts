/**
 * Builds the admin "Activité en direct" feed from real data sources.
 * Pure and synchronous so it can be unit-tested without Supabase.
 *
 * Sources merged chronologically (most recent first):
 * - new orders
 * - new customer accounts (particuliers / professionnels)
 * - new professional (bar) leads
 * - admin audit log entries (publications, status changes, …)
 *
 * Never include credentials, tokens or document data in `text`/`href`.
 */

export type ActivityKind =
  | "order"
  | "account"
  | "lead"
  | "status"
  | "publish"
  | "stock"
  | "audit";

export interface ActivityItem {
  id: string;
  at: string;
  kind: ActivityKind;
  text: string;
  href: string | null;
}

export interface ActivityOrderInput {
  id: string;
  public_order_number: string | null;
  customer_name: string | null;
  total_agorot: number | null;
  status: string;
  item_count: number;
  created_at: string;
}

export interface ActivityProfileInput {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  account_type: string | null;
  created_at: string;
}

export interface ActivityBarInput {
  id: string;
  business_name: string;
  created_at: string;
}

export interface ActivityAuditInput {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  actor_name: string | null;
  created_at: string;
}

export interface ActivityStockInput {
  id: string;
  name: string;
}

const AUDIT_ACTION_LABELS: Record<string, string> = {
  created: "Création",
  updated: "Modification",
  deleted: "Suppression",
  published: "Publication",
  archived: "Archivage",
  restored: "Restauration",
  scheduled: "Publication programmée",
  status_changed: "Changement de statut",
  age_verified: "Vérification 18+ confirmée",
  age_verification_failed: "Vérification 18+ échouée",
  login: "Connexion",
  logout: "Déconnexion",
};

const ENTITY_LABELS: Record<string, string> = {
  order: "commande",
  product: "produit",
  page_content: "page",
  homepage_section: "contenu",
  category: "catégorie",
  promotion: "promotion",
  content_post: "article",
  media: "média",
  user: "utilisateur",
  bar_profile: "établissement",
  age_verification: "vérification 18+",
};

function entityHref(entityType: string, entityId: string | null): string | null {
  if (!entityId) return null;
  switch (entityType) {
    case "order":
      return `/admin/orders/${entityId}`;
    case "product":
      return `/admin/products/${entityId}`;
    case "category":
      return `/admin/categories`;
    case "promotion":
      return `/admin/promotions/${entityId}`;
    case "bar_profile":
      return `/admin/bars/${entityId}`;
    case "user":
      return `/admin/clients/${entityId}`;
    default:
      return null;
  }
}

function auditKind(action: string): ActivityKind {
  if (action === "status_changed") return "status";
  if (action === "published" || action === "scheduled" || action === "restored") return "publish";
  return "audit";
}

function formatILS(agorot: number | null): string {
  if (agorot === null) return "";
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: agorot % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(agorot / 100);
}

function fullName(first: string | null, last: string | null, email: string | null): string {
  const name = [first, last].filter(Boolean).join(" ").trim();
  return name || email || "Client";
}

export function buildActivityFeed(input: {
  orders: ActivityOrderInput[];
  profiles: ActivityProfileInput[];
  bars: ActivityBarInput[];
  auditLogs: ActivityAuditInput[];
  lowStock: ActivityStockInput[];
  limit?: number;
}): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const order of input.orders) {
    const ref = order.public_order_number ?? `#${order.id.slice(0, 8)}`;
    const total = formatILS(order.total_agorot);
    const parts = [
      `Nouvelle commande ${ref}`,
      order.item_count > 0 ? `${order.item_count} article${order.item_count > 1 ? "s" : ""}` : null,
      total || null,
      order.customer_name || null,
    ].filter(Boolean);
    items.push({
      id: `order-${order.id}`,
      at: order.created_at,
      kind: "order",
      text: parts.join(" — "),
      href: `/admin/orders/${order.id}`,
    });
  }

  for (const profile of input.profiles) {
    const type = profile.account_type === "business" ? "Professionnel" : "Particulier";
    items.push({
      id: `account-${profile.id}`,
      at: profile.created_at,
      kind: "account",
      text: `Nouveau compte — ${fullName(profile.first_name, profile.last_name, profile.email)} — ${type}`,
      href: `/admin/clients/${profile.id}`,
    });
  }

  for (const bar of input.bars) {
    items.push({
      id: `bar-${bar.id}`,
      at: bar.created_at,
      kind: "lead",
      text: `${bar.business_name} a envoyé une demande professionnelle`,
      href: `/admin/bars/${bar.id}`,
    });
  }

  for (const log of input.auditLogs) {
    const actionLabel = AUDIT_ACTION_LABELS[log.action] ?? log.action;
    const entityLabel = ENTITY_LABELS[log.entity_type] ?? log.entity_type;
    const actor = log.actor_name ? ` par ${log.actor_name}` : "";
    items.push({
      id: `audit-${log.id}`,
      at: log.created_at,
      kind: auditKind(log.action),
      text: `${actionLabel} — ${entityLabel}${actor}`,
      href: entityHref(log.entity_type, log.entity_id),
    });
  }

  for (const product of input.lowStock) {
    items.push({
      id: `stock-${product.id}`,
      at: new Date(0).toISOString(),
      kind: "stock",
      text: `Stock faible : ${product.name}`,
      href: `/admin/products/${product.id}`,
    });
  }

  items.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  return items.slice(0, input.limit ?? 15);
}
