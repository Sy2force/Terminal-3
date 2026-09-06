"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deletePromotionAction } from "@/app/admin/promotions/actions";

export function PromotionRowActions({
  promotionId,
}: {
  promotionId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm("Supprimer cette promotion ?")) return;
    setError(null);
    startTransition(async () => {
      const result = await deletePromotionAction(promotionId);
      if (!result.success) setError(result.error ?? "Échec");
    });
  }

  return (
    <div className="flex items-center justify-end gap-3">
      {error && <span className="text-xs text-amber-700">{error}</span>}
      <Link
        href={`/admin/promotions/${promotionId}`}
        className="text-xs text-or-principal hover:text-soft-gold"
      >
        Modifier
      </Link>
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
