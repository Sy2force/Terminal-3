"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const ADMIN_EMAIL = "shayacoca20@gmail.com";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError("Mot de passe incorrect.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-noir-profond px-4">
      {/* Animated 3D background layers */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 -z-10 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-or-principal/10 blur-[120px]" />
        <div className="absolute left-1/4 top-1/3 -z-10 h-96 w-96 rounded-full bg-[#9B3444]/20 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 -z-10 h-80 w-80 rounded-full bg-or-principal/15 blur-[90px]" />
      </div>

      {/* 3D card */}
      <div className="relative w-full max-w-md perspective-1000">
        <div className="relative overflow-hidden rounded-xl border border-or-principal/20 bg-black/60 p-8 shadow-2xl shadow-or-principal/20 backdrop-blur-md">
          {/* Decorative gold line */}
          <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-or-principal to-transparent" />

          <div className="flex flex-col items-center">
            <div className="relative mb-6 h-32 w-48 [transform:rotateX(15deg)] drop-shadow-2xl">
              <Image
                src="/images/terminal-3/brand/logo/terminal-3-logo-sombre-01.png"
                alt="Terminal 3"
                fill
                unoptimized
                className="object-contain"
                priority
              />
            </div>

            <h1 className="font-serif text-3xl text-ivory">Espace Admin</h1>
            <p className="mt-2 text-center text-sm text-gris-chaud">
              Accédez au tableau de bord de Terminal 3
            </p>
            <p className="mt-1 text-xs text-or-principal/80">{ADMIN_EMAIL}</p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm text-ivory/80">
              Mot de passe
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-sm border border-white/10 bg-graphite px-4 py-3 text-ivory outline-none focus:border-or-principal"
                placeholder="••••••"
              />
            </label>
            {error && <p className="text-sm text-amber-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-full bg-or-principal px-6 py-3 text-sm font-semibold tracking-wide text-obsidian transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <a
            href="/"
            className="mt-6 block text-center text-xs text-gris-chaud hover:text-or-principal"
          >
            Retour au site
          </a>
        </div>
      </div>
    </main>
  );
}
