"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (password.length < 8) {
      setMessage("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/compte");
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <span className="text-xs uppercase tracking-[0.3em] text-champagne">Mon compte</span>
      <h1 className="mt-2 font-serif text-3xl text-ivory">Nouveau mot de passe</h1>

      {!ready ? (
        <p className="mt-6 text-sm text-ivory/70">Vérification du lien en cours…</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm text-ivory/80">
            Nouveau mot de passe
            <input
              type="password"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-sm border border-white/10 bg-graphite px-4 py-3 text-ivory outline-none focus:border-champagne"
              placeholder="••••••••"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-ivory/80">
            Confirmer le mot de passe
            <input
              type="password"
              minLength={8}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="rounded-sm border border-white/10 bg-graphite px-4 py-3 text-ivory outline-none focus:border-champagne"
              placeholder="••••••••"
            />
          </label>
          {message && <p className="text-sm text-amber-400">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-champagne px-6 py-3 text-sm font-semibold tracking-wide text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-50"
          >
            {loading ? "Mise à jour…" : "Définir le mot de passe"}
          </button>
        </form>
      )}
    </div>
  );
}
