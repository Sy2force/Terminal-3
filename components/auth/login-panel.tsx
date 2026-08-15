"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginPanel({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) {
      setError("Impossible d'envoyer le code. Vérifiez l'adresse email.");
      return;
    }
    setStep("code");
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    setLoading(false);
    if (error) {
      setError("Code invalide ou expiré. Réessayez.");
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div>
      <span className="text-xs uppercase tracking-[0.3em] text-champagne">Mon compte</span>
      <h1 className="mt-2 font-serif text-3xl text-ivory">
        {step === "email" ? "Connexion" : "Vérification"}
      </h1>
      <p className="mt-3 text-sm text-muted-grey">
        {step === "email"
          ? "Un compte est nécessaire pour commander. Entrez votre email, nous vous envoyons un code."
          : `Entrez le code à 6 chiffres envoyé à ${email}.`}
      </p>

      {step === "email" ? (
        <form onSubmit={handleSendCode} className="mt-8 flex flex-col gap-4">
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
          {error && <p className="text-sm text-amber-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-champagne px-6 py-3 text-sm font-semibold tracking-wide text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-50"
          >
            {loading ? "Envoi..." : "Recevoir le code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm text-ivory/80">
            Code à 6 chiffres
            <input
              type="text"
              inputMode="numeric"
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="rounded-sm border border-white/10 bg-graphite px-4 py-3 tracking-[0.5em] text-ivory outline-none focus:border-champagne"
              placeholder="••••••"
            />
          </label>
          {error && <p className="text-sm text-amber-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-champagne px-6 py-3 text-sm font-semibold tracking-wide text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-50"
          >
            {loading ? "Vérification..." : "Confirmer"}
          </button>
          <button
            type="button"
            onClick={() => setStep("email")}
            className="text-xs text-muted-grey hover:text-champagne"
          >
            Changer d&rsquo;adresse email
          </button>
        </form>
      )}
    </div>
  );
}
