"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { logAdminLogin } from "@/app/admin/login/actions";
import { Eye, EyeOff } from "lucide-react";

const REMEMBER_EMAIL_KEY = "terminal3.admin.email";

export interface LoginFormProps {
  initialError: string | null;
}

export function LoginForm({ initialError }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(() =>
    typeof window !== "undefined" ? window.localStorage.getItem(REMEMBER_EMAIL_KEY) ?? "" : "",
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(
    () => typeof window !== "undefined" ? window.localStorage.getItem(REMEMBER_EMAIL_KEY) !== null : false,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setLoading(false);

      if (signInError || !data.user) {
        setError("Email ou mot de passe incorrect.");
        return;
      }

      if (typeof window !== "undefined") {
        if (remember) {
          window.localStorage.setItem(REMEMBER_EMAIL_KEY, email);
        } else {
          window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
        }
      }

      await logAdminLogin();
      router.push("/admin");
      router.refresh();
    },
    [email, password, remember, router],
  );

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#151411] px-4">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-1/2 top-1/2 -z-10 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C6A15B]/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[420px]">
        <div className="relative overflow-hidden rounded-xl border border-[#C6A15B]/20 bg-[#1C1A16] p-6 shadow-2xl shadow-[#C6A15B]/10 sm:p-8">
          <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#C6A15B] to-transparent" />

          <div className="flex flex-col items-center">
            <div className="relative mb-4 h-20 w-32 drop-shadow-2xl">
              <Image
                src="/images/terminal-3/brand/logo/terminal-3-logo-sombre-01.png"
                alt="Terminal 3"
                fill
                unoptimized
                priority
                className="object-contain"
              />
            </div>

            <h1 className="text-center font-serif text-2xl text-[#F7F0E4] sm:text-3xl">
              Administration Terminal 3
            </h1>
            <p className="mt-2 text-center text-sm text-[#71695F]">
              Connectez-vous pour gérer la boutique
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm text-[#F7F0E4]/80">
              Email
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-sm border border-white/10 bg-[#2C2924] px-4 py-3 text-[#F7F0E4] outline-none transition-colors focus:border-[#C6A15B]"
                placeholder="vous@exemple.com"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#F7F0E4]/80">
              Mot de passe
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-sm border border-white/10 bg-[#2C2924] px-4 py-3 pr-11 text-[#F7F0E4] outline-none transition-colors focus:border-[#C6A15B]"
                  placeholder="••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71695F] hover:text-[#C6A15B]"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-2 text-[#F7F0E4]/80">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-white/10 bg-[#2C2924] text-[#C6A15B] focus:ring-[#C6A15B]"
                />
                Se souvenir de moi
              </label>
              <Link
                href="/mot-de-passe-oublie?redirect=/admin"
                className="text-[#C6A15B] hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {error && (
              <p role="alert" className="rounded-sm bg-[#9B3444]/10 px-3 py-2 text-sm text-[#9B3444]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-sm bg-[#C6A15B] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-[#151411] transition-all hover:bg-[#D9B87A] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <Link
            href="/"
            className="mt-6 block text-center text-xs text-[#71695F] hover:text-[#C6A15B]"
          >
            Retour à la boutique
          </Link>
        </div>
      </div>
    </main>
  );
}
