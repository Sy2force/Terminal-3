"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, Heart, Package, Settings, Sparkles } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { LogoutButton } from "@/components/account/logout-button";

interface AuthNavProps {
  user: SupabaseUser | null;
}

function getFirstName(user: SupabaseUser): string | null {
  const meta = user.user_metadata as Record<string, string | undefined> | undefined;
  if (meta?.first_name) return meta.first_name;
  if (user.email) return user.email.split("@")[0];
  return null;
}

export function AuthNav({ user }: AuthNavProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.addEventListener("mousedown", onClick);
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  if (!user) {
    return (
      <div className="hidden items-center gap-2 lg:flex">
        <Link
          href="/login"
          className="auth-button inline-flex items-center justify-center h-[42px] px-[18px] rounded-[10px] border border-or-principal/80 bg-transparent text-[13px] font-semibold tracking-[0.02em] text-texte-clair whitespace-nowrap transition-all hover:border-or-principal hover:bg-or-principal/10 hover:text-or-principal hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-or-principal"
        >
          Se connecter
        </Link>
        <Link
          href="/inscription"
          className="auth-button inline-flex items-center justify-center h-[42px] px-[18px] rounded-[10px] border border-or-principal bg-or-principal text-[13px] font-semibold tracking-[0.02em] text-noir-profond whitespace-nowrap transition-all hover:translate-y-[-1px] hover:bg-gold-3 hover:shadow-[0_4px_12px_rgba(198,161,91,0.25)] focus:outline-none focus:ring-2 focus:ring-or-principal"
        >
          S&apos;inscrire
        </Link>
      </div>
    );
  }

  const firstName = getFirstName(user);

  return (
    <div ref={ref} className="relative hidden lg:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-[10px] border border-or-principal/30 bg-noir-chaud/40 px-3 py-2 text-sm text-texte-clair transition-colors hover:border-or-principal/60 hover:bg-or-principal/10 focus:outline-none focus:ring-2 focus:ring-or-principal"
      >
        <User className="h-4 w-4 text-or-principal" aria-hidden />
        <span className="max-w-[120px] truncate">{firstName ?? "Mon compte"}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-52 rounded-[10px] border border-or-principal/15 bg-noir-profond p-2 shadow-xl"
        >
          <Link
            href="/compte"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-texte-clair transition-colors hover:bg-or-principal/10 hover:text-or-principal"
          >
            <User className="h-4 w-4" /> Mon compte
          </Link>
          <Link
            href="/compte/commandes"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-texte-clair transition-colors hover:bg-or-principal/10 hover:text-or-principal"
          >
            <Package className="h-4 w-4" /> Mes commandes
          </Link>
          <Link
            href="/favoris"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-texte-clair transition-colors hover:bg-or-principal/10 hover:text-or-principal"
          >
            <Heart className="h-4 w-4" /> Favoris
          </Link>
          <Link
            href="/compte/fidelite"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-texte-clair transition-colors hover:bg-or-principal/10 hover:text-or-principal"
          >
            <Sparkles className="h-4 w-4" /> Fidélité
          </Link>
          <Link
            href="/compte/parametres"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-texte-clair transition-colors hover:bg-or-principal/10 hover:text-or-principal"
          >
            <Settings className="h-4 w-4" /> Paramètres
          </Link>
          <div className="my-1 border-t border-or-principal/10" />
          <LogoutButton />
        </div>
      )}
    </div>
  );
}

export function MobileAuthNav({ user, onClose }: { user: SupabaseUser | null; onClose: () => void }) {
  if (!user) {
    return (
      <div className="flex flex-col gap-3 border-t border-or-principal/10 px-6 py-6">
        <Link
          href="/login"
          onClick={onClose}
          className="auth-button flex h-[42px] w-full items-center justify-center rounded-[10px] border border-or-principal/80 bg-transparent text-[13px] font-semibold tracking-[0.02em] text-texte-clair transition-all hover:border-or-principal hover:bg-or-principal/10 hover:text-or-principal"
        >
          Se connecter
        </Link>
        <Link
          href="/inscription"
          onClick={onClose}
          className="auth-button flex h-[42px] w-full items-center justify-center rounded-[10px] border border-or-principal bg-or-principal text-[13px] font-semibold tracking-[0.02em] text-noir-profond transition-all hover:bg-gold-3"
        >
          S&apos;inscrire
        </Link>
      </div>
    );
  }

  const firstName = getFirstName(user);

  return (
    <div className="flex flex-col gap-1 border-t border-or-principal/10 px-6 py-6">
      <p className="mb-2 flex items-center gap-2 text-sm font-medium text-or-principal">
        <User className="h-4 w-4" />
        {firstName ?? "Mon compte"}
      </p>
      <NavItem href="/compte" onClick={onClose} icon={User}>Mon compte</NavItem>
      <NavItem href="/compte/commandes" onClick={onClose} icon={Package}>Mes commandes</NavItem>
      <NavItem href="/favoris" onClick={onClose} icon={Heart}>Favoris</NavItem>
      <NavItem href="/compte/fidelite" onClick={onClose} icon={Sparkles}>Fidélité</NavItem>
      <NavItem href="/compte/parametres" onClick={onClose} icon={Settings}>Paramètres</NavItem>
      <div className="mt-2">
        <LogoutButton />
      </div>
    </div>
  );
}

function NavItem({ href, onClick, icon: Icon, children }: { href: string; onClick: () => void; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 rounded-sm px-3 py-2.5 text-sm text-texte-clair/80 transition-colors hover:bg-or-principal/5 hover:text-or-principal"
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}
