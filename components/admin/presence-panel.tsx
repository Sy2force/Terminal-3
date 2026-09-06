"use client";

import Link from "next/link";
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
    <div className="space-y-4">
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

      <div className="rounded-sm border border-beige-fonce bg-white p-6">
        <h2 className="font-serif text-lg text-noir-profond">Clients connectés</h2>
        <p className="mt-1 text-xs text-gris-chaud">
          Seuls les utilisateurs authentifiés sont listés. Les visiteurs anonymes restent
          un compteur agrégé.
        </p>
        {data.onlineUsers.length === 0 ? (
          <p className="mt-4 text-sm text-gris-chaud">Aucun client connecté actuellement.</p>
        ) : (
          <ul className="mt-4 divide-y divide-beige-fonce">
            {data.onlineUsers.map((user) => (
              <li key={user.userId} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="text-sm font-medium text-noir-profond">{user.displayName}</p>
                  <p className="text-xs text-gris-chaud">
                    {user.email ?? "—"} ·{" "}
                    {user.accountType === "business" ? "Professionnel" : "Particulier"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gris-chaud">
                    Vu à{" "}
                    {new Date(user.lastSeenAt).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Jerusalem",
                    })}
                  </span>
                  <Link
                    href={`/admin/clients/${user.userId}`}
                    className="text-xs text-or-principal hover:text-soft-gold"
                  >
                    Fiche
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
