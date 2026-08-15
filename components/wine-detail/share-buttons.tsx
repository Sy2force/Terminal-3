"use client";

import { useState } from "react";
import { Link2, Check, Share2 } from "lucide-react";

export function ShareButtons({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — no-op, the button simply won't confirm.
    }
  }

  // Sharing the page with a friend, unrelated to the store's own WhatsApp
  // ordering number — always available.
  const whatsappShareHref = `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`;

  return (
    <div className="flex items-center gap-4 pt-1 text-xs text-gris-chaud">
      <span className="flex items-center gap-1.5 uppercase tracking-widest">
        <Share2 className="h-3.5 w-3.5" aria-hidden />
        Partager
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-1.5 hover:text-bordeaux-principal"
      >
        {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Link2 className="h-3.5 w-3.5" aria-hidden />}
        {copied ? "Lien copié" : "Copier le lien"}
      </button>
      <a
        href={whatsappShareHref}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-bordeaux-principal"
      >
        WhatsApp
      </a>
    </div>
  );
}
