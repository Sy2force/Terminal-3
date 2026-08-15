"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-fond-papier px-6 py-24 text-center" role="alert" aria-live="assertive">
      <h1 className="font-serif text-3xl text-noir-profond sm:text-4xl">
        Une erreur est survenue
      </h1>
      <p className="mt-3 max-w-md text-sm text-gris-chaud">
        Nous n&rsquo;avons pas pu afficher cette page. Vous pouvez réessayer ou revenir à l&rsquo;accueil.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-sm bg-bordeaux-principal px-6 py-3 text-sm font-medium uppercase tracking-widest text-texte-clair transition-colors hover:bg-bordeaux-fonce"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="rounded-sm border border-brun-cave/25 px-6 py-3 text-sm font-medium uppercase tracking-widest text-noir-profond transition-colors hover:border-bordeaux-principal hover:text-bordeaux-principal"
        >
          Retour à l&rsquo;accueil
        </Link>
      </div>
    </div>
  );
}
