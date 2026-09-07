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
      <label className="block text-sm text-noir-profond/80" htmlFor="store-whatsapp">
        Numéro WhatsApp de la boutique
      </label>
      <input
        id="store-whatsapp"
        type="tel"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="+972 50-123-4567"
        className="w-full rounded-sm border border-beige-fonce bg-fond-papier px-3 py-2.5 text-sm text-noir-profond placeholder:text-noir-profond/40 focus:border-or-principal focus:outline-none"
      />
      <p className="text-xs text-noir-profond/50">
        Format international requis. S’il est vide, les boutons WhatsApp publics sont masqués.
      </p>
      <button
        type="button"
        onClick={handleSave}
        disabled={status === "saving"}
        className="rounded-sm bg-or-principal px-4 py-2 text-sm font-semibold text-noir-profond transition-colors hover:bg-or-clair disabled:opacity-60"
      >
        {status === "saving" ? "Enregistrement…" : "Enregistrer"}
      </button>
      {status === "saved" && <p className="text-xs text-or-principal">Numéro enregistré.</p>}
      {error && <p className="text-xs text-bordeaux-principal">{error}</p>}
    </div>
  );
}
