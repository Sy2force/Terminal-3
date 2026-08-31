"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  ShieldCheck,
  Package,
  FileText,
  Heart,
  Sparkles,
  MapPin,
  Bell,
  Lock,
  Settings,
  Store,
  MessageSquare,
} from "lucide-react";

const LINKS = [
  { href: "/compte", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/compte/profil", label: "Mon profil", icon: User },
  { href: "/compte/verification", label: "Vérification", icon: ShieldCheck },
  { href: "/compte/commandes", label: "Commandes", icon: Package },
  { href: "/compte/bar", label: "Mon bar / pro", icon: Store },
  { href: "/compte/demandes", label: "Mes demandes", icon: MessageSquare },
  { href: "/compte/factures", label: "Factures", icon: FileText },
  { href: "/favoris", label: "Favoris", icon: Heart },
  { href: "/compte/fidelite", label: "Fidélité", icon: Sparkles },
  { href: "/compte/adresses", label: "Adresses", icon: MapPin },
  { href: "/compte/notifications", label: "Notifications", icon: Bell },
  { href: "/compte/securite", label: "Sécurité", icon: Lock },
  { href: "/compte/parametres", label: "Paramètres", icon: Settings },
];

export function CompteSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden w-56 shrink-0 flex-col gap-1 border-r border-white/5 py-16 lg:flex">
        {LINKS.map((link) => {
          const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-sm px-4 py-2.5 text-sm transition-colors ${
                isActive ? "bg-champagne/10 text-champagne" : "text-ivory/70 hover:bg-white/5 hover:text-ivory"
              }`}
            >
              <link.icon className="h-4 w-4" aria-hidden />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile bottom nav (subset) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-white/10 bg-obsidian/95 py-2 backdrop-blur lg:hidden">
        {LINKS.slice(0, 5).map((link) => {
          const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 px-2 py-1 text-[10px] ${
                isActive ? "text-champagne" : "text-muted-grey"
              }`}
            >
              <link.icon className="h-5 w-5" aria-hidden />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="h-16 lg:hidden" aria-hidden />
    </>
  );
}
