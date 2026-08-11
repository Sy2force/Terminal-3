"use client";

import { useState, useTransition } from "react";
import { setWeeklyPromoMessage } from "@/app/admin/store/actions";

export function WeeklyMessageEditor({
  initialMessage,
}: {
  initialMessage: string | null;
}) {
  const [message, setMessage] = useState(initialMessage ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      try {
        await setWeeklyPromoMessage(message);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch {
        // no-op — button simply stays available to retry
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
        maxLength={140}
        placeholder="Ex : -20% sur votre première commande cette semaine !"
        className="rounded-sm border border-white/10 bg-graphite px-4 py-3 text-sm text-ivory outline-none focus:border-champagne"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-grey">
          Affiché en bandeau sur tout le site. Laisser vide pour masquer.
        </span>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-full bg-champagne px-5 py-2 text-xs font-semibold tracking-wide text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-50"
        >
          {isPending ? "..." : saved ? "Enregistré ✓" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
