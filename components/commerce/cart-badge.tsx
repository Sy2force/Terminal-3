"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";

export function CartBadge({ className }: { className?: string }) {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`Panier${itemCount > 0 ? ` (${itemCount} article${itemCount > 1 ? "s" : ""})` : ""}`}
      className={`relative rounded-full p-2 text-ivory/80 transition-colors hover:text-champagne ${className ?? ""}`}
    >
      <ShoppingBag className="h-5 w-5" aria-hidden />
      {itemCount > 0 && (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-champagne px-1 text-[10px] font-semibold text-obsidian"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
