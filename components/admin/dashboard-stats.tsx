import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Package,
  ShoppingBag,
  Tag,
  Users,
  AlertTriangle,
  Camera,
  Clock,
  CheckCircle,
  Truck,
  CreditCard,
  Star,
  TrendingUp,
} from "lucide-react";
import { formatAgorot } from "@/lib/money";

export interface DashboardStats {
  productsCount: number;
  ordersTodayCount: number;
  activePromotionsCount: number;
  clubMembersCount: number;
  preparingCount: number;
  readyCount: number;
  ageChecksPending: number;
  missingPhotosCount: number;
  toConfirmCount: number;
  toDeliverCount: number;
  paidTodayAgorot: number;
  unpaidTodayAgorot: number;
  lowStockCount: number;
  outOfStockCount: number;
  newClientsCount: number;
  pendingVerificationsCount: number;
}

export function AdminDashboardClient({ stats }: { stats: DashboardStats }) {
  const primary = [
    { label: "Commandes aujourd\u0027hui", value: stats.ordersTodayCount, href: "/admin/orders", icon: ShoppingBag, color: "bordeaux" },
    { label: "À confirmer", value: stats.toConfirmCount, href: "/admin/orders", icon: Clock, color: "orange" },
    { label: "En préparation", value: stats.preparingCount, href: "/admin/orders", icon: Package, color: "amber" },
    { label: "Prêtes", value: stats.readyCount, href: "/admin/orders", icon: CheckCircle, color: "green" },
    { label: "À livrer", value: stats.toDeliverCount, href: "/admin/livraisons", icon: Truck, color: "blue" },
    { label: "Vérif. 18+", value: stats.ageChecksPending, href: "/admin/age-verifications", icon: AlertTriangle, color: "red" },
  ] as const;

  const finance = [
    { label: "Encaissé aujourd'hui", value: formatAgorot(stats.paidTodayAgorot), href: "/admin/orders", icon: CreditCard },
    { label: "Reste à encaisser", value: formatAgorot(stats.unpaidTodayAgorot), href: "/admin/orders", icon: CreditCard },
  ] as const;

  const customers = [
    { label: "Nouveaux clients (7j)", value: stats.newClientsCount, href: "/admin/clients", icon: Users },
    { label: "Comptes à vérifier", value: stats.pendingVerificationsCount, href: "/admin/verifications", icon: AlertTriangle },
  ] as const;

  const catalog = [
    { label: "Produits publiés", value: stats.productsCount, href: "/admin/products", icon: Package },
    { label: "Promotions actives", value: stats.activePromotionsCount, href: "/admin/promotions", icon: Tag },
    { label: "Membres Club", value: stats.clubMembersCount, href: "/admin/members", icon: Users },
    { label: "Stocks faibles", value: stats.lowStockCount, href: "/admin/inventory", icon: TrendingUp },
    { label: "Ruptures", value: stats.outOfStockCount, href: "/admin/inventory", icon: AlertTriangle },
    { label: "Photos manquantes", value: stats.missingPhotosCount, href: "/admin/products", icon: Camera },
  ] as const;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-serif text-3xl text-[#151411]">Vue d&apos;ensemble</h1>
        <p className="mt-1 text-sm text-[#71695F]">Activité du jour et priorités</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {primary.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {finance.map((card) => (
          <StatCard key={card.label} {...card} variant="large" />
        ))}
      </section>

      <section>
        <h2 className="mb-4 font-serif text-lg text-[#151411]">Clients</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {customers.map((card) => (
            <StatCard key={card.label} {...card} variant="large" />
          ))}
        </div>
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
        <h2 className="mb-4 font-serif text-lg text-[#151411]">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <QuickLink href="/admin/products/new" label="Nouveau produit" icon={Package} />
          <QuickLink href="/admin/categories/new" label="Nouvelle catégorie" icon={Star} />
          <QuickLink href="/admin/promotions/new" label="Nouvelle promotion" icon={Tag} />
          <QuickLink href="/admin/contenus" label="Modifier une page" icon={Camera} />
          <QuickLink href="/admin/store" label="Paramètres boutique" icon={CheckCircle} />
          <QuickLink href="/admin/wolt" label="Connecter Wolt" icon={Truck} />
        </div>
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

function QuickLink({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-sm border border-[#E7DECE] bg-white px-4 py-2.5 text-sm font-medium text-[#151411] shadow-sm transition-all hover:border-[#692031] hover:bg-[#692031] hover:text-[#F7F0E4]"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
