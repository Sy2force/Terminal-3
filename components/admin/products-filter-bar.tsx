"use client";

import { useState, useMemo } from "react";

interface ProductSummary {
  id: string;
  media: { kind: string; url: string }[];
  availability_status?: string | null;
  status?: string | null;
}

interface ProductsFilterBarProps {
  products: ProductSummary[];
  onFilterChange?: (filter: { status?: string; availability?: string; hasPhoto?: boolean } | null) => void;
}

export function ProductsFilterBar({ products, onFilterChange }: ProductsFilterBarProps) {
  const [status, setStatus] = useState<string>("");
  const [availability, setAvailability] = useState<string>("");
  const [photo, setPhoto] = useState<string>("");

  const counts = useMemo(() => {
    const noPhoto = products.filter((p) => !p.media.find((m) => m.kind === "COVER") && !p.media[0]).length;
    const published = products.filter((p) => p.status === "published").length;
    const draft = products.filter((p) => p.status === "draft").length;
    const lowStock = products.filter((p) => p.availability_status === "LOW_STOCK").length;
    const outOfStock = products.filter((p) => p.availability_status === "OUT_OF_STOCK").length;
    return { all: products.length, noPhoto, published, draft, lowStock, outOfStock };
  }, [products]);

  function apply(newStatus: string, newAvailability: string, newPhoto: string) {
    const f: { status?: string; availability?: string; hasPhoto?: boolean } | null =
      newStatus || newAvailability || newPhoto
        ? {
            ...(newStatus ? { status: newStatus } : {}),
            ...(newAvailability ? { availability: newAvailability } : {}),
            ...(newPhoto ? { hasPhoto: newPhoto === "yes" } : {}),
          }
        : null;
    onFilterChange?.(f);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => {
          setStatus("");
          setAvailability("");
          setPhoto("");
          apply("", "", "");
        }}
        className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
          !status && !availability && !photo
            ? "border-or-principal bg-or-principal/10 text-noir-profond"
            : "border-beige-fonce text-gris-chaud hover:border-or-principal hover:text-noir-profond"
        }`}
      >
        Tous ({counts.all})
      </button>

      <button
        type="button"
        onClick={() => {
          const next = status === "published" ? "" : "published";
          setStatus(next);
          apply(next, availability, photo);
        }}
        className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
          status === "published"
            ? "border-green-600 bg-green-50 text-green-800"
            : "border-beige-fonce text-gris-chaud hover:border-green-600 hover:text-green-800"
        }`}
      >
        Publiés ({counts.published})
      </button>

      <button
        type="button"
        onClick={() => {
          const next = status === "draft" ? "" : "draft";
          setStatus(next);
          apply(next, availability, photo);
        }}
        className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
          status === "draft"
            ? "border-slate-500 bg-slate-100 text-slate-700"
            : "border-beige-fonce text-gris-chaud hover:border-slate-500 hover:text-slate-700"
        }`}
      >
        Brouillons ({counts.draft})
      </button>

      <button
        type="button"
        onClick={() => {
          const next = availability === "LOW_STOCK" ? "" : "LOW_STOCK";
          setAvailability(next);
          apply(status, next, photo);
        }}
        className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
          availability === "LOW_STOCK"
            ? "border-amber-600 bg-amber-50 text-amber-800"
            : "border-beige-fonce text-gris-chaud hover:border-amber-600 hover:text-amber-800"
        }`}
      >
        Stock faible ({counts.lowStock})
      </button>

      <button
        type="button"
        onClick={() => {
          const next = photo === "no" ? "" : "no";
          setPhoto(next);
          apply(status, availability, next);
        }}
        className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
          photo === "no"
            ? "border-bordeaux-principal bg-bordeaux-principal/10 text-bordeaux-principal"
            : "border-beige-fonce text-gris-chaud hover:border-bordeaux-principal hover:text-bordeaux-principal"
        }`}
      >
        Sans photo ({counts.noPhoto})
      </button>
    </div>
  );
}
