"use client";

import { useEffect, useState } from "react";
import { fetchPresenceStats } from "@/app/presence/actions";
import type { PresenceStats } from "@/lib/data/presence";

export function PresencePanel({ initial }: { initial: PresenceStats }) {
  const [stats, setStats] = useState<PresenceStats | null>(initial);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const tick = async () => {
      try {
        const next = await fetchPresenceStats();
        if (mounted) {
          setStats(next);
          setError(null);
        }
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e.message : "Indisponible");
          // Do not overwrite the last known value with zero.
        }
      }
    };

    const interval = setInterval(tick, 60_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (error && !stats) {
    return (
      <div className="rounded-sm border border-bordeaux-principal/30 bg-bordeaux-principal/10 p-4 text-sm text-bordeaux-principal">
        Impossible de charger la présence en ligne. {error}
      </div>
    );
  }

  const data = stats ?? initial;

  return (
    <div className="rounded-sm border border-beige-fonce bg-white p-6">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-3xl font-serif text-or-principal">{data.total}</p>
          <p className="mt-1 text-xs uppercase tracking-widest text-noir-profond/60">
            Sessions actives
          </p>
        </div>
        <div>
          <p className="text-3xl font-serif text-or-principal">{data.anonymousSessions}</p>
          <p className="mt-1 text-xs uppercase tracking-widest text-noir-profond/60">
            Anonymes
          </p>
        </div>
        <div>
          <p className="text-3xl font-serif text-or-principal">{data.authenticatedUsers}</p>
          <p className="mt-1 text-xs uppercase tracking-widest text-noir-profond/60">
            Clients connectés
          </p>
        </div>
      </div>
      <p className="mt-4 text-right text-xs text-gris-chaud">
        Dernier rafraîchissement :{" "}
        {new Date(data.refreshedAt).toLocaleTimeString("fr-FR", {
          timeZone: "Asia/Jerusalem",
        })}
      </p>
      {error && (
        <p className="mt-3 text-xs text-bordeaux-principal">
          Rafraîchissement en échec : {error}
        </p>
      )}
    </div>
  );
}
