"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  Package,
  Grid3X3,
  Tag,
  Image as ImageIcon,
  FileText,
  Star,
  Users,
  Crown,
  MessageSquare,
  Settings,
  Shield,
  History,
  LogOut,
  Menu,
  Store,
  AlertCircle,
  CreditCard,
  CalendarHeart,
  Receipt,
  Sparkles,
  Percent,
  UserPlus,
  PlusCircle,
  Upload,
  LayoutGrid,
  List,
} from "lucide-react";
import type { AdminSession } from "@/lib/admin/auth";
import { signOutAdmin } from "@/app/admin/logout/actions";

interface NavGroup {
  label: string;
  items: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[];
}

const NAV: NavGroup[] = [
  {
    label: "Tableau de bord",
    items: [
      { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
      { href: "/admin/orders", label: "Nouvelles commandes", icon: ShoppingBag },
      { href: "/admin/presence", label: "Présence en ligne", icon: Users },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { href: "/admin/products", label: "Produits", icon: Package },
      { href: "/admin/products/new", label: "Ajouter un produit", icon: PlusCircle },
      { href: "/admin/products/quick-add", label: "Ajout rapide", icon: Sparkles },
      { href: "/admin/categories", label: "Catégories", icon: Grid3X3 },
      { href: "/admin/brands", label: "Marques", icon: Star },
      { href: "/admin/promotions", label: "Promotions", icon: Percent },
      { href: "/admin/products/import", label: "Import / Export", icon: Upload },
      { href: "/admin/products?tab=classification", label: "Règles de classement", icon: Tag },
    ],
  },
  {
    label: "Inventaire",
    items: [{ href: "/admin/inventory", label: "Stocks", icon: Tag }],
  },
  {
    label: "B2B & Pros",
    items: [
      { href: "/admin/clients", label: "Clients inscrits", icon: Users },
      { href: "/admin/bars", label: "Bars & pros", icon: Store },
      { href: "/admin/product-requests", label: "Demandes produits", icon: MessageSquare },
      { href: "/admin/leads", label: "Leads", icon: UserPlus },
      { href: "/admin/members", label: "Membres Club", icon: Crown },
    ],
  },
  {
    label: "Commandes",
    items: [
      { href: "/admin/orders", label: "Commandes", icon: ShoppingBag },
      { href: "/admin/orders/kanban", label: "Vue Kanban", icon: LayoutGrid },
      { href: "/admin/orders/queue", label: "File d'attente", icon: List },
      { href: "/admin/payments", label: "Paiements", icon: CreditCard },
      { href: "/admin/livraisons", label: "Livraisons", icon: Truck },
      { href: "/admin/wolt", label: "Wolt", icon: Store },
    ],
  },
  {
    label: "Clients",
    items: [
      { href: "/admin/verifications", label: "Vérifications identité", icon: Shield },
      { href: "/admin/loyalty", label: "Fidélité", icon: Sparkles },
      { href: "/admin/discounts", label: "Remises", icon: Percent },
      { href: "/admin/reviews", label: "Avis", icon: MessageSquare },
    ],
  },
  {
    label: "Contenu",
    items: [
      { href: "/admin/contenus", label: "Pages", icon: FileText },
      { href: "/admin/couvertures", label: "Hero", icon: ImageIcon },
      { href: "/admin/medias", label: "Médiathèque", icon: ImageIcon },
      { href: "/admin/content", label: "Inspirations", icon: FileText },
      { href: "/admin/homepage", label: "Accueil", icon: LayoutDashboard },
      { href: "/admin/evenements", label: "Mariages & Fêtes", icon: CalendarHeart },
    ],
  },
  {
    label: "Réglages",
    items: [
      { href: "/admin/invoices", label: "Factures", icon: Receipt },
      { href: "/admin/settings", label: "Paramètres", icon: Settings },
      { href: "/admin/users", label: "Utilisateurs", icon: Shield },
      { href: "/admin/roles", label: "Rôles & permissions", icon: Shield },
      { href: "/admin/historique", label: "Historique / Audit", icon: History },
      { href: "/admin/age-verifications", label: "Vérif. 18+", icon: AlertCircle },
    ],
  },
];

export function AdminShell({
  children,
  session,
  unreadNotifications,
}: {
  children: React.ReactNode;
  session: AdminSession;
  unreadNotifications: number;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FBF8F1]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#151411]/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 flex-col border-r border-white/5 bg-[#151411] text-[#F7F0E4] transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-white/5 px-5">
          <span className="font-serif text-lg text-[#C6A15B]">Terminal 3</span>
          <span className="rounded-sm border border-[#C6A15B]/30 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-[#C6A15B]">
            Admin
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {NAV.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="mb-2 px-3 text-[10px] uppercase tracking-widest text-[#71695F]">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between rounded-sm px-3 py-2.5 text-sm transition-colors ${
                        active
                          ? "bg-[#692031] text-[#F7F0E4]"
                          : "text-[#F7F0E4]/80 hover:bg-white/5 hover:text-[#C6A15B]"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </span>
                      {item.badge ? (
                        <span className="rounded-sm bg-[#692031] px-1.5 py-0.5 text-[10px]">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 p-4">
          <div className="mb-3 text-xs text-[#71695F]">
            <p className="text-[#F7F0E4]">{session.email}</p>
            <p className="uppercase tracking-wider">{session.role}</p>
          </div>
          <Link
            href="/"
            className="mb-2 flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-[#F7F0E4]/80 hover:bg-white/5 hover:text-[#C6A15B]"
          >
            <Store className="h-4 w-4" />
            Voir le site
          </Link>
          <form action={signOutAdmin}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm text-[#F7F0E4]/80 hover:bg-white/5 hover:text-[#C6A15B]"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E7DECE] bg-[#FBF8F1] px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-sm border border-[#E7DECE] p-2 text-[#151411] lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-serif text-xl text-[#151411]">Administration</h1>
          </div>
          <div className="flex items-center gap-4">
            {unreadNotifications > 0 && (
              <div className="flex h-8 items-center gap-1.5 rounded-sm border border-[#692031]/20 bg-[#692031]/10 px-2.5 text-xs text-[#692031]">
                <AlertCircle className="h-3.5 w-3.5" />
                {unreadNotifications}
              </div>
            )}
            <Link
              href="/"
              className="hidden rounded-sm border border-[#E7DECE] px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-[#151411] hover:border-[#C6A15B] hover:text-[#C6A15B] sm:block"
            >
              Voir le site
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
