"use client";

import { useState } from "react";
import { createBrand, updateBrand, type BrandFormData } from "@/app/admin/brands/actions";
import type { BrandRow } from "@/types/database";

export function BrandsManager({ brands }: { brands: BrandRow[] }) {
  const [form, setForm] = useState<BrandFormData & { id?: string }>({
    name: "",
    name_he: "",
    slug: "",
    description: "",
    logo_url: "",
    cover_image_url: "",
    website_url: "",
    is_active: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function startEdit(brand: BrandRow) {
    setEditingId(brand.id);
    setForm({
      name: brand.name,
      name_he: brand.name_he ?? "",
      slug: brand.slug,
      description: brand.description ?? "",
      logo_url: brand.logo_url ?? "",
      cover_image_url: brand.cover_image_url ?? "",
      website_url: brand.website_url ?? "",
      is_active: brand.is_active,
    });
  }

  function reset() {
    setEditingId(null);
    setForm({
      name: "",
      name_he: "",
      slug: "",
      description: "",
      logo_url: "",
      cover_image_url: "",
      website_url: "",
      is_active: true,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!form.name.trim()) {
      setError("Le nom est obligatoire.");
      return;
    }
    const result = editingId
      ? await updateBrand(editingId, form)
      : await createBrand(form);
    if (!result.success) {
      setError(result.error ?? "Erreur.");
      return;
    }
    setMessage(editingId ? "Marque mise à jour." : "Marque créée.");
    reset();
    window.location.reload();
  }

  return (
    <div className="mt-8 space-y-6">
      <form onSubmit={handleSubmit} className="rounded-sm border border-white/10 bg-graphite p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            required
            placeholder="Nom (français)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-sm border border-white/10 bg-obsidian px-3 py-2 text-sm text-ivory"
          />
          <input
            placeholder="Nom (hébreu)"
            value={form.name_he}
            onChange={(e) => setForm({ ...form, name_he: e.target.value })}
            className="rounded-sm border border-white/10 bg-obsidian px-3 py-2 text-sm text-ivory"
          />
          <input
            placeholder="Slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="rounded-sm border border-white/10 bg-obsidian px-3 py-2 text-sm text-ivory"
          />
          <input
            placeholder="Site web"
            value={form.website_url}
            onChange={(e) => setForm({ ...form, website_url: e.target.value })}
            className="rounded-sm border border-white/10 bg-obsidian px-3 py-2 text-sm text-ivory"
          />
          <input
            placeholder="URL du logo"
            value={form.logo_url}
            onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
            className="sm:col-span-2 rounded-sm border border-white/10 bg-obsidian px-3 py-2 text-sm text-ivory"
          />
          <input
            placeholder="URL de l'image de couverture"
            value={form.cover_image_url}
            onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
            className="sm:col-span-2 rounded-sm border border-white/10 bg-obsidian px-3 py-2 text-sm text-ivory"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="sm:col-span-2 rounded-sm border border-white/10 bg-obsidian px-3 py-2 text-sm text-ivory"
            rows={3}
          />
          <label className="flex items-center gap-2 text-sm text-ivory">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Active
          </label>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            className="rounded-full bg-champagne px-6 py-2.5 text-sm font-semibold text-obsidian hover:bg-soft-gold"
          >
            {editingId ? "Mettre à jour" : "Créer"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-white/10 px-4 py-2.5 text-sm text-ivory hover:border-champagne"
            >
              Annuler
            </button>
          )}
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        {message && <p className="mt-3 text-sm text-green-400">{message}</p>}
      </form>

      <div className="overflow-x-auto rounded-sm border border-white/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-graphite text-ivory/70">
            <tr>
              <th className="px-4 py-3">Marque</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3 text-ivory">
                  {b.name}
                  {b.name_he && <span className="ml-2 text-xs text-muted-grey">{b.name_he}</span>}
                </td>
                <td className="px-4 py-3 text-muted-grey">{b.slug}</td>
                <td className="px-4 py-3">
                  {b.is_active ? (
                    <span className="text-xs text-green-400">Active</span>
                  ) : (
                    <span className="text-xs text-muted-grey">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => startEdit(b)}
                    className="text-xs text-champagne hover:underline"
                  >
                    Modifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
