"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    let controllerChanged = false;
    function onControllerChange() {
      if (controllerChanged) return;
      controllerChanged = true;
      // Rechargement silencieux dès que le SW actif change, sauf en formulaire.
      const inForm = ["/checkout", "/commande", "/admin"].some((p) => window.location.pathname.startsWith(p));
      if (!inForm) window.location.reload();
    }

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        reg.addEventListener("updatefound", () => {
          const next = reg.installing;
          if (!next) return;
          next.addEventListener("statechange", () => {
            if (next.state === "installed" && navigator.serviceWorker.controller) {
              // Nouvelle version en attente. On attend la fermeture d’onglet.
              // On ne force pas de refresh au milieu d’un parcours.
            }
          });
        });
      })
      .catch((err) => {
        console.error("SW registration failed:", err);
      });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  return null;
}
