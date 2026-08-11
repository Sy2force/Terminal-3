"use client";

import { useEffect, useState } from "react";

/**
 * Purely presentational countdown. The server is always the authority on
 * whether a promotion is valid — this component never decides validity, it
 * only renders the remaining time until `endAt` for UX purposes. Even if a
 * visitor manipulates their local clock, checkout/reservation re-validates
 * against the database, so no fake urgency can be created client-side.
 */
export function Countdown({ endAt }: { endAt: string }) {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    const end = new Date(endAt).getTime();
    const tick = () => setRemainingMs(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endAt]);

  if (remainingMs === null) {
    return <span aria-hidden className="opacity-0">00J 00H 00M</span>;
  }

  if (remainingMs <= 0) {
    return (
      <span role="status" className="text-sm text-muted-grey">
        Offre terminée
      </span>
    );
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-label={`Temps restant : ${days} jours, ${hours} heures, ${minutes} minutes`}
      className="flex items-center gap-3 font-sans text-sm tabular-nums tracking-wide text-ivory"
    >
      <TimeUnit value={days} label="J" />
      <span aria-hidden className="text-champagne">:</span>
      <TimeUnit value={hours} label="H" />
      <span aria-hidden className="text-champagne">:</span>
      <TimeUnit value={minutes} label="MIN" />
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex items-baseline gap-1">
      <span className="text-lg font-semibold text-champagne">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] uppercase text-muted-grey">{label}</span>
    </span>
  );
}
