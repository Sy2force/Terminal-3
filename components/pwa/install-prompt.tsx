"use client";

import { useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || "standalone" in window.navigator) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setShow(false);
    setDeferred(null);
  }, [deferred]);

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 rounded-sm border border-[#C6A15B]/30 bg-[#1C1A16] p-4 shadow-2xl shadow-black/40 sm:bottom-6">
      <p className="text-sm text-[#F7F0E4]">Installer Terminal 3 comme application sur votre appareil.</p>
      <div className="mt-3 flex gap-3">
        <button
          onClick={install}
          className="flex-1 rounded-sm bg-[#C6A15B] px-3 py-2 text-sm font-semibold text-[#151411] hover:bg-[#D9B87A]"
        >
          Installer
        </button>
        <button
          onClick={() => setShow(false)}
          className="flex-1 rounded-sm border border-white/10 px-3 py-2 text-sm text-[#F7F0E4] hover:bg-white/5"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}
