"use client";

import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { isValidWoltUrl } from "@/lib/wolt";

export function WoltButton({
  url,
  className,
  storeUrl,
}: {
  url?: string | null;
  storeUrl?: string | null;
  className?: string;
}) {
  const hasVariant = !!url && isValidWoltUrl(url);
  const hasStore = !!storeUrl && isValidWoltUrl(storeUrl);

  const href = hasVariant ? url! : hasStore ? storeUrl! : null;
  const label = hasVariant ? "Commander sur Wolt" : hasStore ? "Voir notre boutique sur Wolt" : null;

  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-analytics-event={hasVariant ? "wolt_variant" : "wolt_store"}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-sm border border-[#009DE0]/40 bg-[#009DE0]/10 px-4 py-2.5 text-sm font-medium text-[#009DE0] transition-colors hover:bg-[#009DE0]/20",
        className,
      )}
    >
      <ExternalLink className="h-4 w-4" aria-hidden />
      {label}
    </a>
  );
}

export function WoltDisclaimer({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "text-[11px] leading-relaxed text-ivory/50",
        className,
      )}
    >
      Commande, paiement et livraison sur Wolt. Prix et disponibilité à vérifier sur Wolt.
    </p>
  );
}
