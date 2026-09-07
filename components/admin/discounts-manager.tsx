"use client";

import { useState } from "react";
import { createDiscountRule, toggleDiscountRule } from "@/app/admin/discounts/actions";
import { formatAgorot } from "@/lib/money";

export interface DiscountRuleRow {
  id: string;
  code: string | null;
  nameFr: string;
  discountType: "percent" | "fixed_amount";
  discountValue: number;
  minOrderAgorot: number;
  isActive: boolean;
}

export function DiscountsManager({ initialRules }: { initialRules: DiscountRuleRow[] }) {
  const [rules, setRules] = useState(initialRules);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "",
    nameFr: "",
    discountType: "percent" as "percent" | "fixed_amount",
    discountValue: "",
    minOrderAgorot: "0",
    maxUses: "",
    maxUsesPerCustomer: "1",
    stackable: false,
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = await createDiscountRule({
      code: form.code || undefined,
      nameFr: form.nameFr,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrderAgorot: Math.round(Number(form.minOrderAgorot) * 100),
      maxUses: form.maxUses ? Number(form.maxUses) : undefined,
      maxUsesPerCustomer: Number(form.maxUsesPerCustomer),
      stackable: form.stackable,
    });
    if (!result.success) {
      setError(result.error ?? "Erreur.");
      return;
    }
    window.location.reload();
  }

  async function handleToggle(id: string, isActive: boolean) {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, isActive } : r)));
    await toggleDiscountRule(id, isActive);
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setShowForm((v) => !v)}
        className="rounded-full border border-or-principal/40 px-4 py-2 text-xs text-or-principal hover:bg-or-principal/10"
      >
        + Nouvelle remise
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="flex flex-wrap gap-3 rounded-sm border border-beige-fonce bg-white p-5">
          <input required placeholder="Nom" value={form.nameFr} onChange={(e) => setForm({ ...form, nameFr: e.target.value })} className="rounded-sm border border-beige-fonce bg-fond-papier px-3 py-2 text-sm text-noir-profond" />
          <input placeholder="Code (facultatif)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="rounded-sm border border-beige-fonce bg-fond-papier px-3 py-2 text-sm text-noir-profond" />
          <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as "percent" | "fixed_amount" })} className="rounded-sm border border-beige-fonce bg-fond-papier px-3 py-2 text-sm text-noir-profond">
            <option value="percent">Pourcentage</option>
            <option value="fixed_amount">Montant fixe (₪)</option>
          </select>
          <input required type="number" step="0.01" placeholder="Valeur" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} className="w-28 rounded-sm border border-beige-fonce bg-fond-papier px-3 py-2 text-sm text-noir-profond" />
          <input type="number" placeholder="Montant min. (₪)" value={form.minOrderAgorot} onChange={(e) => setForm({ ...form, minOrderAgorot: e.target.value })} className="w-32 rounded-sm border border-beige-fonce bg-fond-papier px-3 py-2 text-sm text-noir-profond" />
          <input type="number" placeholder="Utilisations max." value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} className="w-36 rounded-sm border border-beige-fonce bg-fond-papier px-3 py-2 text-sm text-noir-profond" />
          <input type="number" placeholder="Max par client" value={form.maxUsesPerCustomer} onChange={(e) => setForm({ ...form, maxUsesPerCustomer: e.target.value })} className="w-32 rounded-sm border border-beige-fonce bg-fond-papier px-3 py-2 text-sm text-noir-profond" />
          <label className="flex items-center gap-2 text-sm text-noir-profond/80">
            <input type="checkbox" checked={form.stackable} onChange={(e) => setForm({ ...form, stackable: e.target.checked })} />
            Cumulable
          </label>
          <button type="submit" className="rounded-full bg-or-principal px-6 py-2 text-sm font-semibold text-noir-profond">Créer</button>
          {error && <p className="w-full text-sm text-amber-700">{error}</p>}
        </form>
      )}

      {rules.length === 0 ? (
        <div className="rounded-sm border border-beige-fonce bg-white p-12 text-center text-sm text-gris-chaud">
          Aucune remise configurée.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-beige-fonce">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-beige-fonce text-xs uppercase tracking-wide text-gris-chaud">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Valeur</th>
                <th className="px-4 py-3">Min. commande</th>
                <th className="px-4 py-3">Actif</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id} className="border-b border-beige-fonce last:border-0">
                  <td className="px-4 py-3 text-noir-profond">{rule.nameFr}</td>
                  <td className="px-4 py-3 text-xs text-gris-chaud">{rule.code ?? "—"}</td>
                  <td className="px-4 py-3 text-or-principal">
                    {rule.discountType === "percent" ? `${rule.discountValue}%` : formatAgorot(rule.discountValue * 100)}
                  </td>
                  <td className="px-4 py-3 text-noir-profond/70">{formatAgorot(rule.minOrderAgorot)}</td>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={rule.isActive} onChange={(e) => handleToggle(rule.id, e.target.checked)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
