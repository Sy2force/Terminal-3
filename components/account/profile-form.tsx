"use client";

import { useState } from "react";
import { updateProfile } from "@/app/account/actions";

export function ProfileForm({
  initialFirstName,
  initialLastName,
  initialPhone,
}: {
  initialFirstName: string;
  initialLastName: string;
  initialPhone: string;
}) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phone, setPhone] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const result = await updateProfile({ firstName, lastName, phone });
    setSaving(false);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-ivory/80">
          Prénom
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="rounded-sm border border-white/10 bg-graphite px-4 py-3 text-ivory outline-none focus:border-champagne"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-ivory/80">
          Nom
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="rounded-sm border border-white/10 bg-graphite px-4 py-3 text-ivory outline-none focus:border-champagne"
          />
        </label>
      </div>
      <label className="flex flex-col gap-2 text-sm text-ivory/80">
        Téléphone
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded-sm border border-white/10 bg-graphite px-4 py-3 text-ivory outline-none focus:border-champagne"
        />
      </label>
      <button
        type="submit"
        disabled={saving}
        className="mt-1 w-fit rounded-full bg-champagne px-6 py-2.5 text-sm font-semibold tracking-wide text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-50"
      >
        {saving ? "..." : saved ? "Enregistré ✓" : "Enregistrer"}
      </button>
    </form>
  );
}
