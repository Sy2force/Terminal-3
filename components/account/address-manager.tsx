"use client";

import { useState, useTransition } from "react";
import { Star, Trash2 } from "lucide-react";
import { addAddress, deleteAddress, setDefaultAddress } from "@/app/compte/adresses/actions";

export interface AddressRow {
  id: string;
  city: string;
  street: string;
  buildingNumber: string;
  apartment: string | null;
  postalCode: string | null;
  deliveryInstructions: string | null;
  isDefault: boolean;
}

export function AddressManager({ initialAddresses }: { initialAddresses: AddressRow[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(initialAddresses.length === 0);
  const [form, setForm] = useState({
    city: "",
    street: "",
    buildingNumber: "",
    apartment: "",
    postalCode: "",
    deliveryInstructions: "",
    isDefault: initialAddresses.length === 0,
  });
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = await addAddress(form);
    if (!result.success) {
      setError(result.error ?? "Erreur.");
      return;
    }
    setForm({ city: "", street: "", buildingNumber: "", apartment: "", postalCode: "", deliveryInstructions: "", isDefault: false });
    setShowForm(false);
    // Optimistic-ish: rely on server revalidation via full page reload of list.
    window.location.reload();
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    });
  }

  function handleSetDefault(id: string) {
    startTransition(async () => {
      await setDefaultAddress(id);
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {addresses.map((address) => (
        <div
          key={address.id}
          className="flex items-start justify-between gap-4 rounded-sm border border-white/5 bg-graphite p-5"
        >
          <div>
            <p className="flex items-center gap-2 text-sm text-ivory">
              {address.street} {address.buildingNumber}
              {address.isDefault && (
                <span className="rounded-full bg-champagne/15 px-2 py-0.5 text-xs text-champagne">
                  Par défaut
                </span>
              )}
            </p>
            <p className="mt-1 text-xs text-muted-grey">
              {address.apartment ? `Étage/appt. ${address.apartment} · ` : ""}
              {address.city}
              {address.postalCode ? ` ${address.postalCode}` : ""}
            </p>
            {address.deliveryInstructions && (
              <p className="mt-1 text-xs text-muted-grey">{address.deliveryInstructions}</p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            {!address.isDefault && (
              <button
                type="button"
                onClick={() => handleSetDefault(address.id)}
                disabled={isPending}
                className="rounded-full border border-white/10 p-2 text-champagne hover:border-champagne/40"
                aria-label="Définir par défaut"
              >
                <Star className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => handleDelete(address.id)}
              disabled={isPending}
              className="rounded-full border border-white/10 p-2 text-red-400 hover:border-red-400/40"
              aria-label="Supprimer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}

      {showForm ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-sm border border-white/10 bg-graphite p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <input required placeholder="Ville" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-sm border border-white/10 bg-obsidian px-4 py-2.5 text-sm text-ivory outline-none focus:border-champagne" />
            <input required placeholder="Rue" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="rounded-sm border border-white/10 bg-obsidian px-4 py-2.5 text-sm text-ivory outline-none focus:border-champagne" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <input required placeholder="Numéro" value={form.buildingNumber} onChange={(e) => setForm({ ...form, buildingNumber: e.target.value })} className="rounded-sm border border-white/10 bg-obsidian px-4 py-2.5 text-sm text-ivory outline-none focus:border-champagne" />
            <input placeholder="Étage / appt." value={form.apartment} onChange={(e) => setForm({ ...form, apartment: e.target.value })} className="rounded-sm border border-white/10 bg-obsidian px-4 py-2.5 text-sm text-ivory outline-none focus:border-champagne" />
            <input placeholder="Code postal" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className="rounded-sm border border-white/10 bg-obsidian px-4 py-2.5 text-sm text-ivory outline-none focus:border-champagne" />
          </div>
          <textarea placeholder="Instructions de livraison (facultatif)" rows={2} value={form.deliveryInstructions} onChange={(e) => setForm({ ...form, deliveryInstructions: e.target.value })} className="rounded-sm border border-white/10 bg-obsidian px-4 py-2.5 text-sm text-ivory outline-none focus:border-champagne" />
          <label className="flex items-center gap-2 text-sm text-ivory/80">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
            Adresse par défaut
          </label>
          {error && <p className="text-sm text-amber-400">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="rounded-full bg-champagne px-5 py-2.5 text-sm font-semibold text-obsidian hover:bg-soft-gold">
              Ajouter
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-ivory/70">
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded-full border border-champagne/40 px-5 py-2.5 text-sm font-medium text-champagne hover:bg-champagne/10"
        >
          + Ajouter une adresse
        </button>
      )}
    </div>
  );
}
