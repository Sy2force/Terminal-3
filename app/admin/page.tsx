import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
  Package,
  ShoppingBag,
  Tag,
  Users,
  AlertTriangle,
  Camera,
  Clock,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();
  const supabase = await createClient();

  const todayStart = new Date().toISOString().slice(0, 10);

  const [
    { count: productsCount },
    { count: ordersTodayCount },
    { count: activePromotionsCount },
    { count: clubMembersCount },
    { count: preparingCount },
    { count: readyCount },
    { count: ageChecksPending },
    { count: missingPhotosCount },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart),
    supabase
      .from("promotions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("club_memberships")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "confirmed"),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "ready"),
    supabase
      .from("age_verifications")
      .select("*", { count: "exact", head: true })
      .eq("status", "PENDING"),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .not("id", "in", `(select product_id from product_media where kind = 'COVER')`),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl text-ivory">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-grey">
          Connecté en tant que {session.email ?? session.userId} · {session.role}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          label="Produits publiés"
          value={productsCount ?? 0}
          href="/admin/products"
          icon={Package}
        />
        <DashboardCard
          label="Commandes aujourd'hui"
          value={ordersTodayCount ?? 0}
          href="/admin/orders"
          icon={ShoppingBag}
        />
        <DashboardCard
          label="Promotions actives"
          value={activePromotionsCount ?? 0}
          href="/admin/promotions"
          icon={Tag}
        />
        <DashboardCard
          label="Membres du club"
          value={clubMembersCount ?? 0}
          href="/admin/members"
          icon={Users}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          label="En préparation"
          value={preparingCount ?? 0}
          href="/admin/orders"
          icon={Clock}
          accent="champagne"
        />
        <DashboardCard
          label="Prêtes"
          value={readyCount ?? 0}
          href="/admin/orders"
          icon={Package}
          accent="champagne"
        />
        <DashboardCard
          label="Vérif. 18+ en attente"
          value={ageChecksPending ?? 0}
          href="/admin/age-verifications"
          icon={AlertTriangle}
          accent="amber"
        />
        <DashboardCard
          label="Photos manquantes"
          value={missingPhotosCount ?? 0}
          href="/admin/products"
          icon={Camera}
          accent="amber"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink href="/admin/products" label="Nouveau produit" />
        <QuickLink href="/admin/categories" label="Nouvelle catégorie" />
        <QuickLink href="/admin/promotions" label="Nouvelle promotion" />
        <QuickLink href="/admin/homepage" label="Modifier l'accueil" />
        <QuickLink href="/admin/content" label="Nouvel article" />
        <QuickLink href="/admin/store" label="Paramètres boutique" />
        <QuickLink href="/admin/members" label="Gérer les membres" />
      </div>
    </div>
  );
}

function DashboardCard({
  label,
  value,
  href,
  icon: Icon,
  accent = "default",
}: {
  label: string;
  value: number;
  href: string;
  icon: typeof Package;
  accent?: "default" | "champagne" | "amber";
}) {
  const accentClass =
    accent === "amber"
      ? "text-amber-400"
      : accent === "champagne"
        ? "text-champagne"
        : "text-ivory";

  return (
    <Link
      href={href}
      className="flex flex-col rounded-sm border border-white/5 bg-graphite p-5 transition-colors hover:border-champagne/30"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-grey">{label}</span>
        <Icon className={`h-4 w-4 ${accentClass}`} />
      </div>
      <span className={`mt-2 font-serif text-3xl ${accentClass}`}>{value}</span>
    </Link>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-champagne/40 px-6 py-3 text-center text-sm font-medium text-champagne transition-colors hover:bg-champagne hover:text-obsidian"
    >
      {label}
    </Link>
  );
}
