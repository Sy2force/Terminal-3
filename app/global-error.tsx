"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="fr">
      <body className="bg-fond-papier text-noir-profond">
        <div className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center" role="alert" aria-live="assertive">
          <h1 className="font-serif text-3xl sm:text-4xl">Une erreur est survenue</h1>
          <p className="mt-3 max-w-md text-sm text-gris-chaud">
            Nous n&rsquo;avons pas pu charger l&rsquo;application. Veuillez réessayer.
          </p>
          <button
            onClick={reset}
            className="mt-8 rounded-sm bg-bordeaux-principal px-6 py-3 text-sm font-medium uppercase tracking-widest text-texte-clair transition-colors hover:bg-bordeaux-fonce"
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
