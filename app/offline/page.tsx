"use client";

import { RefreshCcw, WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-16 text-center">
      <WifiOff className="h-12 w-12 text-ivory/40" aria-hidden />
      <h1 className="mt-6 font-serif text-2xl text-ivory">Vous êtes hors connexion</h1>
      <p className="mt-3 max-w-md text-sm text-ivory/60">
        Terminal 3 a besoin d’une connexion pour afficher les produits, mettre à jour les prix et enregistrer une commande.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/10 bg-obsidian px-5 py-2.5 text-sm text-ivory transition-colors hover:border-champagne hover:text-champagne"
        >
          <RefreshCcw className="h-4 w-4" aria-hidden />
          Réessayer
        </button>
      </div>
      <p className="mt-6 text-xs text-ivory/40">
        Votre panier en cours est conservé sur cet appareil, mais son envoi nécessite une connexion et une validation serveur.
      </p>
    </main>
  );
}
