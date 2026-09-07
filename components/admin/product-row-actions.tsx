"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  archiveProductAction,
  deleteProductAction,
  duplicateProductAction,
} from "@/app/admin/products/actions";

export function ProductRowActions({ productId, slug }: { productId: string; slug: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleArchive() {
    setError(null);
    startTransition(async () => {
      const result = await archiveProductAction(productId);
      if (!result.success) setError(result.error ?? "Échec");
    });
  }

  function handleDuplicate() {
    setError(null);
    startTransition(async () => {
      const result = await duplicateProductAction(productId);
      if (!result.success) setError(result.error ?? "Échec");
      else router.refresh();
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
      {error && <span className="text-xs text-amber-700">{error}</span>}
      <Link href={`/products/${slug}`} target="_blank" className="text-xs text-noir-profond/60 hover:text-noir-profond">
        Voir
      </Link>
      <Link href={`/admin/products/${productId}`} className="text-xs text-or-principal hover:text-soft-gold">
        Modifier
      </Link>
      <button
        type="button"
        onClick={handleDuplicate}
        disabled={isPending}
        className="text-xs text-noir-profond/60 hover:text-noir-profond disabled:opacity-50"
      >
        Dupliquer
      </button>
      <button
        type="button"
        onClick={handleArchive}
        disabled={isPending}
        className="text-xs text-noir-profond/60 hover:text-noir-profond disabled:opacity-50"
      >
        Archiver
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="text-xs text-amber-700 hover:text-amber-300 disabled:opacity-50"
      >
        Supprimer
      </button>
    </div>
  );
}
