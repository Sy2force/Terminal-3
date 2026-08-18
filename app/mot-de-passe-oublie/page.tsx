"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordResetAction } from "./actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const res = await requestPasswordResetAction(email);
    setLoading(false);
    setResult(
      res.success
        ? { success: true, message: "Un email de réinitialisation a été envoyé si l'adresse existe." }
        : { success: false, message: res.error ?? "Une erreur est survenue." },
    );
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <span className="text-xs uppercase tracking-[0.3em] text-champagne">Mon compte</span>
      <h1 className="mt-2 font-serif text-3xl text-ivory">Mot de passe oublié</h1>
      <p className="mt-3 text-sm text-muted-grey">
        Indiquez votre adresse email pour recevoir un lien de réinitialisation.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm text-ivory/80">
          Email
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-sm border border-white/10 bg-graphite px-4 py-3 text-ivory outline-none focus:border-champagne"
            placeholder="vous@exemple.com"
          />
        </label>
        {result && (
          <p className={`text-sm ${result.success ? "text-champagne" : "text-amber-400"}`}>
            {result.message}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-champagne px-6 py-3 text-sm font-semibold tracking-wide text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-50"
        >
          {loading ? "Envoi…" : "Envoyer le lien"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ivory/70">
        <Link href="/login" className="text-champagne hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
