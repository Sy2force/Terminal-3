import Link from "next/link";
import { User, Heart, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { WhatsAppButton, CallButton } from "@/components/commerce/contact-actions";
import { CartBadge } from "@/components/commerce/cart-badge";
import { MobileMenu } from "@/components/layout/mobile-menu";
import type { SiteSettings } from "@/lib/settings";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/categories", label: "Boutique" },
  { href: "/categories/alcohol", label: "Vins" },
  { href: "/categories/spirits", label: "Spiritueux" },
  { href: "/categories/charcuterie", label: "Charcuterie" },
  { href: "/categories/fish", label: "Poissons" },
  { href: "/new", label: "Nouveautés" },
  { href: "/promotions", label: "Promotions" },
  { href: "/inspirations", label: "Inspirations" },
  { href: "/club", label: "Club" },
];

export function Navbar({
  settings,
  storeOnline,
}: {
  settings: SiteSettings;
  storeOnline: boolean;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-champagne/10 bg-obsidian/90 backdrop-blur-xl">
      {!storeOnline ? (
        <div className="bg-champagne px-4 py-2 text-center text-xs font-medium tracking-wide text-obsidian">
          La boutique en ligne est momentanément fermée aux commandes — le
          catalogue reste consultable.
        </div>
      ) : (
        settings.WEEKLY_PROMO_MESSAGE && (
          <Link
            href="/promotions"
            className="flex items-center justify-center gap-2 bg-bordeaux px-4 py-2 text-center text-xs font-medium tracking-wide text-champagne transition-colors hover:bg-wine-burgundy"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {settings.WEEKLY_PROMO_MESSAGE}
          </Link>
        )
      )}
      <div className="mx-auto flex h-32 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="absolute inset-0 bg-champagne/10 blur-xl" />
          <Logo settings={settings} className="relative" />
        </div>

        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-6 lg:gap-8 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base tracking-wide text-ivory/80 transition-colors hover:text-champagne font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/account/favorites"
            aria-label="Mes favoris"
            className="rounded-full p-2 text-ivory/80 transition-colors hover:text-champagne hover:bg-champagne/5"
          >
            <Heart className="h-5 w-5" aria-hidden />
          </Link>
          <Link
            href="/account"
            aria-label="Mon compte"
            className="rounded-full p-2 text-ivory/80 transition-colors hover:text-champagne hover:bg-champagne/5"
          >
            <User className="h-5 w-5" aria-hidden />
          </Link>
          <CartBadge />
          <div className="mx-1 h-6 w-px bg-champagne/20" />
          <CallButton phone={settings.STORE_PHONE} className="px-3 py-1.5 text-xs text-ivory/80 hover:text-champagne" />
          <WhatsAppButton
            whatsapp={settings.STORE_WHATSAPP}
            className="px-3 py-1.5 text-xs text-ivory/80 hover:text-champagne"
          />
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <CartBadge />
          <MobileMenu settings={settings} links={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}
