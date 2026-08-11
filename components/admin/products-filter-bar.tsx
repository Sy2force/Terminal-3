"use client";

import { useState, useMemo } from "react";

interface ProductSummary {
  id: string;
  media: { kind: string; url: string }[];
}

export function ProductsFilterBar({ products }: { products: ProductSummary[] }) {
  const [filter, setFilter] = useState<"all" | "no-photo">("all");

  const counts = useMemo(() => {
    const noPhoto = products.filter(
      (p) => !p.media.find((m) => m.kind === "COVER") && !p.media[0],
    ).length;
    return { all: products.length, noPhoto };
  }, [products]);

  if (counts.noPhoto === 0) return null;

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => {
          setFilter("all");
          document.querySelectorAll("tr[data-has-photo]").forEach((row) => {
            (row as HTMLElement).style.display = "";
          });
        }}
        className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-widest transition-colors ${
          filter === "all"
            ? "border-champagne text-champagne"
            : "border-white/10 text-ivory/60 hover:border-white/30"
        }`}
      >
        Tous ({counts.all})
      </button>
      <button
        type="button"
        onClick={() => {
          setFilter("no-photo");
          document.querySelectorAll("tr[data-has-photo]").forEach((row) => {
            const hasPhoto = (row as HTMLElement).dataset.hasPhoto === "true";
            (row as HTMLElement).style.display = hasPhoto ? "none" : "";
          });
        }}
        className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-widest transition-colors ${
          filter === "no-photo"
            ? "border-amber-400 text-amber-400"
            : "border-white/10 text-ivory/60 hover:border-white/30"
        }`}
      >
        ⚠ Sans photo ({counts.noPhoto})
      </button>
    </div>
  );
}
