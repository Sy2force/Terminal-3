"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ShoppingBag,
  Users,
  UserCheck,
  UserPlus,
  AlertTriangle,
  Clock,
  CreditCard,
  Plus,
  Image as ImageIcon,
  LayoutDashboard,
  Percent,
  Grid3X3,
  ExternalLink,
  FileText,
  History,
  Activity,
  Store,
  PackageCheck,
} from "lucide-react";
import { formatAgorot } from "@/lib/money";
import { orderStatusLabel } from "@/lib/order-status-labels";
import type { ActivityItem, ActivityKind } from "@/lib/activity-feed";
import type { PresenceOnlineUser } from "@/lib/data/presence";
import { DashboardOrderActions } from "@/components/admin/dashboard-order-actions";

export type DashboardPeriod = "jour" | "7j" | "30j";

export interface DashboardStats {
  onlineVisitors: number;
  onlineUsers: number;
  newAccounts: number;
  ordersInPeriod: number;
  toConfirmCount: number;
  inPrepCount: number;
  readyCount: number;
  stockAlertsCount: number;
  newBarLeadsCount: number;
  ageChecksPending: number;
  paidPeriodAgorot: number;
  unpaidPeriodAgorot: number;
}

export interface DashboardOrderItem {
  name: string;
  variant: string | null;
  quantity: number;
}

export interface DashboardOrder {
  id: string;
  ref: string;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  totalAgorot: number | null;
  status: string;
  createdAt: string;
  items: DashboardOrderItem[];
  ageStatus: "confirmed" | "pending" | "none";
}

export interface DashboardClient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  accountType: string | null;
  verificationStatus: string | null;
  orderCount: number;
  lastSeenAt: string | null;
  createdAt: string;
}

const PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: "jour", label: "Aujourd'hui" },
  { value: "7j", label: "7 jours" },
  { value: "30j", label: "30 jours" },
];

const ACTIVITY_ICONS: Record<ActivityKind, LucideIcon> = {
  order: ShoppingBag,
  account: UserPlus,
  lead: Store,
  status: Clock,
  publish: FileText,
  stock: AlertTriangle,
  audit: History,
};

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jerusalem",
  }).format(new Date(iso));
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jerusalem",
  }).format(new Date(iso));
}

export function AdminDashboardClient({
  period,
  stats,
  activity,
  recentOrders,
  newClients,
  onlineUsers,
}: {
  period: DashboardPeriod;
  stats: DashboardStats;
  activity: ActivityItem[];
  recentOrders: DashboardOrder[];
  newClients: DashboardClient[];
  onlineUsers: PresenceOnlineUser[];
}) {
  const periodLabel = PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? "Aujourd'hui";

  const priority = [
    { label: "Visiteurs en ligne", value: stats.onlineVisitors + stats.onlineUsers, href: "/admin/presence", icon: Activity, color: "blue" as const },
    { label: "Clients connectés", value: stats.onlineUsers, href: "/admin/presence", icon: UserCheck, color: "green" as const },
    { label: `Nouveaux comptes (${periodLabel.toLowerCase()})`, value: stats.newAccounts, href: "/admin/clients", icon: UserPlus, color: "bordeaux" as const },
    { label: `Commandes (${periodLabel.toLowerCase()})`, value: stats.ordersInPeriod, href: "/admin/orders", icon: ShoppingBag, color: "bordeaux" as const },
    { label: "À confirmer", value: stats.toConfirmCount, href: "/admin/orders?status=submitted", icon: Clock, color: "orange" as const },
    { label: "En préparation / prêtes", value: stats.inPrepCount + stats.readyCount, href: "/admin/orders", icon: PackageCheck, color: "amber" as const },
    { label: "Alertes stock", value: stats.stockAlertsCount, href: "/admin/inventory", icon: AlertTriangle, color: "red" as const },
    { label: "Prospects pro", value: stats.newBarLeadsCount, href: "/admin/bars", icon: Store, color: "green" as const },
  ];

  const quickActions = [
    { label: "Ajouter un produit", href: "/admin/products/new", icon: Plus, color: "bordeaux" as const },
    { label: "Ajouter des photos", href: "/admin/medias", icon: ImageIcon, color: "amber" as const },
    { label: "Modifier l'accueil", href: "/admin/homepage", icon: LayoutDashboard, color: "bordeaux" as const },
    { label: "Créer une promotion", href: "/admin/promotions/new", icon: Percent, color: "green" as const },
    { label: "Voir les commandes", href: "/admin/orders", icon: ShoppingBag, color: "bordeaux" as const },
    { label: "Modifier les catégories", href: "/admin/categories", icon: Grid3X3, color: "amber" as const },
    { label: "Voir la boutique", href: "/", icon: ExternalLink, color: "bordeaux" as const },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-[#151411] sm:text-3xl">Tableau de bord</h1>
          <p className="mt-1 text-sm text-[#71695F]">Vue en direct de la boutique</p>
        </div>
        <nav aria-label="Période" className="flex gap-1 rounded-sm border border-[#E7DECE] bg-white p-1">
          {PERIOD_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={`/admin?periode=${option.value}`}
              aria-current={period === option.value ? "true" : undefined}
              className={`rounded-sm px-3 py-2 text-xs font-medium min-h-[36px] flex items-center transition-colors ${
                period === option.value
                  ? "bg-[#692031] text-[#F7F0E4]"
                  : "text-[#71695F] hover:text-[#151411]"
              }`}
            >
              {option.label}
            </Link>
          ))}
        </nav>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {priority.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <section>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {quickActions.map((action) => (
            <QuickActionCard key={action.label} {...action} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section>
          <h2 className="mb-3 font-serif text-lg text-[#151411]">Activité en direct</h2>
          {activity.length === 0 ? (
            <EmptyState message="Aucune activité récente." icon={History} />
          ) : (
            <ul className="divide-y divide-[#E7DECE] rounded-sm border border-[#E7DECE] bg-white shadow-sm">
              {activity.map((item) => {
                const Icon = ACTIVITY_ICONS[item.kind];
                return (
                  <li key={item.id} className="flex items-start gap-3 p-3">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#C6A15B]" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm text-[#151411]">{item.text}</p>
                      <p className="text-xs text-[#71695F]">
                        {item.at > new Date(0).toISOString() ? formatTime(item.at) : ""}
                      </p>
                    </div>
                    {item.href && (
                      <Link
                        href={item.href}
                        className="shrink-0 text-xs text-[#692031] hover:underline"
                      >
                        Ouvrir
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-serif text-lg text-[#151411]">Clients connectés</h2>
          {onlineUsers.length === 0 ? (
            <EmptyState message="Aucun client connecté actuellement." icon={UserCheck} />
          ) : (
            <ul className="divide-y divide-[#E7DECE] rounded-sm border border-[#E7DECE] bg-white shadow-sm">
              {onlineUsers.map((user) => (
                <li key={user.userId} className="flex flex-wrap items-center justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#151411]">{user.displayName}</p>
                    <p className="truncate text-xs text-[#71695F]">
                      {user.email ?? "—"} · {user.accountType === "business" ? "Professionnel" : "Particulier"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#71695F]">Vu à {formatTime(user.lastSeenAt)}</span>
                    <Link href={`/admin/clients/${user.userId}`} className="text-xs text-[#692031] hover:underline">
                      Fiche
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section>
        <h2 className="mb-3 font-serif text-lg text-[#151411]">Commandes récentes</h2>
        {recentOrders.length === 0 ? (
          <EmptyState message="Aucune commande pour le moment." icon={ShoppingBag} />
        ) : (
          <ul className="space-y-3">
            {recentOrders.map((order) => (
              <li
                key={order.id}
                className="rounded-sm border border-[#E7DECE] bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-[#151411]">
                      {order.ref}
                      <span className="ml-2 text-xs font-normal text-[#71695F]">
                        {formatDateTime(order.createdAt)}
                      </span>
                    </p>
                    <p className="mt-0.5 text-sm text-[#151411]">
                      {order.customerName ?? "Client"}
                      {order.customerEmail && (
                        <span className="text-[#71695F]"> — {order.customerEmail}</span>
                      )}
                      {order.customerPhone && (
                        <span className="text-[#71695F]"> — <bdi dir="ltr">{order.customerPhone}</bdi></span>
                      )}
                    </p>
                    {order.items.length > 0 && (
                      <p className="mt-1 text-xs text-[#71695F]">
                        {order.items
                          .map((i) => `${i.quantity}× ${i.name}${i.variant ? ` (${i.variant})` : ""}`)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <bdi dir="ltr" className="font-serif text-lg text-[#692031]">
                      {formatAgorot(order.totalAgorot)}
                    </bdi>
                    <div className="flex items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                      <AgeBadge status={order.ageStatus} />
                    </div>
                  </div>
                </div>
                <div className="mt-3 border-t border-[#E7DECE] pt-3">
                  <DashboardOrderActions orderId={order.id} status={order.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-serif text-lg text-[#151411]">Nouveaux clients</h2>
        {newClients.length === 0 ? (
          <EmptyState message="Aucun nouveau compte récemment." icon={Users} />
        ) : (
          <ul className="divide-y divide-[#E7DECE] rounded-sm border border-[#E7DECE] bg-white shadow-sm">
            {newClients.map((client) => (
              <li key={client.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#151411]">{client.name}</p>
                  <p className="truncate text-xs text-[#71695F]">
                    {client.email ?? "—"}
                    {client.phone && <> · <bdi dir="ltr">{client.phone}</bdi></>}
                    {" · "}
                    {client.accountType === "business" ? "Professionnel" : "Particulier"}
                  </p>
                  <p className="mt-0.5 text-xs text-[#71695F]">
                    Inscrit le {formatDateTime(client.createdAt)}
                    {client.lastSeenAt && <> · Dernière connexion {formatDateTime(client.lastSeenAt)}</>}
                    {" · "}{client.orderCount} commande{client.orderCount > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <VerificationBadge status={client.verificationStatus} />
                  <Link
                    href={`/admin/clients/${client.id}`}
                    className="rounded-sm border border-[#E7DECE] px-3 py-1.5 text-xs font-medium text-[#151411] hover:border-[#C6A15B]"
                  >
                    Fiche
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label={`Encaissé (${periodLabel.toLowerCase()})`}
          value={formatAgorot(stats.paidPeriodAgorot)}
          href="/admin/orders"
          icon={CreditCard}
          variant="large"
          isCurrency
        />
        <StatCard
          label={`Reste à encaisser (${periodLabel.toLowerCase()})`}
          value={formatAgorot(stats.unpaidPeriodAgorot)}
          href="/admin/orders"
          icon={CreditCard}
          variant="large"
          isCurrency
        />
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  icon: Icon,
  color,
  variant = "default",
  isCurrency = false,
}: {
  label: string;
  value: string | number;
  href: string;
  icon: LucideIcon;
  color?: "bordeaux" | "orange" | "amber" | "green" | "blue" | "red";
  variant?: "default" | "large";
  isCurrency?: boolean;
}) {
  const colorMap: Record<string, string> = {
    bordeaux: "text-[#692031]",
    orange: "text-[#B97832]",
    amber: "text-[#C6A15B]",
    green: "text-[#56705A]",
    blue: "text-[#3F6170]",
    red: "text-[#9B3444]",
  };

  return (
    <Link
      href={href}
      className={`group rounded-sm border border-[#E7DECE] bg-white p-4 shadow-sm transition-all hover:border-[#C6A15B] hover:shadow-md ${
        variant === "large" ? "p-6" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-[#71695F]">{label}</span>
        <Icon className={`h-4 w-4 shrink-0 ${color ? colorMap[color] : "text-[#71695F]"}`} />
      </div>
      <p className={`mt-2 font-serif ${variant === "large" ? "text-3xl" : "text-2xl"} ${color ? colorMap[color] : "text-[#151411]"}`}>
        {isCurrency ? <bdi dir="ltr">{value}</bdi> : value}
      </p>
    </Link>
  );
}

function QuickActionCard({
  label,
  href,
  icon: Icon,
  color,
}: {
  label: string;
  href: string;
  icon: LucideIcon;
  color: "bordeaux" | "amber" | "green";
}) {
  const colorMap = {
    bordeaux: "bg-[#692031] text-[#F7F0E4] hover:bg-[#7D263A]",
    amber: "bg-[#C6A15B] text-[#151411] hover:bg-[#D9B87A]",
    green: "bg-[#56705A] text-[#F7F0E4] hover:bg-[#6A8568]",
  };

  return (
    <Link
      href={href}
      className={`flex min-h-[44px] items-center gap-2 rounded-sm px-4 py-3 text-xs font-medium transition-colors ${colorMap[color]}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="leading-tight">{label}</span>
    </Link>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    submitted: "bg-amber-100 text-amber-900",
    received: "bg-amber-100 text-amber-900",
    reviewing: "bg-amber-100 text-amber-900",
    confirmed: "bg-blue-100 text-blue-900",
    accepted: "bg-blue-100 text-blue-900",
    preparing: "bg-blue-100 text-blue-900",
    ready: "bg-green-100 text-green-900",
    completed: "bg-green-100 text-green-900",
    collected: "bg-green-100 text-green-900",
    cancelled: "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`rounded-sm px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-700"}`}>
      {orderStatusLabel(status)}
    </span>
  );
}

function AgeBadge({ status }: { status: "confirmed" | "pending" | "none" }) {
  if (status === "confirmed") {
    return <span className="rounded-sm bg-green-100 px-2 py-0.5 text-xs font-medium text-green-900">18+ confirmé</span>;
  }
  if (status === "pending") {
    return <span className="rounded-sm bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">18+ à vérifier</span>;
  }
  return null;
}

function VerificationBadge({ status }: { status: string | null }) {
  if (status === "verified") {
    return <span className="rounded-sm bg-green-100 px-2 py-0.5 text-xs font-medium text-green-900">18+ confirmé</span>;
  }
  return <span className="rounded-sm bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">18+ à vérifier</span>;
}

function EmptyState({ message, icon: Icon }: { message: string; icon: LucideIcon }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-[#E7DECE] bg-white p-8 text-center">
      <Icon className="h-8 w-8 text-[#71695F]/40" />
      <p className="mt-2 text-sm text-[#71695F]">{message}</p>
    </div>
  );
}
