"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { WhatsAppButton, CallButton } from "@/components/commerce/contact-actions";
import { NavLink } from "@/components/layout/nav-link";
import { MobileAuthNav } from "@/components/auth/auth-nav";
import type { SiteSettings } from "@/lib/settings";

export function MobileMenu({
  settings,
  user,
  links,
}: {
  settings: SiteSettings;
  user: SupabaseUser | null;
  links: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);



  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-full p-2 text-texte-clair transition-colors hover:text-or-principal"
      >
        {open ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
      </button>

      {open && (
        <div className="fixed inset-0 top-0 z-40 flex flex-col bg-noir-chaud" aria-label="Menu mobile" role="dialog" aria-modal="true">
          <div className="flex items-center justify-between border-b border-or-principal/10 px-6 py-4">
            <span className="font-serif text-xl text-texte-clair">Menu</span>
            <button
              type="button"
              aria-label="Fermer le menu"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-texte-clair/80 hover:text-or-principal"
            >
              <X className="h-6 w-6" aria-hidden />
            </button>
          </div>

          <nav
            aria-label="Navigation mobile"
            className="flex flex-1 flex-col gap-1 overflow-y-auto px-6 py-6"
          >
            {links.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                onClick={() => setOpen(false)}
                mobile
              />
            ))}

            <MobileAuthNav user={user} onClose={() => setOpen(false)} />
          </nav>

          <div className="flex gap-3 border-t border-or-principal/10 px-6 py-4">
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
