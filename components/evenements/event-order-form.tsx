"use client";

import { useActionState, useState } from "react";
import { createEventOrder } from "@/app/evenements/actions";
import { GlassButton } from "@/components/ui/glass-button";

const PRODUCT_OPTIONS = [
  { key: "vins", label: "Vins" },
  { key: "spiritueux", label: "Spiritueux" },
  { key: "saumon-fume", label: "Saumon fumé" },
  { key: "charcuterie", label: "Charcuterie" },
  { key: "plateaux", label: "Plateaux" },
];

const EVENT_TYPES = [
  "Mariage",
  "Fiançailles",
  "Brit mila",
  "Shabbat Hatan",
  "Anniversaire",
  "Fête familiale",
  "Soirée privée",
  "Repas de Shabbat",
  "Fête juive",
  "Événement professionnel",
  "Restaurant ou hôtel",
  "Grande commande",
];

export function EventOrderForm() {
  const [state, formAction, isPending] = useActionState(createEventOrder, null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(PRODUCT_OPTIONS.map((p) => p.key));
  const [formData, setFormData] = useState({
    event_type: EVENT_TYPES[0],
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    preferred_contact: "phone",
    event_date: "",
    event_time: "",
    guests_count: "",
    budget_agorot: "",
    fulfillment_type: "delivery",
    city: "",
    delivery_address: "",
    delivery_instructions: "",
    notes: "",
  });

  if (state?.success) {
    return (
      <div className="rounded-sm border border-champagne/20 bg-warm-black/10 p-8 text-center">
        <h3 className="font-serif text-2xl text-ivory">Demande envoyée</h3>
        <p className="mt-4 text-ivory/80">
          Merci, votre demande a bien été transmise à Terminal 3.
        </p>
        <p className="mt-2 font-mono text-or-principal">{state.reference}</p>
        <p className="mt-2 text-sm text-ivory/60">
          Notre équipe va vérifier les produits et les conditions de livraison.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.success === false && (
        <p className="rounded-sm border border-[#9B3444]/30 bg-[#9B3444]/10 p-3 text-sm text-[#9B3444]">
          {state.error}
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ivory">Type d&apos;événement</label>
          <select
            name="event_type"
            value={formData.event_type}
            onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
            className="w-full rounded-sm border border-champagne/20 bg-warm-black/30 px-4 py-3 text-ivory outline-none focus:border-champagne"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ivory">Nom complet</label>
          <input
            required
            name="customer_name"
            value={formData.customer_name}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            className="w-full rounded-sm border border-champagne/20 bg-warm-black/30 px-4 py-3 text-ivory outline-none focus:border-champagne"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ivory">Téléphone</label>
          <input
            required
            type="tel"
            name="customer_phone"
            value={formData.customer_phone}
            onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
            className="w-full rounded-sm border border-champagne/20 bg-warm-black/30 px-4 py-3 text-ivory outline-none focus:border-champagne"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ivory">E-mail</label>
          <input
            type="email"
            name="customer_email"
            value={formData.customer_email}
            onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
            className="w-full rounded-sm border border-champagne/20 bg-warm-black/30 px-4 py-3 text-ivory outline-none focus:border-champagne"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ivory">Date</label>
          <input
            type="date"
            name="event_date"
            value={formData.event_date}
            onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
            className="w-full rounded-sm border border-champagne/20 bg-warm-black/30 px-4 py-3 text-ivory outline-none focus:border-champagne"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ivory">Nombre d&apos;invités</label>
          <input
            type="number"
            name="guests_count"
            min={1}
            value={formData.guests_count}
            onChange={(e) => setFormData({ ...formData, guests_count: e.target.value })}
            className="w-full rounded-sm border border-champagne/20 bg-warm-black/30 px-4 py-3 text-ivory outline-none focus:border-champagne"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ivory">Mode</label>
          <select
            name="fulfillment_type"
            value={formData.fulfillment_type}
            onChange={(e) => setFormData({ ...formData, fulfillment_type: e.target.value as "delivery" | "pickup" })}
            className="w-full rounded-sm border border-champagne/20 bg-warm-black/30 px-4 py-3 text-ivory outline-none focus:border-champagne"
          >
            <option value="delivery">Livraison</option>
            <option value="pickup">Retrait au magasin</option>
          </select>
        </div>

        {formData.fulfillment_type === "delivery" && (
          <>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ivory">Ville</label>
              <input
                name="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-sm border border-champagne/20 bg-warm-black/30 px-4 py-3 text-ivory outline-none focus:border-champagne"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-ivory">Adresse</label>
              <input
                name="delivery_address"
                value={formData.delivery_address}
                onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                className="w-full rounded-sm border border-champagne/20 bg-warm-black/30 px-4 py-3 text-ivory outline-none focus:border-champagne"
              />
            </div>
          </>
        )}

        <div className="sm:col-span-2">
          <label className="mb-3 block text-sm font-medium text-ivory">Produits souhaités</label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PRODUCT_OPTIONS.map((p) => (
              <label
                key={p.key}
                className="flex cursor-pointer items-center gap-3 rounded-sm border border-champagne/20 bg-warm-black/30 px-4 py-3 text-ivory transition-colors hover:border-champagne/40"
              >
                <input
                  type="checkbox"
                  name="product_option"
                  value={p.key}
                  checked={selectedProducts.includes(p.key)}
                  onChange={(e) => {
                    setSelectedProducts((prev) =>
                      e.target.checked ? [...prev, p.key] : prev.filter((k) => k !== p.key)
                    );
                  }}
                  className="h-4 w-4 accent-or-principal"
                />
                <span className="text-sm">{p.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-ivory">Commentaire</label>
          <textarea
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full rounded-sm border border-champagne/20 bg-warm-black/30 px-4 py-3 text-ivory outline-none focus:border-champagne"
          />
        </div>
      </div>

      <input
        type="hidden"
        name="items"
        value={JSON.stringify(
          selectedProducts.length
            ? selectedProducts.map((key) => ({
                product_id: null,
                product_name: PRODUCT_OPTIONS.find((p) => p.key === key)?.label ?? key,
                quantity: 1,
                unit_price_agorot: 0,
                total_price_agorot: 0,
              }))
            : [
                {
                  product_id: null,
                  product_name: "Sélection à préciser avec le client",
                  quantity: 1,
                  unit_price_agorot: 0,
                  total_price_agorot: 0,
                },
              ]
        )}
      />
      <input type="hidden" name="preferred_contact" value={formData.preferred_contact} />

      <GlassButton type="submit" variant="gold" disabled={isPending}>
        {isPending ? "Envoi en cours…" : "Envoyer à Terminal 3"}
      </GlassButton>
    </form>
  );
}
