"use client";

import { useState, useEffect } from "react";
import {
  saveNavigationItem,
  deleteNavigationItem,
  getNavigationItems,
  type NavItemInput,
} from "@/app/admin/navigation/actions";
import type { NavigationMenuRow, NavigationItemRow } from "@/types/database";

export function NavigationManager({ menus }: { menus: NavigationMenuRow[] }) {
  const [selectedMenu, setSelectedMenu] = useState(menus[0]?.id ?? "");
  const [items, setItems] = useState<NavigationItemRow[]>([]);
  const [form, setForm] = useState<NavItemInput & { id?: string }>({
    menu_id: selectedMenu,
    label_fr: "",
    label_he: "",
    href: "",
    target: "_self",
    display_order: 0,
    is_active: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedMenu) return;
    getNavigationItems(selectedMenu).then(setItems);
  }, [selectedMenu]);

  function reset() {
    setEditingId(null);
    setForm({
      menu_id: selectedMenu,
      label_fr: "",
      label_he: "",
      href: "",
      target: "_self",
      display_order: items.length,
      is_active: true,
    });
  }

  function startEdit(item: NavigationItemRow) {
    setEditingId(item.id);
    setForm({
      id: item.id,
      menu_id: item.menu_id,
      parent_id: item.parent_id ?? undefined,
      label_fr: item.label_fr,
      label_he: item.label_he ?? undefined,
      href: item.href,
      target: (item.target as "_self" | "_blank") ?? "_self",
      icon_url: item.icon_url ?? undefined,
      display_order: item.display_order,
      is_active: item.is_active,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!form.label_fr.trim() || !form.href.trim()) {
      setError("Libellé et lien obligatoires.");
      return;
    }
    const result = await saveNavigationItem({ ...form, menu_id: selectedMenu });
    if (!result.success) {
      setError(result.error ?? "Erreur.");
      return;
    }
    setMessage(editingId ? "Lien mis à jour." : "Lien créé.");
    reset();
    const fresh = await getNavigationItems(selectedMenu);
    setItems(fresh);
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce lien ?")) return;
    setError(null);
    const result = await deleteNavigationItem(id);
    if (!result.success) {
      setError(result.error ?? "Erreur.");
      return;
    }
    setItems(await getNavigationItems(selectedMenu));
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex gap-3">
        {menus.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMenu(m.id)}
            className={`rounded-full px-4 py-2 text-sm ${
              selectedMenu === m.id
                ? "bg-or-principal text-noir-profond"
                : "border border-beige-fonce text-noir-profond hover:border-champagne"
            }`}
          >
            {m.name_fr}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="rounded-sm border border-beige-fonce bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            placeholder="Libellé (fr)"
            value={form.label_fr}
            onChange={(e) => setForm({ ...form, label_fr: e.target.value })}
            className="rounded-sm border border-beige-fonce bg-fond-papier px-3 py-2 text-sm text-noir-profond"
          />
          <input
            placeholder="Libellé (he)"
            value={form.label_he}
            onChange={(e) => setForm({ ...form, label_he: e.target.value })}
            className="rounded-sm border border-beige-fonce bg-fond-papier px-3 py-2 text-sm text-noir-profond"
          />
          <input
            placeholder="Lien / URL"
            value={form.href}
            onChange={(e) => setForm({ ...form, href: e.target.value })}
            className="sm:col-span-2 rounded-sm border border-beige-fonce bg-fond-papier px-3 py-2 text-sm text-noir-profond"
          />
          <select
            value={form.target}
            onChange={(e) => setForm({ ...form, target: e.target.value as "_self" | "_blank" })}
            className="rounded-sm border border-beige-fonce bg-fond-papier px-3 py-2 text-sm text-noir-profond"
          >
            <option value="_self">Même onglet</option>
            <option value="_blank">Nouvel onglet</option>
          </select>
          <input
            type="number"
            placeholder="Ordre"
            value={form.display_order}
            onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
            className="rounded-sm border border-beige-fonce bg-fond-papier px-3 py-2 text-sm text-noir-profond"
          />
          <label className="flex items-center gap-2 text-sm text-noir-profond sm:col-span-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Actif
          </label>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            className="rounded-full bg-or-principal px-6 py-2.5 text-sm font-semibold text-noir-profond hover:bg-or-clair"
          >
            {editingId ? "Mettre à jour" : "Ajouter"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-beige-fonce px-4 py-2.5 text-sm text-noir-profond hover:border-champagne"
            >
              Annuler
            </button>
          )}
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        {message && <p className="mt-3 text-sm text-green-400">{message}</p>}
      </form>

      <div className="overflow-x-auto rounded-sm border border-beige-fonce">
        <table className="w-full text-left text-sm">
          <thead className="bg-white text-noir-profond/70">
            <tr>
              <th className="px-4 py-3">Libellé</th>
              <th className="px-4 py-3">Lien</th>
              <th className="px-4 py-3">Cible</th>
              <th className="px-4 py-3">Ordre</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-beige-fonce last:border-0">
                <td className="px-4 py-3 text-noir-profond">
                  {item.label_fr}
                  {item.label_he && <span className="ml-2 text-xs text-gris-chaud">{item.label_he}</span>}
                </td>
                <td className="px-4 py-3 text-gris-chaud">{item.href}</td>
                <td className="px-4 py-3 text-gris-chaud">{item.target}</td>
                <td className="px-4 py-3 text-gris-chaud">{item.display_order}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => startEdit(item)}
                    className="mr-3 text-xs text-or-principal hover:underline"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => remove(item.id)}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Supprimer
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
