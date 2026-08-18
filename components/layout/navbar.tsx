"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Search, ChevronDown, Shield, Pencil } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Logo } from "@/components/brand/logo";
import { CartBadge } from "@/components/commerce/cart-badge";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { NavLink } from "@/components/layout/nav-link";
import { AuthNav } from "@/components/auth/auth-nav";
import { useAdminEdit } from "@/components/admin/admin-edit-mode";
import type { SiteSettings } from "@/lib/settings";
import type { NavMenu } from "@/lib/data/navigation";

const FALLBACK_PRIMARY = [
  { href: "/", label: "Accueil", target: "_self" as const },
  { href: "/vins", label: "Vins", target: "_self" as const },
  { href: "/spiritueux", label: "Spiritueux", target: "_self" as const },
  { href: "/charcuterie", label: "Charcuterie", target: "_self" as const },
  { href: "/poissons", label: "Poissons", target: "_self" as const },
  { href: "/plateaux", label: "Plateux", target: "_self" as const },
  { href: "/evenements", label: "Mariages & Fêtes", target: "_self" as const },
  { href: "/nouveautes", label: "Nouveautés", target: "_self" as const },
  { href: "/promotions", label: "Promotions", target: "_self" as const },
];

const FALLBACK_MORE = [
  { href: "/inspirations", label: "Inspirations", target: "_self" as const },
  { href: "/club", label: "Club", target: "_self" as const },
];

function toNavLinks(menu: NavMenu | null) {
  return (menu?.items ?? []).map((i) => ({
    href: i.href,
    label: i.label_fr,
    target: i.target ?? "_self",
  }));
}

export function Navbar({
  settings,
  user,
  isAdmin,
  mainMenu,
}: {
  settings: SiteSettings;
  user: SupabaseUser | null;
  isAdmin: boolean;
  mainMenu: NavMenu | null;
}) {
  const [scrolled, setScrolled] = useState(
    () => typeof window !== "undefined" && window.scrollY > 24,
  );
  const [moreOpen, setMoreOpen] = useState(false);
  const { isEditing, setIsEditing, canEdit } = useAdminEdit();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ease-out ${
        scrolled
          ? "border-or-principal/20 bg-noir-chaud/95 shadow-lg shadow-black/20"
          : "border-or-principal/10 bg-noir-chaud/80"
      } backdrop-blur-xl`}
    >
      <div className="mx-auto grid min-h-[68px] h-[68px] lg:min-h-[76px] lg:h-[76px] max-w-[1440px] grid-cols-[auto_1fr_auto] items-center px-4 sm:px-6 lg:px-8 gap-4">
        <Logo settings={settings} />

        <nav
          aria-label="Navigation principale"
          className="hidden items-center justify-center gap-0.5 lg:flex pl-20"
        >
          {(toNavLinks(mainMenu).slice(0, 9).length > 0
            ? toNavLinks(mainMenu).slice(0, 9)
            : FALLBACK_PRIMARY
          ).map((link) => (
            <NavLink
              key={link.href + link.label}
              href={link.href}
              label={link.label}
              target={link.target}
            />
          ))}

          {(() => {
            const more = toNavLinks(mainMenu).slice(9).length > 0
              ? toNavLinks(mainMenu).slice(9)
              : FALLBACK_MORE;
            if (more.length === 0) return null;
            return (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMoreOpen((v) => !v)}
                  onBlur={() => setTimeout(() => setMoreOpen(false), 150)}
                  aria-expanded={moreOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-1 whitespace-nowrap px-2.5 py-2 font-sans text-[14px] font-medium uppercase tracking-[0.04em] text-texte-clair/80 transition-colors duration-200 hover:text-or-principal"
                >
                  Découvrir
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      moreOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  />
                </button>
                {moreOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-1 w-44 rounded-sm border border-or-principal/15 bg-noir-chaud/95 p-1 shadow-xl backdrop-blur-xl"
                  >
                    {more.map((link) => (
                      <Link
                        key={link.href + link.label}
                        href={link.href}
                        target={link.target}
                        onClick={() => setMoreOpen(false)}
                        className="block whitespace-nowrap px-4 py-2.5 font-sans text-[14px] font-medium uppercase tracking-[0.04em] text-texte-clair/80 transition-colors hover:bg-or-principal/5 hover:text-or-principal"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </nav>

        <div className="col-start-3 flex items-center justify-end gap-[clamp(8px,0.8vw,14px)]">
          <Link
            href="/recherche"
            aria-label="Rechercher"
            className="rounded-full p-2 text-texte-clair/80 transition-colors hover:bg-or-principal/5 hover:text-or-principal"
          >
            <Search className="h-5 w-5" aria-hidden />
          </Link>
          <Link
            href="/favoris"
            aria-label="Mes favoris"
            className="rounded-full p-2 text-texte-clair/80 transition-colors hover:bg-or-principal/5 hover:text-or-principal"
          >
            <Heart className="h-5 w-5" aria-hidden />
          </Link>
          <CartBadge />
          <Link
            href="/admin/login"
            className="hidden items-center gap-1.5 rounded-[10px] border border-or-principal/80 bg-transparent px-3 py-2 text-[13px] font-semibold text-texte-clair transition-all hover:border-or-principal hover:bg-or-principal/10 hover:text-or-principal lg:inline-flex"
          >
            <Shield className="h-4 w-4" aria-hidden />
            <span>Admin</span>
          </Link>
          {canEdit && (
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`hidden items-center gap-1.5 rounded-[10px] border px-3 py-2 text-[13px] font-semibold transition-all lg:inline-flex ${
                isEditing
                  ? "border-champagne bg-champagne text-obsidian hover:bg-champagne/90"
                  : "border-or-principal/80 bg-transparent text-texte-clair hover:border-or-principal hover:bg-or-principal/10 hover:text-or-principal"
              }`}
            >
              <Pencil className="h-4 w-4" aria-hidden />
              <span>{isEditing ? "Quitter" : "Éditer le site"}</span>
            </button>
          )}
          <AuthNav user={user} />
          <MobileMenu settings={settings} user={user} isAdmin={isAdmin} links={toNavLinks(mainMenu).length > 0 ? toNavLinks(mainMenu) : [...FALLBACK_PRIMARY, ...FALLBACK_MORE]} />
        </div>
      </div>
    </header>
  );
}
