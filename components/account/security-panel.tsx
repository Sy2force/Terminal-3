"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SecurityPanel() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (password.length < 8) {
      setMessage({ type: "error", text: "Le mot de passe doit contenir au moins 8 caractères." });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Les mots de passe ne correspondent pas." });
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: "Impossible de modifier le mot de passe. Reconnectez-vous et réessayez." });
      return;
    }
    setMessage({ type: "success", text: "Mot de passe mis à jour." });
    setPassword("");
    setConfirmPassword("");
  }

  async function handleLogoutEverywhere() {
    setLoggingOutAll(true);
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "global" });
    setLoggingOutAll(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
        <h2 className="font-serif text-lg text-ivory">Changer mon mot de passe</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-ivory/80">
            Nouveau mot de passe
            <input
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-sm border border-white/10 bg-graphite px-4 py-3 text-ivory outline-none focus:border-champagne"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-ivory/80">
            Confirmer
            <input
              type="password"
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-sm border border-white/10 bg-graphite px-4 py-3 text-ivory outline-none focus:border-champagne"
            />
          </label>
        </div>
        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-champagne" : "text-amber-400"}`}>
            {message.text}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-fit rounded-full bg-champagne px-6 py-2.5 text-sm font-semibold text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-50"
        >
          {loading ? "..." : "Mettre à jour"}
        </button>
      </form>

      <div className="border-t border-white/10 pt-6">
        <h2 className="font-serif text-lg text-ivory">Sessions</h2>
        <p className="mt-2 text-sm text-muted-grey">
          Vous pouvez vous déconnecter de tous les appareils sur lesquels vous êtes actuellement
          connecté, y compris celui-ci.
        </p>
        <button
          type="button"
          onClick={handleLogoutEverywhere}
          disabled={loggingOutAll}
          className="mt-3 rounded-full border border-red-400/40 px-6 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-400/10 disabled:opacity-50"
        >
          {loggingOutAll ? "..." : "Se déconnecter de tous les appareils"}
        </button>
      </div>
    </div>
  );
}
