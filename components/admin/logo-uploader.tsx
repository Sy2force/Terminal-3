"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { ImageUploader } from "@/components/admin/image-uploader";
import { setLogoUrl } from "@/app/admin/store/actions";

export function LogoUploader({ initialUrl }: { initialUrl: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleUploaded(newUrl: string) {
    setUrl(newUrl);
    startTransition(async () => {
      try {
        await setLogoUrl(newUrl);
        setMessage("Logo mis à jour sur le site.");
      } catch {
        setMessage("Échec de l'enregistrement.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative h-20 w-40 shrink-0 overflow-hidden rounded-sm border border-white/10 bg-warm-black">
        <Image src={url} alt="Logo Terminal 3" fill className="object-contain p-2" />
      </div>
      <div className="flex flex-col gap-2">
        <ImageUploader bucket="brand-assets" onUploaded={handleUploaded} label="Remplacer le logo" />
        {pending && <span className="text-xs text-muted-grey">Enregistrement...</span>}
        {message && !pending && <span className="text-xs text-champagne">{message}</span>}
      </div>
    </div>
  );
}
