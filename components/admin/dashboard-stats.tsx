"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Package,
  ShoppingBag,
  Users,
  AlertTriangle,
  Camera,
  Clock,
  CheckCircle,
  Truck,
  CreditCard,
  TrendingUp,
  Plus,
  Image as ImageIcon,
  LayoutDashboard,
  Percent,
  Grid3X3,
  ExternalLink,
  FileText,
  RotateCcw,
  History,
} from "lucide-react";
import { formatAgorot } from "@/lib/money";

export interface DashboardStats {
  productsTotal: number;
  productsCount: number;
  productsDraft: number;
  missingPhotosCount: number;
  promotedCount: number;
  outOfStockCount: number;
  ordersTodayCount: number;
  toConfirmCount: number;
  preparingCount: number;
  readyCount: number;
  toDeliverCount: number;
  activePromotionsCount: number;
  clientsTotal: number;
  newClientsCount: number;
  clubMembersCount: number;
  ageChecksPending: number;
  lowStockCount: number;
  paidTodayAgorot: number;
  unpaidTodayAgorot: number;
}

export interface RecentProduct {
  id: string;
  name_fr: string | null;
  status: string | null;
  updated_at: string;
}

export interface RecentActivity {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  actor_user_id: string | null;
  created_at: string;
}

const actionLabels: Record<string, string> = {
  LOGIN: "Connexion",
  LOGOUT: "Déconnexion",
  PRODUCT_CREATED: "Produit créé",
  PRODUCT_UPDATED: "Produit modifié",
  PRODUCT_DELETED: "Produit supprimé",
  PRODUCT_DUPLICATED: "Produit dupliqué",
  PRODUCT_PUBLISHED: "Produit publié",
  PRODUCT_DRAFTED: "Produit mis en brouillon",
  ORDER_STATUS_CHANGED: "Statut commande modifié",
  PROMOTION_CREATED: "Promotion créée",
  PROMOTION_UPDATED: "Promotion modifiée",
  CONTENT_PUBLISHED: "Page publiée",
  CONTENT_UPDATED: "Page modifiée",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function AdminDashboardClient({
  stats,
  recentProducts,
  recentActivity,
}: {
  stats: DashboardStats;
  recentProducts: RecentProduct[];
  recentActivity: RecentActivity[];
}) {
  const primary = [
    { label: "Commandes aujourd'hui", value: stats.ordersTodayCount, href: "/admin/orders", icon: ShoppingBag, color: "bordeaux" },
    { label: "À confirmer", value: stats.toConfirmCount, href: "/admin/orders", icon: Clock, color: "orange" },
    { label: "En préparation", value: stats.preparingCount, href: "/admin/orders", icon: Package, color: "amber" },
    { label: "Prêtes", value: stats.readyCount, href: "/admin/orders", icon: CheckCircle, color: "green" },
    { label: "À livrer", value: stats.toDeliverCount, href: "/admin/livraisons", icon: Truck, color: "blue" },
    { label: "Vérif. 18+", value: stats.ageChecksPending, href: "/admin/age-verifications", icon: AlertTriangle, color: "red" },
  ] as const;

  const catalog = [
    { label: "Total produits", value: stats.productsTotal, href: "/admin/products", icon: Package },
    { label: "Publiés", value: stats.productsCount, href: "/admin/products", icon: CheckCircle },
    { label: "Brouillons", value: stats.productsDraft, href: "/admin/products?status=draft", icon: FileText },
    { label: "En promo", value: stats.promotedCount, href: "/admin/promotions", icon: Percent },
    { label: "Ruptures", value: stats.outOfStockCount, href: "/admin/inventory", icon: AlertTriangle },
    { label: "Photos manquantes", value: stats.missingPhotosCount, href: "/admin/products?missing_photo=1", icon: Camera },
  ] as const;

  const finance = [
    { label: "Encaissé aujourd'hui", value: formatAgorot(stats.paidTodayAgorot), href: "/admin/orders", icon: CreditCard },
    { label: "Reste à encaisser", value: formatAgorot(stats.unpaidTodayAgorot), href: "/admin/orders", icon: CreditCard },
  ] as const;

  const quickActions = [
    { label: "Ajouter un produit", href: "/admin/products/new", icon: Plus, color: "bordeaux" },
    { label: "Ajouter des photos", href: "/admin/medias", icon: ImageIcon, color: "amber" },
    { label: "Modifier l'accueil", href: "/admin/homepage", icon: LayoutDashboard, color: "bordeaux" },
    { label: "Créer une promotion", href: "/admin/promotions/new", icon: Percent, color: "green" },
    { label: "Voir les commandes", href: "/admin/orders", icon: ShoppingBag, color: "bordeaux" },
    { label: "Modifier catégories", href: "/admin/categories", icon: Grid3X3, color: "amber" },
    { label: "Voir le site", href: "/", icon: ExternalLink, color: "bordeaux" },
  ] as const;

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-serif text-3xl text-[#151411]">Vue d&apos;ensemble</h1>
        <p className="mt-1 text-sm text-[#71695F]">Activité du jour et priorités</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {primary.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <section>
        <h2 className="mb-4 font-serif text-lg text-[#151411]">Actions rapides</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <QuickActionCard key={action.label} {...action} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {finance.map((card) => (
          <StatCard key={card.label} {...card} variant="large" />
        ))}
      </section>

      <section>
        <h2 className="mb-4 font-serif text-lg text-[#151411]">Catalogue</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {catalog.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-serif text-lg text-[#151411]">Clients</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Total clients" value={stats.clientsTotal} href="/admin/clients" icon={Users} />
          <StatCard label="Nouveaux (7j)" value={stats.newClientsCount} href="/admin/clients" icon={TrendingUp} />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 font-serif text-lg text-[#151411]">Dernières modifications</h2>
          {recentProducts.length === 0 ? (
            <EmptyState message="Aucun produit modifié récemment." icon={RotateCcw} />
          ) : (
            <ul className="divide-y divide-[#E7DECE] rounded-sm border border-[#E7DECE] bg-white shadow-sm">
              {recentProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-[#151411]">{p.name_fr ?? "Produit sans nom"}</p>
                    <p className="text-xs text-[#71695F]">{formatDate(p.updated_at)}</p>
                  </div>
                  <StatusBadge status={p.status ?? "unknown"} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-4 font-serif text-lg text-[#151411]">Activité récente</h2>
          {recentActivity.length === 0 ? (
            <EmptyState message="Aucune activité enregistrée." icon={History} />
          ) : (
            <ul className="divide-y divide-[#E7DECE] rounded-sm border border-[#E7DECE] bg-white shadow-sm">
              {recentActivity.map((a) => (
                <li key={a.id} className="p-4">
                  <p className="text-sm font-medium text-[#151411]">
                    {actionLabels[a.action] ?? a.action}
                    {a.entity_type && <span className="text-[#71695F]"> · {a.entity_type}</span>}
                  </p>
                  <p className="text-xs text-[#71695F]">{formatDate(a.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
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
}: {
  label: string;
  value: string | number;
  href: string;
  icon: LucideIcon;
  color?: "bordeaux" | "orange" | "amber" | "green" | "blue" | "red";
  variant?: "default" | "large";
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
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-[#71695F]">{label}</span>
        <Icon className={`h-4 w-4 ${color ? colorMap[color] : "text-[#71695F]"}`} />
      </div>
      <p className={`mt-2 font-serif ${variant === "large" ? "text-3xl" : "text-2xl"} ${color ? colorMap[color] : "text-[#151411]"}`}>
        {value}
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
      className={`flex items-center gap-3 rounded-sm px-5 py-4 text-sm font-medium transition-colors ${colorMap[color]}`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-green-100 text-green-800",
    draft: "bg-amber-100 text-amber-800",
    archived: "bg-gray-100 text-gray-800",
  };
  const label = status === "published" ? "Publié" : status === "draft" ? "Brouillon" : status;
  return (
    <span className={`rounded-sm px-2 py-0.5 text-xs font-medium uppercase tracking-wider ${styles[status] ?? "bg-gray-100 text-gray-800"}`}>
      {label}
    </span>
  );
}

function EmptyState({ message, icon: Icon }: { message: string; icon: LucideIcon }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-[#E7DECE] bg-white p-8 text-center">
      <Icon className="h-8 w-8 text-[#71695F]/40" />
      <p className="mt-2 text-sm text-[#71695F]">{message}</p>
    </div>
  );
}
