"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { archiveProductAction, deleteProductAction } from "@/app/admin/products/actions";

export function ProductRowActions({ productId, slug }: { productId: string; slug: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleArchive() {
    setError(null);
    startTransition(async () => {
      const result = await archiveProductAction(productId);
      if (!result.success) setError(result.error ?? "Échec");
    });
  }

  function handleDelete() {
    if (!confirm("Supprimer définitivement ce produit ?")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteProductAction(productId);
      if (!result.success) setError(result.error ?? "Échec");
    });
  }

  return (
    <div className="flex items-center justify-end gap-3">
      {error && <span className="text-xs text-amber-400">{error}</span>}
      <Link href={`/products/${slug}`} target="_blank" className="text-xs text-ivory/60 hover:text-ivory">
        Voir
      </Link>
      <Link href={`/admin/products/${productId}`} className="text-xs text-champagne hover:text-soft-gold">
        Modifier
      </Link>
      <button
        type="button"
        onClick={handleArchive}
        disabled={isPending}
        className="text-xs text-ivory/60 hover:text-ivory disabled:opacity-50"
      >
        Archiver
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="text-xs text-amber-400 hover:text-amber-300 disabled:opacity-50"
      >
        Supprimer
      </button>
    </div>
  );
}
