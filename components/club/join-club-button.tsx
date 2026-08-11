"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinClub } from "@/app/club/actions";

export function JoinClubButton({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  if (!isLoggedIn) {
    return (
      <button
        type="button"
        onClick={() => router.push("/login?redirect=/club")}
        className="rounded-full bg-champagne px-10 py-3 text-sm font-semibold tracking-wide text-obsidian transition-colors hover:bg-soft-gold"
      >
        Se connecter pour rejoindre
      </button>
    );
  }

  if (joined) {
    return (
      <p className="font-serif text-lg text-champagne">
        Bienvenue dans le Club Terminal 3 ✓
      </p>
    );
  }

  function handleJoin() {
    setError(null);
    startTransition(async () => {
      const result = await joinClub();
      if (!result.success) {
        setError(result.error ?? "Une erreur est survenue.");
        return;
      }
      setJoined(true);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleJoin}
        disabled={isPending}
        data-analytics-event="club_signup_started"
        className="rounded-full bg-champagne px-10 py-3 text-sm font-semibold tracking-wide text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-50"
      >
        {isPending ? "..." : "Rejoindre gratuitement"}
      </button>
      {error && <p className="text-sm text-amber-400">{error}</p>}
    </div>
  );
}
