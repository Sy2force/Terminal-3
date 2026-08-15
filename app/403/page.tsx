import Link from "next/link";
import { ShieldAlert, Home, UserCircle, Mail } from "lucide-react";

export const metadata = {
  title: "Accès refusé | Terminal 3",
  robots: { index: false, follow: false },
};

export default function ForbiddenPage() {
  return (
    <main className="grid min-h-[80dvh] place-items-center px-4 py-12">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <ShieldAlert className="h-16 w-16 text-or-principal" aria-hidden />
        </div>
        <h1 className="font-serif text-3xl text-texte-clair sm:text-4xl">
          Accès refusé
        </h1>
        <p className="mt-4 text-sm text-texte-clair/70">
          Vous n&apos;avez pas l&apos;autorisation d&apos;accéder à cette page. Si vous pensez que cela est une erreur, contactez l&apos;assistance.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] border border-or-principal bg-or-principal px-6 text-sm font-semibold text-noir-profond transition-colors hover:bg-gold-3"
          >
            <Home className="h-4 w-4" aria-hidden />
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/compte"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] border border-or-principal/30 bg-transparent px-6 text-sm font-semibold text-texte-clair transition-colors hover:bg-or-principal/10 hover:text-or-principal"
          >
            <UserCircle className="h-4 w-4" aria-hidden />
            Mon compte
          </Link>
        </div>
        <a
          href="mailto:contact@terminal3.co.il"
          className="mt-6 inline-flex items-center gap-2 text-sm text-or-principal hover:underline"
        >
          <Mail className="h-4 w-4" aria-hidden />
          Contacter l&apos;assistance
        </a>
      </div>
    </main>
  );
}
