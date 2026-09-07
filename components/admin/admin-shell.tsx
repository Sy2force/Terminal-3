"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Grid3X3,
  Star,
  Percent,
  Upload,
  Image as ImageIcon,
  FileText,
  Settings,
  LogOut,
  Menu,
  Store,
  ChevronDown,
  Search,
  User,
  Bell,
} from "lucide-react";
import type { AdminSession } from "@/lib/admin/auth";
import { signOutAdmin } from "@/app/admin/logout/actions";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: "Vue d'ensemble",
    items: [
      { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
    ],
  },
  {
    label: "Commandes",
    items: [
      { href: "/admin/orders", label: "Toutes les commandes", icon: ShoppingBag },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { href: "/admin/products", label: "Produits", icon: Package },
      { href: "/admin/categories", label: "Catégories", icon: Grid3X3 },
      { href: "/admin/inventory", label: "Stocks", icon: Package },
      { href: "/admin/promotions", label: "Promotions", icon: Percent },
      { href: "/admin/brands", label: "Marques", icon: Star },
      { href: "/admin/products/import", label: "Import / Export", icon: Upload },
    ],
  },
  {
    label: "Clients",
    items: [
      { href: "/admin/clients", label: "Particuliers", icon: User },
      { href: "/admin/bars", label: "Bars et leads", icon: Store },
      { href: "/admin/product-requests", label: "Demandes produits", icon: FileText },
    ],
  },
  {
    label: "Contenu",
    items: [
      { href: "/admin/contenus", label: "Pages du site", icon: FileText },
      { href: "/admin/medias", label: "Photos et médias", icon: ImageIcon },
      { href: "/admin/couvertures", label: "Accueil", icon: LayoutDashboard },
      { href: "/admin/homepage", label: "Bannières", icon: ImageIcon },
      { href: "/admin/evenements", label: "Événements", icon: FileText },
    ],
  },
  {
    label: "Réglages",
    items: [
      { href: "/admin/store", label: "Magasin", icon: Store },
      { href: "/admin/settings", label: "Horaires & WhatsApp", icon: Settings },
      { href: "/admin/wolt", label: "Wolt", icon: Store },
      { href: "/admin/users", label: "Utilisateurs", icon: User },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

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
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NAV.map((g) => [g.label, true]))
  );

  const pageTitle = NAV.flatMap((g) => g.items).find((i) => isActive(pathname, i.href))?.label || "Administration";

  return (
    <div className="flex min-h-screen bg-fond-papier text-noir-profond">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-noir-profond/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 flex-col border-r border-[#2A2620] bg-[#15130F] transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-[#2A2620] px-5">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-full bg-[#F7F0E4] p-1">
              <Image
                src="/images/terminal-3/brand/logo/terminal-3-logo-sombre-01.png"
                alt="Terminal 3"
                fill
                sizes="40px"
                className="object-contain p-0.5"
              />
            </div>
            <div>
              <p className="font-serif text-base leading-tight text-[#F7F0E4]">Terminal 3</p>
              <p className="text-[10px] uppercase tracking-wider text-[#8E8678]">Administration</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV.map((group) => {
            const open = expanded[group.label];
            const activeInGroup = group.items.some((i) => isActive(pathname, i.href));
            return (
              <div key={group.label} className="mb-3">
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((s) => ({ ...s, [group.label]: !s[group.label] }))
                  }
                  className={`flex w-full items-center justify-between rounded-sm px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    activeInGroup ? "text-[#C6A15B]" : "text-[#8E8678] hover:text-[#F7F0E4]"
                  }`}
                  aria-expanded={open}
                >
                  {group.label}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
                {open && (
                  <div className="mt-1 space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center justify-between rounded-sm px-3 py-2.5 text-sm transition-colors ${
                            active
                              ? "bg-[#C6A15B]/15 font-medium text-[#F7F0E4]"
                              : "text-[#B8B0A2] hover:bg-[#23201A] hover:text-[#F7F0E4]"
                          }`}
                          aria-current={active ? "page" : undefined}
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="h-4 w-4 shrink-0" />
                            {item.label}
                          </span>
                          {item.badge ? (
                            <span className="rounded-sm bg-bordeaux-principal px-1.5 py-0.5 text-[10px] text-creme">
                              {item.badge}
                            </span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-[#2A2620] p-4">
          <p className="px-3 text-sm text-[#F7F0E4]">{session.email}</p>
          <p className="mb-3 px-3 text-[10px] uppercase tracking-wider text-[#8E8678]">{session.role}</p>
          <div className="space-y-1">
            <form action={signOutAdmin}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm text-[#B8B0A2] hover:bg-[#23201A] hover:text-[#E8849C]"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-beige-fonce bg-creme/90 px-4 backdrop-blur-sm lg:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-sm border border-beige-fonce p-2 text-noir-profond lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-serif text-xl text-noir-profond">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center rounded-sm border border-beige-fonce bg-white px-3 py-1.5 md:flex">
              <Search className="h-4 w-4 text-gris-chaud" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="ml-2 bg-transparent text-sm text-noir-profond placeholder:text-gris-chaud focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const q = (e.target as HTMLInputElement).value;
                    if (q.trim()) router.push(`/admin/products?search=${encodeURIComponent(q.trim())}`);
                  }
                }}
              />
            </div>

            {unreadNotifications > 0 && (
              <button
                type="button"
                className="relative rounded-sm border border-beige-fonce p-2 text-noir-profoud"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-bordeaux-principal text-[10px] text-creme">
                  {unreadNotifications}
                </span>
              </button>
            )}

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[36px] items-center gap-1.5 rounded-sm border border-beige-fonce bg-white px-3 py-2 text-xs font-medium uppercase tracking-wider text-noir-profond hover:border-or-principal hover:text-or-principal"
            >
              <Store className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Voir la boutique</span>
            </a>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
