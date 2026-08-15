"use client";

import { useState } from "react";
import { updatePreferences, requestAccountDeletion } from "@/app/compte/parametres/actions";

export function PreferencesForm({
  initialLanguage,
  initialMarketingOptIn,
  deletionRequestedAt,
}: {
  initialLanguage: "fr" | "he";
  initialMarketingOptIn: boolean;
  deletionRequestedAt: string | null;
}) {
  const [language, setLanguage] = useState<"fr" | "he">(initialLanguage);
  const [marketingOptIn, setMarketingOptIn] = useState(initialMarketingOptIn);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deletionRequested, setDeletionRequested] = useState(Boolean(deletionRequestedAt));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = await updatePreferences({ preferredLanguage: language, marketingOptIn });
    setSaving(false);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function handleDeletionRequest() {
    if (!confirm("Confirmez-vous votre demande de fermeture de compte ? Notre équipe vous contactera.")) return;
    await requestAccountDeletion();
    setDeletionRequested(true);
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm text-ivory/80">
          Langue préférée
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "fr" | "he")}
            className="rounded-sm border border-white/10 bg-graphite px-4 py-3 text-ivory outline-none focus:border-champagne"
          >
            <option value="fr">Français</option>
            <option value="he">עברית (Hébreu)</option>
          </select>
        </label>
        <label className="flex items-center gap-3 text-sm text-ivory/80">
          <input
            type="checkbox"
            checked={marketingOptIn}
            onChange={(e) => setMarketingOptIn(e.target.checked)}
            className="h-4 w-4"
          />
          Je souhaite recevoir les offres et nouveautés Terminal 3 par email.
        </label>
        <button
          type="submit"
          disabled={saving}
          className="w-fit rounded-full bg-champagne px-6 py-2.5 text-sm font-semibold text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-50"
        >
          {saving ? "..." : saved ? "Enregistré ✓" : "Enregistrer"}
        </button>
      </form>

      <div className="border-t border-white/10 pt-6">
        <h2 className="font-serif text-lg text-ivory">Fermeture du compte</h2>
        <p className="mt-2 text-sm text-muted-grey">
          La suppression de compte est traitée manuellement par notre équipe afin de préserver
          l&rsquo;historique comptable requis. Votre demande sera examinée sous quelques jours.
        </p>
        <button
          type="button"
          onClick={handleDeletionRequest}
          disabled={deletionRequested}
          className="mt-3 rounded-full border border-red-400/40 px-6 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-400/10 disabled:opacity-50"
        >
          {deletionRequested ? "Demande envoyée" : "Demander la fermeture de mon compte"}
        </button>
      </div>
    </div>
  );
}
