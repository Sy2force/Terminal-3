"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, User, Heart } from "lucide-react";
import { WhatsAppButton, CallButton } from "@/components/commerce/contact-actions";
import type { SiteSettings } from "@/lib/settings";

export function MobileMenu({
  settings,
  links,
}: {
  settings: SiteSettings;
  links: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-full p-2 text-ivory"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed inset-0 top-16 z-40 flex flex-col bg-obsidian">
          <nav
            aria-label="Navigation mobile"
            className="flex flex-1 flex-col gap-1 px-6 py-8"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/5 py-4 font-serif text-2xl text-ivory"
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-6 flex gap-6">
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-sm text-ivory/80"
              >
                <User className="h-5 w-5" aria-hidden />
                Mon compte
              </Link>
              <Link
                href="/account/favorites"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-sm text-ivory/80"
              >
                <Heart className="h-5 w-5" aria-hidden />
                Favoris
              </Link>
            </div>

            <Link
              href="/club"
              onClick={() => setOpen(false)}
              className="mt-8 rounded-full bg-champagne px-5 py-3 text-center text-sm font-semibold tracking-wide text-obsidian"
            >
              Rejoindre le Club
            </Link>
          </nav>

          <div className="flex gap-3 border-t border-white/10 px-6 py-4">
            <CallButton phone={settings.STORE_PHONE} className="flex-1" />
            <WhatsAppButton
              whatsapp={settings.STORE_WHATSAPP}
              className="flex-1"
            />
          </div>
        </div>
      )}
    </div>
  );
}
