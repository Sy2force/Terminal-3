"use client";

import { useState } from "react";
import { updateLoyaltyTier, adjustLoyaltyPoints } from "@/app/admin/loyalty/actions";
import { formatAgorot } from "@/lib/money";

export interface AdminLoyaltyTier {
  id: string;
  nameFr: string;
  minSpendAgorot: number;
  pointsMultiplier: number;
  isActive: boolean;
}

export function LoyaltyManager({ initialTiers }: { initialTiers: AdminLoyaltyTier[] }) {
  const [tiers, setTiers] = useState(initialTiers);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [adjustEmail, setAdjustEmail] = useState("");
  const [adjustPoints, setAdjustPoints] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustMessage, setAdjustMessage] = useState<string | null>(null);

  function updateTierField(id: string, field: keyof AdminLoyaltyTier, value: string | boolean) {
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  }

  async function handleSaveTier(tier: AdminLoyaltyTier) {
    setSavingId(tier.id);
    await updateLoyaltyTier({
      id: tier.id,
      minSpendAgorot: tier.minSpendAgorot,
      pointsMultiplier: tier.pointsMultiplier,
      isActive: tier.isActive,
    });
    setSavingId(null);
  }

  async function handleAdjust(e: React.FormEvent) {
    e.preventDefault();
    setAdjustMessage(null);
    const result = await adjustLoyaltyPoints({
      email: adjustEmail,
      deltaPoints: Number(adjustPoints),
      reason: adjustReason,
    });
    setAdjustMessage(result.success ? "Ajustement enregistré." : result.error ?? "Erreur.");
    if (result.success) {
      setAdjustEmail("");
      setAdjustPoints("");
      setAdjustReason("");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-lg text-noir-profond">Niveaux de fidélité</h2>
        <div className="mt-4 overflow-x-auto rounded-sm border border-beige-fonce">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-beige-fonce text-xs uppercase tracking-wide text-gris-chaud">
                <th className="px-4 py-3">Niveau</th>
                <th className="px-4 py-3">Seuil (₪)</th>
                <th className="px-4 py-3">Multiplicateur points</th>
                <th className="px-4 py-3">Actif</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => (
                <tr key={tier.id} className="border-b border-beige-fonce last:border-0">
                  <td className="px-4 py-3 text-noir-profond">{tier.nameFr}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={Math.round(tier.minSpendAgorot / 100)}
                      onChange={(e) => updateTierField(tier.id, "minSpendAgorot", String(Number(e.target.value) * 100))}
                      className="w-24 rounded-sm border border-beige-fonce bg-fond-papier px-2 py-1 text-sm text-noir-profond"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      step="0.1"
                      value={tier.pointsMultiplier}
                      onChange={(e) => updateTierField(tier.id, "pointsMultiplier", e.target.value)}
                      className="w-20 rounded-sm border border-beige-fonce bg-fond-papier px-2 py-1 text-sm text-noir-profond"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={tier.isActive}
                      onChange={(e) => updateTierField(tier.id, "isActive", e.target.checked)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleSaveTier(tier)}
                      disabled={savingId === tier.id}
                      className="rounded-full bg-or-principal px-4 py-1.5 text-xs font-semibold text-noir-profond disabled:opacity-50"
                    >
                      {savingId === tier.id ? "..." : "Enregistrer"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-gris-chaud">
          Le seuil est saisi en shekels (converti automatiquement en agorot). Exemple actuel :{" "}
          {tiers[0] ? formatAgorot(tiers[0].minSpendAgorot) : "—"}.
        </p>
      </div>

      <div>
        <h2 className="font-serif text-lg text-noir-profond">Ajustement manuel de points</h2>
        <form onSubmit={handleAdjust} className="mt-4 flex flex-wrap items-end gap-3 rounded-sm border border-beige-fonce bg-white p-5">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gris-chaud">Email du client</label>
            <input required type="email" value={adjustEmail} onChange={(e) => setAdjustEmail(e.target.value)} className="rounded-sm border border-beige-fonce bg-fond-papier px-4 py-2.5 text-sm text-noir-profond" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gris-chaud">Points (+/-)</label>
            <input required type="number" value={adjustPoints} onChange={(e) => setAdjustPoints(e.target.value)} className="w-28 rounded-sm border border-beige-fonce bg-fond-papier px-4 py-2.5 text-sm text-noir-profond" />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs text-gris-chaud">Motif (obligatoire)</label>
            <input required value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} className="w-full rounded-sm border border-beige-fonce bg-fond-papier px-4 py-2.5 text-sm text-noir-profond" />
          </div>
          <button type="submit" className="rounded-full bg-or-principal px-6 py-2.5 text-sm font-semibold text-noir-profond">
            Ajuster
          </button>
          {adjustMessage && <p className="w-full text-sm text-or-principal">{adjustMessage}</p>}
        </form>
      </div>
    </div>
  );
}
