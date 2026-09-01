"use client";

import { useState } from "react";
import { saveWoltSettings } from "@/app/admin/store/actions";
import { isValidWoltUrl } from "@/lib/wolt";

export function WoltSettingsEditor({
  enabled,
  storeUrl,
}: {
  enabled: boolean;
  storeUrl: string | null;
}) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [url, setUrl] = useState(storeUrl ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setStatus("saving");
    setError(null);
    try {
      const normalized = url.trim() || null;
      if (isEnabled && normalized && !isValidWoltUrl(normalized)) {
        throw new Error("L’URL de la boutique Wolt n’est pas valide.");
      }
      await saveWoltSettings({ enabled: isEnabled, storeUrl: normalized });
      setStatus("saved");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Enregistrement échoué.");
    }
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm text-ivory/80">
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={(e) => setIsEnabled(e.target.checked)}
          className="h-4 w-4 accent-champagne"
        />
        Activer les boutons Wolt
      </label>

      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={!isEnabled}
          placeholder="https://wolt.com/en/isr/store/... (repli facultatif)"
          className="w-full rounded-sm border border-white/10 bg-obsidian px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/40 focus:border-champagne focus:outline-none disabled:opacity-40"
        />
        <a
          href={isValidWoltUrl(url) ? url : "#"}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (!isValidWoltUrl(url)) e.preventDefault();
          }}
          className={`whitespace-nowrap rounded-sm px-3 py-2 text-xs ${isValidWoltUrl(url) ? "bg-[#009DE0]/10 text-[#009DE0]" : "text-ivory/40"}`}
        >
          Tester
        </a>
      </div>
      <p className="text-xs text-ivory/50">
        URL de repli facultative. Les fiches par format peuvent être renseignées directement sur chaque variante.
      </p>

      <button
        type="button"
        onClick={handleSave}
        disabled={status === "saving"}
        className="rounded-sm bg-champagne px-4 py-2 text-sm font-semibold text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-60"
      >
        {status === "saving" ? "Enregistrement…" : "Enregistrer"}
      </button>
      {status === "saved" && <p className="text-xs text-champagne">Réglages enregistrés.</p>}
      {error && <p className="text-xs text-bordeaux-principal">{error}</p>}
    </div>
  );
}
