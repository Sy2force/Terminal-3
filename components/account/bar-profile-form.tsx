"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, Store } from "lucide-react";
import { upsertMyBarProfile } from "@/app/compte/bar/actions";
import type { BarProfileRow, BarStatus } from "@/types/database";

const inputClass =
  "rounded-sm border border-white/10 bg-graphite px-4 py-3 text-ivory outline-none focus:border-champagne";

const STATUS_LABEL: Record<BarStatus, string> = {
  new: "Nouveau · en attente de contact",
  contacted: "Contacté par Terminal 3",
  qualified: "Qualifié",
  approved: "Approuvé — vous pouvez commander",
  inactive: "Inactif",
};

const STATUS_COLOR: Record<BarStatus, string> = {
  new: "text-champagne",
  contacted: "text-champagne",
  qualified: "text-amber-400",
  approved: "text-emerald-400",
  inactive: "text-muted-grey",
};

export function BarProfileForm({ initial }: { initial: BarProfileRow | null }) {
  const [form, setForm] = useState({
    businessName: initial?.business_name ?? "",
    legalName: initial?.legal_name ?? "",
    registrationNumber: initial?.registration_number ?? "",
    contactFirstName: initial?.contact_first_name ?? "",
    contactLastName: initial?.contact_last_name ?? "",
    contactPhone: initial?.contact_phone ?? "",
    whatsappNumber: initial?.whatsapp_number ?? "",
    contactEmail: initial?.contact_email ?? "",
    address: initial?.address ?? "",
    city: initial?.city ?? "",
    postalCode: initial?.postal_code ?? "",
    preferredContactWindow: initial?.preferred_contact_window ?? "",
    pickupPreference: (initial?.pickup_preference ??
      "self") as "self" | "delegate" | "delivery_when_available",
    notes: initial?.notes ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<
    { type: "success" | "error"; text: string } | null
  >(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    const result = await upsertMyBarProfile({
      businessName: form.businessName,
      legalName: form.legalName || undefined,
      registrationNumber: form.registrationNumber || undefined,
      contactFirstName: form.contactFirstName,
      contactLastName: form.contactLastName,
      contactPhone: form.contactPhone,
      whatsappNumber: form.whatsappNumber || undefined,
      contactEmail: form.contactEmail || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
      postalCode: form.postalCode || undefined,
      preferredContactWindow: form.preferredContactWindow || undefined,
      pickupPreference: form.pickupPreference,
      notes: form.notes || undefined,
    });

    setSubmitting(false);
    if (!result.success) {
      setMessage({ type: "error", text: result.error ?? "Erreur inconnue." });
      return;
    }
    setMessage({
      type: "success",
      text: initial
        ? "Fiche mise à jour."
        : "Fiche enregistrée. Notre équipe vous contactera rapidement.",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
      {initial && (
        <div className="rounded-sm border border-white/5 bg-graphite/40 p-4">
          <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-grey">
            <Store className="h-3.5 w-3.5" /> Statut
          </p>
          <p className={`mt-1.5 text-sm font-medium ${STATUS_COLOR[initial.status]}`}>
            {STATUS_LABEL[initial.status]}
          </p>
          {initial.status !== "approved" && (
            <p className="mt-2 text-xs text-muted-grey">
              Vous pouvez déjà envoyer des demandes de produits. La commande
              professionnelle sera activée après validation par notre équipe.
            </p>
          )}
        </div>
      )}

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="col-span-2 mb-2 font-serif text-lg text-ivory">
          Identité du bar / de l&rsquo;entreprise
        </legend>
        <label className="flex flex-col gap-2 text-sm text-ivory/80 sm:col-span-2">
          Nom commercial
          <input
            required
            value={form.businessName}
            onChange={(e) => set("businessName", e.target.value)}
            className={inputClass}
            placeholder="Ex : Bar Rothschild"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-ivory/80">
          Raison sociale (si différente)
          <input
            value={form.legalName}
            onChange={(e) => set("legalName", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-ivory/80">
          N° d&rsquo;entreprise (ח״פ / עוסק)
          <input
            value={form.registrationNumber}
            onChange={(e) => set("registrationNumber", e.target.value)}
            className={inputClass}
          />
        </label>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="col-span-2 mb-2 font-serif text-lg text-ivory">Contact principal</legend>
        <label className="flex flex-col gap-2 text-sm text-ivory/80">
          Prénom
          <input
            required
            value={form.contactFirstName}
            onChange={(e) => set("contactFirstName", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-ivory/80">
          Nom
          <input
            required
            value={form.contactLastName}
            onChange={(e) => set("contactLastName", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-ivory/80">
          Téléphone
          <input
            required
            type="tel"
            placeholder="05X-XXXXXXX"
            value={form.contactPhone}
            onChange={(e) => set("contactPhone", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-ivory/80">
          WhatsApp (si différent)
          <input
            type="tel"
            value={form.whatsappNumber}
            onChange={(e) => set("whatsappNumber", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-ivory/80 sm:col-span-2">
          Email
          <input
            type="email"
            value={form.contactEmail}
            onChange={(e) => set("contactEmail", e.target.value)}
            className={inputClass}
          />
        </label>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="col-span-2 mb-2 font-serif text-lg text-ivory">Adresse du bar</legend>
        <label className="flex flex-col gap-2 text-sm text-ivory/80 sm:col-span-2">
          Adresse
          <input
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-ivory/80">
          Ville
          <input
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-ivory/80">
          Code postal
          <input
            value={form.postalCode}
            onChange={(e) => set("postalCode", e.target.value)}
            className={inputClass}
          />
        </label>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="col-span-2 mb-2 font-serif text-lg text-ivory">Préférences</legend>
        <label className="flex flex-col gap-2 text-sm text-ivory/80">
          Plage horaire préférée pour être contacté
          <input
            value={form.preferredContactWindow}
            onChange={(e) => set("preferredContactWindow", e.target.value)}
            className={inputClass}
            placeholder="Ex : 10h – 14h"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-ivory/80">
          Méthode de retrait préférée
          <select
            value={form.pickupPreference}
            onChange={(e) =>
              set("pickupPreference", e.target.value as typeof form.pickupPreference)
            }
            className={inputClass}
          >
            <option value="self">Je viens moi-même récupérer</option>
            <option value="delegate">Un employé viendra pour moi</option>
            <option value="delivery_when_available">Livraison quand disponible</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm text-ivory/80 sm:col-span-2">
          Notes (facultatif)
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            className={inputClass}
            placeholder="Type d'établissement, volume moyen, produits recherchés..."
          />
        </label>
      </fieldset>

      {message && (
        <p
          className={`flex items-start gap-2 text-sm ${
            message.type === "success" ? "text-emerald-400" : "text-amber-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="mt-0.5 h-4 w-4" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4" />
          )}
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-champagne px-6 py-3 text-sm font-semibold text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-50 sm:self-start"
      >
        {submitting ? "Enregistrement..." : initial ? "Mettre à jour" : "Enregistrer ma fiche pro"}
      </button>
    </form>
  );
}
