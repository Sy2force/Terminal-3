"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, Search, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const HIDE_ON = ["/admin", "/login", "/inscription", "/checkout", "/commande"];

const ITEMS = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/categories", label: "Catalogue", icon: Grid3X3 },
  { href: "/recherche", label: "Recherche", icon: Search },
  { href: "/favoris", label: "Favoris", icon: Heart },
  { href: "/compte", label: "Compte", icon: User },
];

export function BottomNav({
  isAdmin,
}: {
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const hide = HIDE_ON.some((p) => pathname.startsWith(p));
  if (hide) return null;

  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      aria-label="Navigation inférieure"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-or-principal/10 bg-noir-chaud/95 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto flex max-w-md items-center justify-around px-2">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-or-principal"
                  : "text-texte-clair/70 hover:text-or-principal",
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" aria-hidden />
                {item.href === "/compte" && isAdmin && (
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-or-principal" />
                )}
              </div>
              <span className="max-w-[64px] truncate px-1">{item.label}</span>
              {isActive && (
                <span className="absolute -top-2.5 h-1 w-5 rounded-full bg-or-principal" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
