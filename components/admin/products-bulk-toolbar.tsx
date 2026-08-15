"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  bulkUpdateStatusAction,
  bulkUpdateCategoryAction,
  bulkAdjustPriceAction,
} from "@/app/admin/products/actions";
import type { CategoryRow } from "@/types/database";

interface ProductsBulkToolbarProps {
  selectedIds: string[];
  categories: CategoryRow[];
  onDone: () => void;
}

export function ProductsBulkToolbar({ selectedIds, categories, onDone }: ProductsBulkToolbarProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run(action: () => Promise<{ success: boolean; updated: number; error?: string }>) {
    setPending(true);
    setMessage(null);
    const result = await action();
    setPending(false);
    setMessage(
      result.success
        ? `${result.updated} produit(s) mis à jour.`
        : `Échec : ${result.error ?? "erreur inconnue"}`,
    );
    if (result.success) {
      router.refresh();
      onDone();
    }
  }

  if (selectedIds.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-sm border border-champagne/30 bg-graphite px-4 py-3">
      <span className="text-sm text-ivory">{selectedIds.length} sélectionné(s)</span>

      <select
        disabled={pending}
        onChange={(e) => {
          if (!e.target.value) return;
          run(() => bulkUpdateStatusAction(selectedIds, e.target.value as "draft" | "published" | "archived"));
          e.target.value = "";
        }}
        className="rounded-sm border border-white/10 bg-warm-black px-3 py-1.5 text-xs text-ivory"
        defaultValue=""
      >
        <option value="" disabled>Changer le statut...</option>
        <option value="published">Publier</option>
        <option value="draft">Mettre en brouillon</option>
        <option value="archived">Archiver</option>
      </select>

      <select
        disabled={pending}
        onChange={(e) => {
          run(() => bulkUpdateCategoryAction(selectedIds, e.target.value || null));
          e.target.value = "";
        }}
        className="rounded-sm border border-white/10 bg-warm-black px-3 py-1.5 text-xs text-ivory"
        defaultValue=""
      >
        <option value="" disabled>Changer de catégorie...</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name_fr || c.name_he}</option>
        ))}
      </select>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => bulkAdjustPriceAction(selectedIds, -10))}
          className="rounded-sm border border-white/10 px-3 py-1.5 text-xs text-ivory/80 hover:border-champagne/40 disabled:opacity-50"
        >
          -10% prix
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => bulkAdjustPriceAction(selectedIds, 10))}
          className="rounded-sm border border-white/10 px-3 py-1.5 text-xs text-ivory/80 hover:border-champagne/40 disabled:opacity-50"
        >
          +10% prix
        </button>
      </div>

      {message && <span className="text-xs text-champagne">{message}</span>}
    </div>
  );
}
