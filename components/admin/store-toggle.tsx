"use client";

import { useState, useTransition } from "react";
import { setStoreOnline } from "@/app/admin/store/actions";

export function StoreToggle({ initialOnline }: { initialOnline: boolean }) {
  const [online, setOnline] = useState(initialOnline);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !online;
    setOnline(next);
    startTransition(async () => {
      try {
        await setStoreOnline(next);
      } catch {
        setOnline(!next);
      }
    });
  }

  return (
    <div className="mt-10 flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-pressed={online}
        className={`relative h-10 w-20 rounded-full border transition-colors ${
          online ? "border-champagne bg-champagne/20" : "border-white/10 bg-graphite"
        }`}
      >
        <span
          className={`absolute top-1 h-8 w-8 rounded-full transition-transform ${
            online ? "translate-x-11 bg-champagne" : "translate-x-1 bg-muted-grey"
          }`}
        />
      </button>
      <p className={`text-sm font-medium ${online ? "text-champagne" : "text-amber-400"}`}>
        {online ? "Boutique ouverte aux commandes" : "Boutique fermée aux commandes"}
      </p>
    </div>
  );
}
