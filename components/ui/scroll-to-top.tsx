"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Remonter en haut"
      className="fixed bottom-6 right-6 z-40 rounded-full border border-or-principal/40 bg-noir-profond/90 p-3 text-or-principal shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:bg-noir-profund hover:text-gold-3"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
