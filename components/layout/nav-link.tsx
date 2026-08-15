"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  label: string;
  onClick?: () => void;
  className?: string;
  mobile?: boolean;
}

export function NavLink({ href, label, onClick, className, mobile = false }: NavLinkProps) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  if (mobile) {
    return (
      <Link
        href={href}
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        className={cn(
          "border-b border-or-principal/10 py-3.5 font-sans text-[15px] font-medium uppercase tracking-[0.04em] transition-colors",
          active ? "text-or-principal" : "text-texte-clair hover:text-or-principal",
          className,
        )}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative whitespace-nowrap px-2.5 py-2 font-sans text-[14px] font-medium uppercase tracking-[0.04em] transition-colors duration-200",
        active
          ? "text-or-principal"
          : "text-texte-clair/80 hover:text-or-principal",
        className,
      )}
    >
      {label}
      <span
        className={cn(
          "absolute bottom-0 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-or-principal transition-all duration-300",
          active ? "w-5" : "w-0 group-hover:w-5",
        )}
        aria-hidden
      />
    </Link>
  );
}
