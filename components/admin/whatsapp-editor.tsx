"use client";

import { useState } from "react";
import { saveStoreWhatsApp } from "@/app/admin/store/actions";

export function WhatsAppEditor({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setStatus("saving");
    setError(null);
    try {
      const saved = await saveStoreWhatsApp(value);
      setValue(saved);
      setStatus("saved");
    } catch (e) {
      setStatus("error");
      setError(
        e instanceof Error && e.message === "numero_invalide"
          ? "Le numéro doit être au format international, ex. +972 50-123-4567."
          : "Enregistrement échoué.",
      );
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm text-ivory/80" htmlFor="store-whatsapp">
        Numéro WhatsApp de la boutique
      </label>
      <input
        id="store-whatsapp"
        type="tel"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="+972 50-123-4567"
        className="w-full rounded-sm border border-white/10 bg-obsidian px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/40 focus:border-champagne focus:outline-none"
      />
      <p className="text-xs text-ivory/50">
        Format international requis. S’il est vide, les boutons WhatsApp publics sont masqués.
      </p>
      <button
        type="button"
        onClick={handleSave}
        disabled={status === "saving"}
        className="rounded-sm bg-champagne px-4 py-2 text-sm font-semibold text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-60"
      >
        {status === "saving" ? "Enregistrement…" : "Enregistrer"}
      </button>
      {status === "saved" && <p className="text-xs text-champagne">Numéro enregistré.</p>}
      {error && <p className="text-xs text-bordeaux-principal">{error}</p>}
    </div>
  );
}
