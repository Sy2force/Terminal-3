"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { archiveCategoryAction, deleteCategoryAction } from "@/app/admin/categories/actions";

export function CategoryRowActions({ categoryId }: { categoryId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleArchive() {
    setError(null);
    startTransition(async () => {
      const result = await archiveCategoryAction(categoryId);
      if (!result.success) setError(result.error ?? "Échec");
    });
  }

  function handleDelete() {
    if (!confirm("Supprimer définitivement cette catégorie ? Les produits associés l'empêcheront.")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteCategoryAction(categoryId);
      if (!result.success) setError(result.error ?? "Échec");
    });
  }

  return (
    <div className="flex items-center justify-end gap-3">
      {error && <span className="text-xs text-amber-400">{error}</span>}
      <Link
        href={`/admin/categories/${categoryId}`}
        className="text-xs text-champagne hover:text-soft-gold"
      >
        Modifier
      </Link>
      <button
        type="button"
        onClick={handleArchive}
        disabled={isPending}
        className="text-xs text-ivory/60 hover:text-ivory disabled:opacity-50"
      >
        Désactiver
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
