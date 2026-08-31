"use client";

import { useState, useTransition } from "react";
import { updateBarStatusAction } from "@/app/admin/bars/[id]/actions";
import type { BarStatus } from "@/types/database";

const STATUSES: { value: BarStatus; label: string }[] = [
  { value: "new", label: "Nouveau" },
  { value: "contacted", label: "Contacté" },
  { value: "qualified", label: "Qualifié" },
  { value: "approved", label: "Approuvé" },
  { value: "inactive", label: "Inactif" },
];

export function BarStatusControls({
  barProfileId,
  currentStatus,
}: {
  barProfileId: string;
  currentStatus: BarStatus;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<BarStatus>(currentStatus);

  function handleChange(next: BarStatus) {
    if (next === status) return;
    setError(null);
    const previous = status;
    setStatus(next); // optimistic
    startTransition(async () => {
      const result = await updateBarStatusAction(barProfileId, next);
      if (!result.success) {
        setStatus(previous);
        setError(result.error ?? "Erreur inconnue.");
      }
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((s) => {
          const active = s.value === status;
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => handleChange(s.value)}
              disabled={pending}
              className={`rounded-sm px-3 py-1.5 text-xs font-medium uppercase tracking-widest transition-colors disabled:opacity-50 ${
                active
                  ? "bg-[#692031] text-[#F7F0E4]"
                  : "border border-[#E7DECE] text-[#151411] hover:border-[#C6A15B]"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-2 text-xs text-amber-700">{error}</p>}
    </div>
  );
}
