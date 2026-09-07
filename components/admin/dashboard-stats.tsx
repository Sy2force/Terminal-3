"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ShoppingBag,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  Plus,
  Image as ImageIcon,
  LayoutDashboard,
  Percent,
  History,
  Store,
  PackageCheck,
  RefreshCw,
  Inbox,
} from "lucide-react";
import { orderStatusLabel } from "@/lib/order-status-labels";
import type { ActivityItem, ActivityKind } from "@/lib/activity-feed";
import { DashboardOrderActions } from "@/components/admin/dashboard-order-actions";

export type DashboardPeriod = "jour" | "7j" | "30j";

export interface DashboardStats {
  onlineTotal: number;
  onlineUsers: number;
  newOrdersCount: number;
  toPrepareCount: number;
  readyCount: number;
  alertsCount: number;
  catalogTotal: number;
  catalogPublished: number;
  catalogLowStock: number;
  catalogMissingPhotos: number;
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
  accountType: string | null;
  verificationStatus: string | null;
  createdAt: string;
}

const PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: "jour", label: "Aujourd'hui" },
  { value: "7j", label: "7 jours" },
  { value: "30j", label: "30 jours" },
];

const ACTIVITY_ICONS: Record<ActivityKind, LucideIcon> = {
  order: ShoppingBag,
  account: Users,
  lead: Store,
  status: Clock,
  publish: LayoutDashboard,
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

export function AdminDashboardClient({
  period,
  stats,
  activity,
  recentOrders,
  newClients,
  refreshedAt,
}: {
  period: DashboardPeriod;
  stats: DashboardStats;
  activity: ActivityItem[];
  recentOrders: DashboardOrder[];
  newClients: DashboardClient[];
  refreshedAt: string;
}) {
  const router = useRouter();

  const cards = [
    { label: "Nouvelles commandes", value: stats.newOrdersCount, href: "/admin/orders", icon: ShoppingBag, color: "bordeaux" as const },
    { label: "À préparer", value: stats.toPrepareCount, href: "/admin/orders?status=confirmed", icon: PackageCheck, color: "amber" as const },
    { label: "Prêtes à récupérer", value: stats.readyCount, href: "/admin/orders?status=ready", icon: CheckCircle, color: "green" as const },
    { label: "Alertes", value: stats.alertsCount, href: "/admin/inventory", icon: AlertTriangle, color: "red" as const },
  ];

  const quickActions = [
    { label: "Ajouter un produit", href: "/admin/products/new", icon: Plus },
    { label: "Ajouter des photos", href: "/admin/medias", icon: ImageIcon },
    { label: "Modifier l'accueil", href: "/admin/couvertures", icon: LayoutDashboard },
    { label: "Créer une promotion", href: "/admin/promotions/new", icon: Percent },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-[#151411]">Vue d&apos;ensemble</h1>
          <p className="mt-0.5 text-xs text-[#71695F]">
            Dernière mise à jour : {formatTime(refreshedAt)}
            {" · "}
            <Link href="/admin/presence" className="text-[#692031] hover:underline">
              En ligne : {stats.onlineTotal} ({stats.onlineUsers} connecté{stats.onlineUsers > 1 ? "s" : ""})
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <nav aria-label="Période" className="flex gap-1 rounded-sm border border-[#E7DECE] bg-white p-1">
            {PERIOD_OPTIONS.map((option) => (
              <Link
                key={option.value}
                href={`/admin?periode=${option.value}`}
                aria-current={period === option.value ? "true" : undefined}
                className={`flex min-h-[36px] items-center rounded-sm px-3 text-xs font-medium transition-colors ${
                  period === option.value
                    ? "bg-[#692031] text-[#F7F0E4]"
                    : "text-[#71695F] hover:text-[#151411]"
                }`}
              >
                {option.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="flex min-h-[38px] items-center gap-1.5 rounded-sm border border-[#E7DECE] bg-white px-3 text-xs font-medium text-[#71695F] hover:border-[#C6A15B] hover:text-[#151411]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Actualiser
          </button>
          <Link
            href="/admin/products/new"
            className="flex min-h-[38px] items-center gap-1.5 rounded-sm bg-[#692031] px-4 text-xs font-medium text-[#F7F0E4] hover:bg-[#551525]"
          >
            <Plus className="h-4 w-4" />
            Ajouter un produit
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-sm border border-[#E7DECE] bg-white shadow-sm">
          <header className="flex items-center justify-between border-b border-[#E7DECE] px-4 py-3">
            <h2 className="font-serif text-base text-[#151411]">Commandes récentes</h2>
            <Link href="/admin/orders" className="text-xs text-[#692031] hover:underline">
              Tout voir
            </Link>
          </header>
          {recentOrders.length === 0 ? (
            <EmptyState message="Aucune commande pour le moment." href="/admin/orders" linkLabel="Voir les commandes" />
          ) : (
            <ul className="divide-y divide-[#E7DECE]">
              {recentOrders.map((order) => (
                <li key={order.id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#151411]">
                        {order.ref}
                        <span className="ml-2 text-xs font-normal text-[#71695F]">
                          {formatTime(order.createdAt)}
                        </span>
                      </p>
                      <p className="truncate text-xs text-[#71695F]">
                        {order.customerName ?? "Client"}
                        {order.items.length > 0 &&
                          ` · ${order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <AgeBadge status={order.ageStatus} />
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                  <div className="mt-2">
                    <DashboardOrderActions orderId={order.id} status={order.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-sm border border-[#E7DECE] bg-white shadow-sm">
          <header className="flex items-center justify-between border-b border-[#E7DECE] px-4 py-3">
            <h2 className="font-serif text-base text-[#151411]">Activité récente</h2>
            <Link href="/admin/historique" className="text-xs text-[#692031] hover:underline">
              Historique
            </Link>
          </header>
          {activity.length === 0 ? (
            <EmptyState message="Aucune activité récente." href="/admin/historique" linkLabel="Voir l'historique" />
          ) : (
            <ul className="divide-y divide-[#E7DECE]">
              {activity.slice(0, 8).map((item) => {
                const Icon = ACTIVITY_ICONS[item.kind];
                return (
                  <li key={item.id} className="flex items-start gap-3 px-4 py-2.5">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#C6A15B]" aria-hidden />
                    <p className="min-w-0 flex-1 break-words text-sm text-[#151411]">{item.text}</p>
                    <span className="shrink-0 text-xs text-[#71695F]">
                      {item.at > new Date(0).toISOString() ? formatTime(item.at) : ""}
                    </span>
                    {item.href && (
                      <Link href={item.href} className="shrink-0 text-xs text-[#692031] hover:underline">
                        Ouvrir
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-sm border border-[#E7DECE] bg-white p-4 shadow-sm">
          <h2 className="font-serif text-base text-[#151411]">État du catalogue</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            <Metric label="Produits" value={stats.catalogTotal} href="/admin/products" />
            <Metric label="Publiés" value={stats.catalogPublished} href="/admin/products" />
            <Metric label="Stock faible" value={stats.catalogLowStock} href="/admin/inventory" alert />
            <Metric label="Photos manquantes" value={stats.catalogMissingPhotos} href="/admin/products?missing_photo=1" alert />
          </dl>
        </section>

        <section className="rounded-sm border border-[#E7DECE] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-base text-[#151411]">Nouveaux clients</h2>
            <Link href="/admin/clients" className="text-xs text-[#692031] hover:underline">
              Tout voir
            </Link>
          </div>
          {newClients.length === 0 ? (
            <p className="mt-3 text-sm text-[#71695F]">Aucun nouveau compte.</p>
          ) : (
            <ul className="mt-3 divide-y divide-[#E7DECE]">
              {newClients.slice(0, 5).map((client) => (
                <li key={client.id} className="flex items-center justify-between gap-2 py-2">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="block truncate text-sm font-medium text-[#151411] hover:text-[#692031]"
                    >
                      {client.name}
                    </Link>
                    <p className="truncate text-xs text-[#71695F]">
                      {client.accountType === "business" ? "Professionnel" : "Particulier"}
                    </p>
                  </div>
                  <VerificationBadge status={client.verificationStatus} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-sm border border-[#E7DECE] bg-white p-4 shadow-sm">
          <h2 className="font-serif text-base text-[#151411]">Actions rapides</h2>
          <div className="mt-3 grid gap-2">
            {quickActions.map((action) => (
              <QuickAction key={action.label} {...action} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value, href, alert }: { label: string; value: number; href: string; alert?: boolean }) {
  return (
    <Link href={href} className="rounded-sm p-2 hover:bg-[#FBF8F1]">
      <dt className="text-xs text-[#71695F]">{label}</dt>
      <dd className={`font-serif text-xl ${alert && value > 0 ? "text-[#9B3444]" : "text-[#151411]"}`}>
        {value}
      </dd>
    </Link>
  );
}

function StatCard({
  label,
  value,
  href,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  href: string;
  icon: LucideIcon;
  color: "bordeaux" | "amber" | "green" | "red";
}) {
  const colorMap: Record<string, string> = {
    bordeaux: "text-[#692031]",
    amber: "text-[#B97832]",
    green: "text-[#56705A]",
    red: "text-[#9B3444]",
  };
  return (
    <Link
      href={href}
      className="group rounded-sm border border-[#E7DECE] bg-white p-4 shadow-sm transition-all hover:border-[#C6A15B] hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-[#71695F]">{label}</span>
        <Icon className={`h-4 w-4 shrink-0 ${colorMap[color]}`} />
      </div>
      <p className={`mt-1 font-serif text-2xl ${value > 0 ? colorMap[color] : "text-[#151411]"}`}>
        {value}
      </p>
    </Link>
  );
}

function QuickAction({
  label,
  href,
  icon: Icon,
}: {
  label: string;
  href: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-[44px] items-center gap-2 rounded-sm border border-[#E7DECE] px-3 text-sm font-medium text-[#151411] transition-colors hover:border-[#C6A15B] hover:bg-[#FBF8F1]"
    >
      <Icon className="h-4 w-4 shrink-0 text-[#692031]" />
      {label}
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
    return <span className="rounded-sm bg-green-100 px-2 py-0.5 text-xs font-medium text-green-900">18+</span>;
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

function EmptyState({ message, href, linkLabel }: { message: string; href: string; linkLabel: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
      <Inbox className="h-6 w-6 text-[#71695F]/40" />
      <p className="mt-2 text-sm text-[#71695F]">{message}</p>
      <Link href={href} className="mt-1 text-xs text-[#692031] hover:underline">
        {linkLabel}
      </Link>
    </div>
  );
}
