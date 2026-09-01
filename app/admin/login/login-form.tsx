import Image from "next/image";

export interface LoginFormProps {
  initialError: string | null;
}

export function LoginForm({ initialError }: LoginFormProps) {
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
                priority
                sizes="(max-width: 420px) 40vw, 170px"
                className="object-contain"
              />
            </div>

            <h1 className="text-center font-serif text-2xl text-[#F7F0E4] sm:text-3xl">
              Administration Terminal 3
            </h1>
            <p className="mt-2 text-center text-sm text-[#71695F]">
              Saisissez le mot de passe pour accéder à l&apos;espace administrateur
            </p>
          </div>

          <form action="/api/admin/login" method="POST" className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm text-[#F7F0E4]/80">
              Mot de passe
              <input
                type="password"
                name="password"
                required
                minLength={1}
                className="w-full rounded-sm border border-white/10 bg-[#2C2924] px-4 py-3 text-[#F7F0E4] outline-none transition-colors focus:border-[#C6A15B]"
                placeholder="••••••"
                autoComplete="current-password"
              />
            </label>

            {initialError && (
              <p role="alert" className="rounded-sm bg-[#9B3444]/10 px-3 py-2 text-sm text-[#9B3444]">
                {initialError}
              </p>
            )}

            <button
              type="submit"
              className="mt-2 w-full rounded-sm bg-[#C6A15B] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-[#151411] transition-all hover:bg-[#D9B87A] active:scale-[0.98]"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
