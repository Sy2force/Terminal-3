"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Search, ChevronDown, Shield } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Logo } from "@/components/brand/logo";
import { CartBadge } from "@/components/commerce/cart-badge";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { NavLink } from "@/components/layout/nav-link";
import { AuthNav } from "@/components/auth/auth-nav";
import type { SiteSettings } from "@/lib/settings";

const PRIMARY_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/vins", label: "Vins" },
  { href: "/spiritueux", label: "Spiritueux" },
  { href: "/charcuterie", label: "Charcuterie" },
  { href: "/poissons", label: "Poissons" },
  { href: "/plateaux", label: "Plateaux" },
  { href: "/evenements", label: "Mariages & Fêtes" },
  { href: "/nouveautes", label: "Nouveautés" },
  { href: "/promotions", label: "Promotions" },
];

const MORE_LINKS = [
  { href: "/inspirations", label: "Inspirations" },
  { href: "/club", label: "Club" },
];

export function Navbar({
  settings,
  user,
  isAdmin,
}: {
  settings: SiteSettings;
  user: SupabaseUser | null;
  isAdmin: boolean;
}) {
  const [scrolled, setScrolled] = useState(
    () => typeof window !== "undefined" && window.scrollY > 24,
  );
  const [moreOpen, setMoreOpen] = useState(false);

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
          className="hidden items-center justify-center gap-0.5 lg:flex pl-6"
        >
          {PRIMARY_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}

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
                {MORE_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMoreOpen(false)}
                    className="block whitespace-nowrap px-4 py-2.5 font-sans text-[14px] font-medium uppercase tracking-[0.04em] text-texte-clair/80 transition-colors hover:bg-or-principal/5 hover:text-or-principal"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
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
          {isAdmin && (
            <Link
              href="/admin"
              aria-label="Administration"
              className="rounded-full p-2 text-or-principal transition-colors hover:bg-or-principal/10"
            >
              <Shield className="h-5 w-5" aria-hidden />
            </Link>
          )}
          <AuthNav user={user} />
          <MobileMenu settings={settings} user={user} links={[...PRIMARY_LINKS, ...MORE_LINKS]} />
        </div>
      </div>
    </header>
  );
}
