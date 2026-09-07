"use client";

import { useState, useTransition } from "react";

export function DeliveryFeeEditor({ initialFeeAgorot }: { initialFeeAgorot: number }) {
  const [feeAgorot, setFeeAgorot] = useState(initialFeeAgorot);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "DELIVERY_FEE_AGOROT", value: feeAgorot }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  const ilsValue = (feeAgorot / 100).toFixed(0);

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor="delivery-fee" className="text-xs uppercase tracking-widest text-or-principal">
        Frais de livraison
      </label>
      <div className="flex items-center gap-3">
        <input
          id="delivery-fee"
          type="number"
          min={0}
          step={100}
          value={ilsValue}
          onChange={(e) => setFeeAgorot(Math.round(Number(e.target.value) * 100))}
          className="w-24 rounded-sm border border-beige-fonce bg-creme px-3 py-2 text-sm text-noir-profond"
        />
        <span className="text-sm text-gris-chaud">₪</span>
        <span className="text-xs text-gris-chaud">
          ({feeAgorot} agorot)
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={pending}
          className="rounded-full bg-or-principal px-4 py-2 text-xs font-semibold text-noir-profond disabled:opacity-50"
        >
          Enregistrer
        </button>
        {saved && <span className="text-xs text-or-principal">✓ Enregistré</span>}
      </div>
    </div>
  );
}
