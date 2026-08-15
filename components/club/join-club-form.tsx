"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinClub } from "@/app/club/actions";

const PREFERENCE_OPTIONS = [
  { value: "vins", label: "Vins" },
  { value: "whisky", label: "Whisky" },
  { value: "charcuterie", label: "Charcuterie" },
  { value: "poissons", label: "Poissons" },
] as const;

export function JoinClubForm({
  isLoggedIn,
  defaultEmail,
}: {
  isLoggedIn: boolean;
  defaultEmail?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [open, setOpen] = useState(false);
  const [preferences, setPreferences] = useState<string[]>([]);

  if (!isLoggedIn) {
    return (
      <button
        type="button"
        onClick={() => router.push("/login?redirect=/club")}
        className="rounded-sm bg-or-principal px-10 py-3 text-sm font-semibold uppercase tracking-widest text-noir-profond transition-colors hover:bg-or-clair"
      >
        Se connecter pour rejoindre
      </button>
    );
  }

  if (joined) {
    return (
      <p className="font-serif text-lg text-or-principal">
        Bienvenue dans le Club Terminal 3 ✓
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-analytics-event="club_signup_started"
        className="rounded-sm bg-or-principal px-10 py-3 text-sm font-semibold uppercase tracking-widest text-noir-profond transition-colors hover:bg-or-clair"
      >
        Rejoindre gratuitement
      </button>
    );
  }

  function togglePreference(value: string) {
    setPreferences((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value],
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await joinClub({
        firstName: String(formData.get("firstName") || ""),
        lastName: String(formData.get("lastName") || ""),
        phone: String(formData.get("phone") || ""),
        email: String(formData.get("email") || ""),
        dateOfBirth: String(formData.get("dateOfBirth") || "") || undefined,
        preferredLanguage: (formData.get("preferredLanguage") as "fr" | "he" | "en") || "fr",
        preferences,
        marketingConsent: formData.get("marketingConsent") === "on",
        privacyAccepted: formData.get("privacyAccepted") === "on",
      });

      if (!result.success) {
        setError(result.error ?? "Une erreur est survenue.");
        return;
      }
      setJoined(true);
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-4 rounded-sm border border-or-principal/20 bg-noir-chaud/60 p-6 text-left"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-xs text-texte-clair/80">
          Prénom
          <input
            name="firstName"
            required
            className="rounded-sm border border-or-principal/20 bg-noir-profond px-3 py-2.5 text-sm text-texte-clair outline-none focus:border-or-principal"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs text-texte-clair/80">
          Nom
          <input
            name="lastName"
            required
            className="rounded-sm border border-or-principal/20 bg-noir-profond px-3 py-2.5 text-sm text-texte-clair outline-none focus:border-or-principal"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs text-texte-clair/80">
          Téléphone
          <input
            name="phone"
            type="tel"
            required
            className="rounded-sm border border-or-principal/20 bg-noir-profond px-3 py-2.5 text-sm text-texte-clair outline-none focus:border-or-principal"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs text-texte-clair/80">
          E-mail
          <input
            name="email"
            type="email"
            required
            defaultValue={defaultEmail ?? ""}
            className="rounded-sm border border-or-principal/20 bg-noir-profond px-3 py-2.5 text-sm text-texte-clair outline-none focus:border-or-principal"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs text-texte-clair/80">
          Date de naissance (facultatif)
          <input
            name="dateOfBirth"
            type="date"
            className="rounded-sm border border-or-principal/20 bg-noir-profond px-3 py-2.5 text-sm text-texte-clair outline-none focus:border-or-principal"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs text-texte-clair/80">
          Langue préférée
          <select
            name="preferredLanguage"
            defaultValue="fr"
            className="rounded-sm border border-or-principal/20 bg-noir-profond px-3 py-2.5 text-sm text-texte-clair outline-none focus:border-or-principal"
          >
            <option value="fr">Français</option>
            <option value="he">עברית</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>

      <fieldset>
        <legend className="text-xs uppercase tracking-widest text-texte-clair/60">
          Préférences
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {PREFERENCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-pressed={preferences.includes(opt.value)}
              onClick={() => togglePreference(opt.value)}
              className={`rounded-sm border px-3 py-1.5 text-xs transition-colors ${
                preferences.includes(opt.value)
                  ? "border-or-principal bg-or-principal text-noir-profond"
                  : "border-or-principal/25 text-texte-clair/80 hover:border-or-principal/60"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex items-start gap-2 text-xs text-texte-clair/70">
        <input type="checkbox" name="marketingConsent" className="mt-0.5 h-4 w-4" />
        J&rsquo;accepte de recevoir les communications du Club Terminal 3.
      </label>
      <label className="flex items-start gap-2 text-xs text-texte-clair/70">
        <input type="checkbox" name="privacyAccepted" required className="mt-0.5 h-4 w-4" />
        J&rsquo;accepte la{" "}
        <a href="/confidentialite" className="text-or-principal underline-offset-2 hover:underline">
          politique de confidentialité
        </a>
        .
      </label>

      {error && <p className="text-xs text-bordeaux-clair">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-sm bg-or-principal px-6 py-3 text-sm font-semibold uppercase tracking-widest text-noir-profond transition-colors hover:bg-or-clair disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Envoi..." : "Confirmer mon inscription"}
      </button>
    </form>
  );
}
